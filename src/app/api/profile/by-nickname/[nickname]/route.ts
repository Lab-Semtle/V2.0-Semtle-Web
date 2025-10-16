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
                email, student_id, birth_date, github_url, portfolio_url, linkedin_url,
                major, grade, followers_count, following_count,
                profile_public, email_public, student_id_public, major_grade_public
            `)
            .eq('nickname', nickname)
            .single();

        if (error) {
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

        // 게시물 통계 및 팔로워/팔로잉 수 계산
        const [projectsResult, resourcesResult, activitiesResult, followersResult, followingResult] = await Promise.all([
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
                .eq('status', 'published'),
            // 팔로워 수 계산 (이 사용자를 팔로우하는 사람들)
            supabase
                .from('follows')
                .select('id', { count: 'exact' })
                .eq('following_id', profile.id),
            // 팔로잉 수 계산 (이 사용자가 팔로우하는 사람들)
            supabase
                .from('follows')
                .select('id', { count: 'exact' })
                .eq('follower_id', profile.id)
        ]);

        const projectsCount = projectsResult.count || 0;
        const resourcesCount = resourcesResult.count || 0;
        const activitiesCount = activitiesResult.count || 0;
        const followersCount = followersResult.count || 0;
        const followingCount = followingResult.count || 0;

        const profileWithStats = {
            ...profile,
            privacy: {
                profileVisibility: profile.profile_public ? 'public' : 'private',
                email_public: profile.email_public,
                student_id_public: profile.student_id_public,
                major_grade_public: profile.major_grade_public
            },
            stats: {
                posts: {
                    projects: projectsCount,
                    resources: resourcesCount,
                    activities: activitiesCount,
                    total: projectsCount + resourcesCount + activitiesCount
                },
                followers_count: followersCount,
                following_count: followingCount
            }
        };

        return NextResponse.json({
            profile: profileWithStats
        });

    } catch {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
