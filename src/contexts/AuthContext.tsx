'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile, UserProfileUpdate, UserRegistrationData } from '@/types/user';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signUp: (registrationData: UserRegistrationData) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<{ error: Error | null }>;
    updateProfile: (updates: UserProfileUpdate) => Promise<{ error: Error | null }>;
    refreshProfile: () => Promise<void>;
    isAdmin: () => boolean;
    isSuspended: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 초기 세션 확인
        const getInitialSession = async () => {
            try {
                console.log('AuthContext - 세션 확인 시작');
                const { data: { session }, error } = await supabase.auth.getSession();
                console.log('AuthContext - 세션 결과:', { session: !!session, error });

                if (error) {
                    console.log('AuthContext - 세션 오류:', error);
                    setUser(null);
                    setProfile(null);
                } else if (session?.user) {
                    console.log('AuthContext - 사용자 로그인됨:', session.user.id);
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    console.log('AuthContext - 세션 없음');
                    setUser(null);
                    setProfile(null);
                }
            } catch (error) {
                console.log('AuthContext - 세션 확인 오류:', error);
                setUser(null);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {

                // 비밀번호 재설정 이벤트 처리
                if (event === 'PASSWORD_RECOVERY') {
                    // 세션을 유지하면서 비밀번호 재설정 모드로 전환
                    if (session?.user) {
                        setUser(session.user);
                        await fetchProfile(session.user.id);
                    }
                } else {
                    // 일반적인 상태 업데이트
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    } else {
                        setProfile(null);
                    }
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

            const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as { data: UserProfile | null; error: Error | null };

            if (error) {
                setProfile(null);
                return;
            }

            setProfile(data);
        } catch {
            setProfile(null);
        }
    };

    const signUp = async (registrationData: UserRegistrationData) => {
        try {

            // Supabase Auth에 사용자 등록 (raw_user_meta_data 활용)
            const { data, error } = await supabase.auth.signUp({
                email: registrationData.email,
                password: registrationData.password,
                options: {
                    data: {
                        student_id: registrationData.student_id,
                        nickname: registrationData.nickname,
                        name: registrationData.name,
                        birth_date: registrationData.birth_date,
                        major: registrationData.major,
                        grade: registrationData.grade,
                    },
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
                }
            });

            if (error) {
                return { error };
            }

            if (!data.user) {
                return { error: new Error('사용자 등록에 실패했습니다.') };
            }


            // 이메일 인증이 필요한 경우
            if (!data.user.email_confirmed_at) {
            } else {
            }

            // 사용자 프로필 생성은 API를 통해 처리
            try {
                const response = await fetch('/api/create-user-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: data.user.id,
                        profileData: {
                            student_id: registrationData.student_id || '',
                            nickname: registrationData.nickname || '',
                            name: registrationData.name || '',
                            email: data.user.email,
                            birth_date: registrationData.birth_date ? new Date(registrationData.birth_date) : null,
                            major: registrationData.major || '',
                            grade: registrationData.grade || null
                        }
                    }),
                });

                const result = await response.json();

                if (result.success) {
                } else {
                }
            } catch (profileErr) {
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error };
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
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
            return { error: error as Error };
        }
    };

    const updateProfile = async (updates: UserProfileUpdate) => {
        try {
            if (!user) {
                return { error: new Error('사용자가 로그인되지 않았습니다.') };
            }

            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            const result = await response.json();

            if (!response.ok) {
                return { error: new Error(result.error || '프로필 업데이트에 실패했습니다.') };
            }

            // 프로필 새로고침
            await fetchProfile(user.id);
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    const isAdmin = () => {
        return profile?.role === 'admin' || profile?.role === 'super_admin';
    };

    const isSuspended = () => {
        return profile?.status === 'suspended' || profile?.status === 'banned';
    };

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
        isAdmin,
        isSuspended,
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