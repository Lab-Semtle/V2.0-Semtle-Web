import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 사용자 프로필 정보 조회
export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const supabase = await createServerSupabase();
        const userId = params.userId;

        // 사용자 프로필 조회
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select(`
                id,
                nickname,
                name,
                bio,
                profile_image,
                role,
                created_at,
                updated_at
            `)
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 사용자의 공개 게시물 통계
        const [projectsResult, resourcesResult, activitiesResult] = await Promise.all([
            supabase
                .from('projects')
                .select('id, views, likes_count, comments_count, bookmarks_count')
                .eq('author_id', userId)
                .eq('status', 'published'),
            supabase
                .from('resources')
                .select('id, views, likes_count, comments_count, bookmarks_count')
                .eq('author_id', userId)
                .eq('status', 'published'),
            supabase
                .from('activities')
                .select('id, views, likes_count, comments_count, bookmarks_count')
                .eq('author_id', userId)
                .eq('status', 'published')
        ]);

        const allPosts = [
            ...(projectsResult.data || []),
            ...(resourcesResult.data || []),
            ...(activitiesResult.data || [])
        ];

        const stats = {
            posts: {
                projects: projectsResult.data?.length || 0,
                resources: resourcesResult.data?.length || 0,
                activities: activitiesResult.data?.length || 0,
                total: allPosts.length
            },
            followers_count: profile.followers_count || 0,
            following_count: profile.following_count || 0
        };

        return NextResponse.json({
            profile: {
                ...profile,
                stats
            }
        });
    } catch (error) {
        console.error('프로필 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
