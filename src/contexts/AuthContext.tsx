'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

  const fetchProfile = async (userId: string) => {
    try {
      console.log('프로필 가져오기 시작:', userId);
      
      const promise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('Promise 생성됨:', promise);
      
      const { data, error } = await promise;

      console.log('프로필 조회 결과:', { data, error });

      if (error) {
        console.error('프로필 조회 에러:', error);
        throw error;
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
    } catch (error) {
      console.error('프로필 가져오기 실패:', error);
      throw error;
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('세션 초기화 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (registrationData: UserRegistrationData) => {
    try {
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
          }
        }
      });

      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('signIn 시작');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('signInWithPassword 결과:', { user: !!data.user, error });

      if (error) {
        console.log('signIn 에러 반환:', error);
        return { error };
      }
      if (data.user) {
        console.log('프로필 가져오기 호출 전');
        await fetchProfile(data.user.id);
        console.log('프로필 가져오기 호출 후');
      }
      console.log('signIn 성공 반환');
      return { error: null };
    } catch (error) {
      console.error('signIn 예외:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      const { error } = await supabase.auth.signOut();
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
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