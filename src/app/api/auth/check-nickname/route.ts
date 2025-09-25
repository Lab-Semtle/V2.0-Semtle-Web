import { createServerSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { nickname } = await request.json();

        if (!nickname || nickname.trim().length === 0) {
            return NextResponse.json(
                { error: '닉네임을 입력해주세요.' },
                { status: 400 }
            );
        }

        // 닉네임 길이 검증
        if (nickname.length < 2 || nickname.length > 50) {
            return NextResponse.json(
                { error: '닉네임은 2자 이상 50자 이하로 입력해주세요.' },
                { status: 400 }
            );
        }

        // 닉네임 형식 검증 (한글, 영문, 숫자, 언더스코어, 하이픈만 허용)
        const nicknameRegex = /^[가-힣a-zA-Z0-9_-]+$/;
        if (!nicknameRegex.test(nickname)) {
            return NextResponse.json(
                { error: '닉네임은 한글, 영문, 숫자, 언더스코어(_), 하이픈(-)만 사용할 수 있습니다.' },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabase();

        // 닉네임 중복 확인
        const { data, error } = await supabase
            .from('user_profiles')
            .select('nickname')
            .eq('nickname', nickname.trim())
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
            console.error('닉네임 중복 확인 오류:', error);
            return NextResponse.json(
                { error: '서버 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        if (data) {
            return NextResponse.json(
                { available: false, message: '이미 사용 중인 닉네임입니다.' },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { available: true, message: '사용 가능한 닉네임입니다.' },
            { status: 200 }
        );

    } catch (error) {
        console.error('닉네임 중복 확인 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
