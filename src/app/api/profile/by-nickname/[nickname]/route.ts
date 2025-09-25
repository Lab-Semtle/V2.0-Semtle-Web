import { createServerSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nickname: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const nickname = resolvedParams.nickname;

        // 닉네임으로 사용자 프로필 조회
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select(`
                id, nickname, name, bio, profile_image, role, created_at,
                followers_count, following_count
            `)
            .eq('nickname', nickname)
            .single();

        if (error) {
            console.error('프로필 조회 오류:', error);
            return NextResponse.json(
                { error: '프로필을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        if (!profile) {
            return NextResponse.json(
                { error: '사용자를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 게시물 통계 계산
        const [projectsResult, resourcesResult, activitiesResult] = await Promise.all([
            supabase
                .from('projects')
                .select('id', { count: 'exact' })
                .eq('author_id', profile.id)
                .eq('status', 'published'),
            supabase
                .from('resources')
                .select('id', { count: 'exact' })
                .eq('author_id', profile.id)
                .eq('status', 'published'),
            supabase
                .from('activities')
                .select('id', { count: 'exact' })
                .eq('author_id', profile.id)
                .eq('status', 'published')
        ]);

        const projectsCount = projectsResult.count || 0;
        const resourcesCount = resourcesResult.count || 0;
        const activitiesCount = activitiesResult.count || 0;

        const profileWithStats = {
            ...profile,
            stats: {
                posts: {
                    projects: projectsCount,
                    resources: resourcesCount,
                    activities: activitiesCount,
                    total: projectsCount + resourcesCount + activitiesCount
                },
                followers_count: profile.followers_count || 0,
                following_count: profile.following_count || 0
            }
        };

        return NextResponse.json({
            profile: profileWithStats
        });

    } catch (error) {
        console.error('프로필 조회 오류:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
