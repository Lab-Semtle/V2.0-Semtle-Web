import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        try {
            // Supabase 클라이언트 생성
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            // 코드를 세션으로 교환
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('Auth callback error:', error)
                return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=auth_failed`)
            }

            if (data.user) {
                console.log('User authenticated:', data.user.id, data.user.email)
            }
        } catch (error) {
            console.error('Callback error:', error)
            return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_failed`)
        }
    }

    // 이메일 인증 후 로그인 페이지로 리다이렉트
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?verified=true`)
}
