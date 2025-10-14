import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 환경 변수 확인
if (!supabaseUrl || !supabaseAnonKey) {
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// 디버깅을 위한 세션 모니터링
if (typeof window !== 'undefined') {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Supabase Auth State Change:', event, session);
        if (session) {
            console.log('세션 설정됨:', session.user.id);
        } else {
            console.log('세션 없음');
        }
    });
}

