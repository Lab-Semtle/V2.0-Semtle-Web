'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { UserProfile, UserProfileUpdate, UserRegistrationData } from '@/types/user';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // 재시도 로직 (최대 2번)
        if (retryCount < 2) {
          setTimeout(() => {
            fetchProfile(userId, retryCount + 1);
          }, 1000 * (retryCount + 1)); // 1초, 2초 간격으로 재시도
          return;
        }

        // 최종 실패 시에도 사용자는 유지하고 프로필만 null로 설정
        setProfile(null);
        return;
      }

      setProfile(data);

      if (data?.status === 'suspended') {
        const now = new Date();
        const suspendedUntil = data.suspended_until ? new Date(data.suspended_until) : null;

        if (!suspendedUntil || now < suspendedUntil) {
          await signOut();
          window.location.href = '/auth/login?suspended=true';
          return;
        }

        if (now >= suspendedUntil) {
          await supabase
            .from('user_profiles')
            .update({ status: 'active', suspended_until: null })
            .eq('id', userId);

          setProfile({ ...data, status: 'active', suspended_until: null });
        }
      }
    } catch {
      // 재시도 로직 (최대 2번)
      if (retryCount < 2) {
        setTimeout(() => {
          fetchProfile(userId, retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }

      // 최종 실패 시에도 사용자는 유지
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const getInitialSession = async () => {
      try {
        // 최대 5초 후에는 강제로 로딩 완료
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setLoading(false);
          }
        }, 5000);

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && isMounted) {
          setUser(session.user);
          // 프로필 로딩은 비동기로 처리하되, 사용자 정보는 즉시 설정
          fetchProfile(session.user.id).catch(() => {
            // 프로필 로드 실패 시 무시
          });
        } else if (isMounted) {
          // 세션이 없는 경우에도 로딩 완료
          setUser(null);
          setProfile(null);
        }
      } catch {
        // 세션 초기화 에러 시 무시
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);

        if (session?.user) {
          // 프로필 로딩은 비동기로 처리하되, 사용자 정보는 즉시 설정
          fetchProfile(session.user.id).catch(() => {
            // 프로필 로드 실패 시 무시
          });
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (registrationData: UserRegistrationData) => {
    try {
      const { error } = await supabase.auth.signUp({
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
          }
        }
      });

      if (error) return { error };
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error };
      }
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      const { error } = await supabase.auth.signOut();
      if (error) return { error };
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateProfile = async (updates: UserProfileUpdate) => {
    try {
      if (!user) return { error: new Error('사용자가 로그인되지 않았습니다.') };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) return { error };
      setProfile(data);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, 0); // 재시도 로직 포함
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