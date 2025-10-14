import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서비스 역할 키를 사용한 Supabase 클라이언트 (RLS 우회)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 프로필 정보 업데이트
export async function PATCH(request: NextRequest) {
    try {
        const { name, nickname, bio, profile_image, birth_date, github_url, portfolio_url, linkedin_url, major, grade, userId } = await request.json();

        // userId가 제공되지 않은 경우 오류
        if (!userId) {
            return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
        }

        // 프로필 업데이트
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                name,
                nickname,
                bio,
                profile_image,
                birth_date: birth_date || null,
                github_url: github_url || null,
                portfolio_url: portfolio_url || null,
                linkedin_url: linkedin_url || null,
                major: major || null,
                grade: grade || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            return NextResponse.json({ error: '프로필 업데이트에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '프로필이 업데이트되었습니다.' });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}



