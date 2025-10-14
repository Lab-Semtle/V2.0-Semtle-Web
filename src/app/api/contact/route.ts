import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { name, email, phone, subject, message } = await request.json();

        // 필수 필드 검증
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: '필수 필드가 누락되었습니다.' },
                { status: 400 }
            );
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: '올바른 이메일 형식이 아닙니다.' },
                { status: 400 }
            );
        }

        // 메시지 길이 검증
        if (message.length < 10) {
            return NextResponse.json(
                { error: '문의 내용은 최소 10자 이상 입력해주세요.' },
                { status: 400 }
            );
        }

        // 문의 데이터 삽입
        const { data, error } = await supabase
            .from('contact_inquiries')
            .insert([
                {
                    name,
                    email,
                    phone: phone || null,
                    subject,
                    message,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: '문의 저장에 실패했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: '문의가 성공적으로 전송되었습니다.',
            data
        });

    } catch (error) {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

