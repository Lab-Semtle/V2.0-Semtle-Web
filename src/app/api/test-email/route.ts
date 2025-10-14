import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();


        if (!email) {
            return NextResponse.json(
                { error: '이메일이 필요합니다.' },
                { status: 400 }
            );
        }

        // 서비스 역할 키를 사용하여 Supabase 클라이언트 생성
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );


        // 사용자 조회
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
            return NextResponse.json(
                { error: '사용자 조회 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        const user = users.users.find(u => u.email === email);
        if (!user) {
            return NextResponse.json(
                { error: '사용자를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }


        // 사용자 상태에 따라 다른 타입의 링크 생성
        let linkType = 'signup';
        if (user.email_confirmed_at) {
            // 이미 인증된 사용자에게는 recovery 링크 생성
            linkType = 'recovery';
        }


        // 이메일 인증 링크 생성
        const { data, error } = await supabase.auth.admin.generateLink({
            type: linkType as any,
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
            }
        });


        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '이메일이 재전송되었습니다.',
            data
        });

    } catch (error) {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
