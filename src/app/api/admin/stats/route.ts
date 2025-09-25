import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 사용자 통계
        const [usersResult, adminsResult, activeUsersResult, suspendedUsersResult] = await Promise.all([
            supabase.from('user_profiles').select('id', { count: 'exact' }),
            supabase.from('user_profiles').select('id', { count: 'exact' }).in('role', ['admin', 'super_admin']),
            supabase.from('user_profiles').select('id', { count: 'exact' }).eq('status', 'active'),
            supabase.from('user_profiles').select('id', { count: 'exact' }).in('status', ['suspended', 'banned'])
        ]);

        // 게시물 통계
        const [projectsResult, resourcesResult, activitiesResult] = await Promise.all([
            supabase.from('projects').select('id', { count: 'exact' }),
            supabase.from('resources').select('id', { count: 'exact' }),
            supabase.from('activities').select('id', { count: 'exact' })
        ]);

        // 상호작용 통계
        const [commentsResult, likesResult, bookmarksResult] = await Promise.all([
            supabase.from('comments').select('id', { count: 'exact' }),
            supabase.from('likes').select('id', { count: 'exact' }),
            supabase.from('bookmarks').select('id', { count: 'exact' })
        ]);

        // 조회수 통계
        const [projectsViewsResult, resourcesViewsResult, activitiesViewsResult] = await Promise.all([
            supabase.from('projects').select('views').eq('status', 'published'),
            supabase.from('resources').select('views').eq('status', 'published'),
            supabase.from('activities').select('views').eq('status', 'published')
        ]);

        const totalViews =
            (projectsViewsResult.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0) +
            (resourcesViewsResult.data?.reduce((sum, r) => sum + (r.views || 0), 0) || 0) +
            (activitiesViewsResult.data?.reduce((sum, a) => sum + (a.views || 0), 0) || 0);

        const stats = {
            totalUsers: usersResult.count || 0,
            totalAdmins: adminsResult.count || 0,
            activeUsers: activeUsersResult.count || 0,
            suspendedUsers: suspendedUsersResult.count || 0,
            totalProjects: projectsResult.count || 0,
            totalResources: resourcesResult.count || 0,
            totalActivities: activitiesResult.count || 0,
            totalComments: commentsResult.count || 0,
            totalLikes: likesResult.count || 0,
            totalBookmarks: bookmarksResult.count || 0,
            totalViews: totalViews
        };

        return NextResponse.json({ stats });

    } catch (error) {
        console.error('시스템 통계 조회 오류:', error);
        return NextResponse.json(
            { error: '시스템 통계를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}
