'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    student_id: string;
    nickname: string;
    name: string;
    email: string;
    birth_date?: string;
    status: boolean;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signUp: (email: string, password: string, profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'status' | 'email_verified'>) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<{ error: any }>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 초기 세션 확인
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        getInitialSession();

        // 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // 상태 업데이트를 즉시 실행
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            // 타임아웃 설정 (5초)
            const profilePromise = supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('프로필 가져오기 시간 초과')), 5000)
            );

            const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

            if (error) {
                setProfile(null);
                return;
            }

            setProfile(data);
        } catch (error) {
            setProfile(null);
        }
    };

    const signUp = async (email: string, password: string, profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'status' | 'email_verified'>) => {
        try {
            // Supabase Auth에 사용자 등록 (raw_user_meta_data 활용)
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        student_id: profileData.student_id,
                        nickname: profileData.nickname,
                        name: profileData.name,
                        birth_date: profileData.birth_date,
                    }
                }
            });

            if (error) {
                return { error };
            }

            if (!data.user) {
                return { error: { message: '사용자 등록에 실패했습니다.' } };
            }

            // 사용자 프로필 생성 (API Route 사용)
            const profileResponse = await fetch('/api/create-user-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: data.user.id,
                    profileData,
                }),
            });

            const profileResult = await profileResponse.json();

            if (!profileResponse.ok) {
                return { error: { message: profileResult.error || '프로필 생성 중 오류가 발생했습니다.' } };
            }

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error };
            }

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const signOut = async () => {
        try {
            // 먼저 로컬 상태를 즉시 초기화 (UI 반응성 향상)
            setUser(null);
            setProfile(null);

            // Supabase 로그아웃
            const { error } = await supabase.auth.signOut();

            if (error) {
                // Supabase 로그아웃 실패해도 로컬 상태는 이미 초기화됨
                return { error };
            }

            return { error: null };
        } catch (error) {
            // 예외 발생해도 로컬 상태는 이미 초기화됨
            return { error };
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        try {
            if (!user) {
                return { error: { message: '사용자가 로그인되지 않았습니다.' } };
            }

            const { error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) {
                return { error };
            }

            // 프로필 새로고침
            await fetchProfile(user.id);
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}