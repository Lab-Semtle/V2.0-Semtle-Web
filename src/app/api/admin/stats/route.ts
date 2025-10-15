import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        console.log('관리자 시스템 통계 API 시작');
        const supabase = await createServerSupabase();

        // 사용자 확인 (보안상 getUser 사용)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (!user || authError) {
            console.log('관리자 시스템 통계 API - 인증 실패:', { user: !!user, authError });
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !userProfile) {
            console.log('관리자 시스템 통계 API - 프로필 조회 실패:', profileError);
            return NextResponse.json({ error: '사용자 프로필을 찾을 수 없습니다.' }, { status: 401 });
        }

        const isAdmin = userProfile.role === 'admin' || userProfile.role === 'super_admin';
        if (!isAdmin) {
            console.log('관리자 시스템 통계 API - 관리자 권한 없음:', userProfile.role);
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        // 사용자 통계
        const { count: totalUsers, error: usersError } = await supabase
            .from('user_profiles')
            .select('id', { count: 'exact', head: true });

        const { count: totalAdmins } = await supabase
            .from('user_profiles')
            .select('id', { count: 'exact', head: true })
            .in('role', ['admin', 'super_admin']);

        // 프로젝트 통계
        const { count: totalProjects, error: projectError } = await supabase
            .from('projects')
            .select('id', { count: 'exact', head: true });

        // 자료실 통계
        const { count: totalResources, error: resourceError } = await supabase
            .from('resources')
            .select('id', { count: 'exact', head: true });

        // 활동 통계
        const { count: totalActivities, error: activityError } = await supabase
            .from('activities')
            .select('id', { count: 'exact', head: true });

        // 좋아요 통계
        const { data: projectLikes } = await supabase
            .from('projects')
            .select('likes_count');
        const { data: resourceLikes } = await supabase
            .from('resources')
            .select('likes_count');
        const { data: activityLikes } = await supabase
            .from('activities')
            .select('likes_count');

        const totalLikes = (projectLikes?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0) +
            (resourceLikes?.reduce((sum, r) => sum + (r.likes_count || 0), 0) || 0) +
            (activityLikes?.reduce((sum, a) => sum + (a.likes_count || 0), 0) || 0);

        // 북마크 통계
        const { data: projectBookmarks } = await supabase
            .from('projects')
            .select('bookmarks_count');
        const { data: resourceBookmarks } = await supabase
            .from('resources')
            .select('bookmarks_count');
        const { data: activityBookmarks } = await supabase
            .from('activities')
            .select('bookmarks_count');

        const totalBookmarks = (projectBookmarks?.reduce((sum, p) => sum + (p.bookmarks_count || 0), 0) || 0) +
            (resourceBookmarks?.reduce((sum, r) => sum + (r.bookmarks_count || 0), 0) || 0) +
            (activityBookmarks?.reduce((sum, a) => sum + (a.bookmarks_count || 0), 0) || 0);

        if (usersError || projectError || resourceError || activityError) {
            return NextResponse.json({
                error: '시스템 통계를 가져오는데 실패했습니다.',
                details: {
                    usersError: usersError?.message,
                    projectError: projectError?.message,
                    resourceError: resourceError?.message,
                    activityError: activityError?.message
                }
            }, { status: 500 });
        }

        const stats = {
            totalUsers: totalUsers || 0,
            totalAdmins: totalAdmins || 0,
            totalProjects: totalProjects || 0,
            totalResources: totalResources || 0,
            totalActivities: totalActivities || 0,
            totalLikes,
            totalBookmarks
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('관리자 시스템 통계 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}