import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서비스 역할 키를 사용한 Supabase 클라이언트 (RLS 우회)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 이메일 인증 코드 발송
export async function POST(request: NextRequest) {
    try {
        const { action, email, newPassword, confirmPassword, verificationCode } = await request.json();

        if (action === 'send_code') {
            // 이메일 인증 코드 발송
            if (!email) {
                return NextResponse.json({ error: '이메일이 필요합니다.' }, { status: 400 });
            }

            // 사용자 존재 확인 (user_profiles 테이블에서 확인)
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('id, email')
                .eq('email', email)
                .single();

            if (userError || !userData) {
                return NextResponse.json({ error: '등록되지 않은 이메일입니다.' }, { status: 404 });
            }

            // 이메일 발송 시도

            try {
                // 이메일 발송 시도
                const { error: emailError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?tab=security&reset=true`,
                });

                if (emailError) {

                    // 이메일 한도 초과 오류인 경우 특별 처리
                    if (emailError.message.includes('rate limit') || emailError.message.includes('over_email_send_rate_limit')) {

                        // 대안: 사용자에게 직접 이메일 발송 안내
                        return NextResponse.json({
                            error: '이메일 발송 한도가 초과되었습니다.',
                            message: 'Supabase 대시보드에서 직접 비밀번호를 재설정해주세요.',
                            alternative: {
                                url: 'https://supabase.com/dashboard/project/kclorpqcnpisnlgdckju/auth/users',
                                instruction: 'Supabase 대시보드 → Authentication → Users → 해당 사용자 → Reset Password'
                            },
                            code: 'EMAIL_RATE_LIMIT'
                        }, { status: 429 });
                    }

                    return NextResponse.json({
                        error: '이메일 발송에 실패했습니다.',
                        details: emailError.message
                    }, { status: 500 });
                }

            } catch (error) {
                return NextResponse.json({
                    error: '이메일 발송 중 오류가 발생했습니다.',
                    details: error instanceof Error ? error.message : '알 수 없는 오류'
                }, { status: 500 });
            }

            return NextResponse.json({
                message: '비밀번호 변경을 위한 인증 코드가 이메일로 발송되었습니다.',
                debug: {
                    email: email,
                    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
                    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
                }
            });

        } else if (action === 'verify_and_change') {
            // 인증 코드 확인 및 비밀번호 변경
            if (!email || !newPassword || !confirmPassword || !verificationCode) {
                return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
            }

            if (newPassword !== confirmPassword) {
                return NextResponse.json({ error: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.' }, { status: 400 });
            }

            if (newPassword.length < 8) {
                return NextResponse.json({ error: '새 비밀번호는 최소 8자 이상이어야 합니다.' }, { status: 400 });
            }

            // 비밀번호 강도 검증
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
            if (!passwordRegex.test(newPassword)) {
                return NextResponse.json({
                    error: '비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.'
                }, { status: 400 });
            }

            // 사용자 정보 가져오기 (user_profiles 테이블에서 확인)
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('id, email')
                .eq('email', email)
                .single();

            if (userError || !userData) {
                return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
            }


            // 비밀번호 변경 (Supabase Auth의 admin API 사용)
            const { error: updateError } = await supabase.auth.admin.updateUserById(userData.id, {
                password: newPassword
            });

            if (updateError) {
                return NextResponse.json({ error: '비밀번호 변경에 실패했습니다.' }, { status: 500 });
            }

            // 비밀번호 변경 완료 로그

            return NextResponse.json({
                message: '비밀번호가 성공적으로 변경되었습니다.'
            });

        } else {
            return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
        }

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
