import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (서비스 역할)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        // 1. auth.users에서 이메일 인증된 모든 사용자 조회
        const { data: authUsers, error: authError } = await supabase
            .from('auth.users')
            .select('id, email, email_confirmed_at')
            .not('email_confirmed_at', 'is', null);

        if (authError) {
            console.error('Error fetching auth users:', authError);
            return NextResponse.json(
                { error: '인증된 사용자 조회 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        if (!authUsers || authUsers.length === 0) {
            return NextResponse.json({
                success: true,
                message: '동기화할 인증된 사용자가 없습니다.',
                count: 0
            });
        }

        // 2. user_profiles에서 email_verified 업데이트
        const { data: updateResult, error: updateError } = await supabase
            .from('user_profiles')
            .update({ email_verified: true })
            .in('email', authUsers.map(user => user.email));

        if (updateError) {
            console.error('Error updating user profiles:', updateError);
            return NextResponse.json(
                { error: '사용자 프로필 업데이트 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        // 3. 결과 확인
        const { data: verifiedUsers, error: checkError } = await supabase
            .from('user_profiles')
            .select('email, email_verified')
            .eq('email_verified', true);

        return NextResponse.json({
            success: true,
            message: `이메일 인증 상태가 동기화되었습니다. (${authUsers.length}명)`,
            count: authUsers.length,
            verifiedUsers: verifiedUsers
        });

    } catch (error) {
        console.error('Sync all verified error:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

