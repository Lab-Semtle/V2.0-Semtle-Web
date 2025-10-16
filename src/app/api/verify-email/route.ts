import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (서비스 역할)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: '이메일이 필요합니다.' },
                { status: 400 }
            );
        }

        // 1. auth.users에서 이메일 인증 상태 확인
        const { data: authUser, error: authError } = await supabase
            .from('auth.users')
            .select('id, email, email_confirmed_at')
            .eq('email', email)
            .single();

        if (authError || !authUser) {
            return NextResponse.json(
                { error: '사용자를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 2. 이메일이 인증되었는지 확인
        if (!authUser.email_confirmed_at) {
            return NextResponse.json(
                { error: '이메일이 아직 인증되지 않았습니다.' },
                { status: 400 }
            );
        }

        // 3. user_profiles에서 email_verified 업데이트
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ email_verified: true })
            .eq('email', email);

        if (updateError) {
            return NextResponse.json(
                { error: '프로필 업데이트 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '이메일 인증이 완료되었습니다.',
            email: email
        });

    } catch {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}







