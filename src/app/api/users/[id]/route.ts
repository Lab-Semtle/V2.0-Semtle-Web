import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 특정 사용자 프로필 조회 (공개 정보만)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const userId = resolvedParams.id;

        // 공개 프로필 정보 조회
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select(`
        id,
        student_id,
        nickname,
        name,
        profile_image,
        bio,
        github_url,
        portfolio_url,
        linkedin_url,
        major,
        grade,
        student_status,
        total_posts,
        total_likes_received,
        total_comments,
        created_at,
        last_login
      `)
            .eq('id', userId)
            .eq('status', 'active') // 활성 사용자만
            .single();

        if (error) {
            console.error('사용자 프로필 조회 오류:', error);
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('사용자 프로필 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
