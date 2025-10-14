import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 관리자용 시스템 통계 조회
export async function GET(request: NextRequest) {
    try {
        console.log('관리자 시스템 통계 API 시작');
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        console.log('관리자 시스템 통계 API - 사용자 확인 시작');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('관리자 시스템 통계 API - 사용자 결과:', { user: !!user, authError });

        if (authError || !user) {
            console.log('관리자 시스템 통계 API - 인증 실패:', authError);
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        console.log('관리자 시스템 통계 API - 권한 확인 시작:', user.id);
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log('관리자 시스템 통계 API - 프로필 결과:', { userProfile, profileError });

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        if (!isAdmin) {
            console.log('관리자 시스템 통계 API - 관리자 권한 없음:', userProfile?.role);
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        console.log('관리자 시스템 통계 API - 통계 조회 시작');

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

        console.log('관리자 시스템 통계 API - 개별 통계 조회 결과:', {
            totalUsers,
            totalAdmins,
            totalProjects,
            totalResources,
            totalActivities,
            usersError,
            projectError,
            resourceError,
            activityError
        });

        // 좋아요 통계 (프로젝트 + 자료실 + 활동)
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

        // 북마크 통계 (프로젝트 + 자료실 + 활동)
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

        console.log('관리자 시스템 통계 API - 좋아요/북마크 통계 조회 결과:', {
            totalLikes,
            totalBookmarks,
            projectLikesCount: projectLikes?.length || 0,
            resourceLikesCount: resourceLikes?.length || 0,
            activityLikesCount: activityLikes?.length || 0
        });

        console.log('관리자 시스템 통계 API - 통계 조회 결과:', {
            totalUsers,
            totalAdmins,
            totalProjects,
            totalResources,
            totalActivities,
            totalLikes,
            totalBookmarks,
            usersError,
            projectError,
            resourceError,
            activityError
        });

        if (usersError || projectError || resourceError || activityError) {
            console.error('시스템 통계 조회 오류:', { usersError, projectError, resourceError, activityError });
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

        console.log('관리자 시스템 통계 API - 최종 결과:', stats);

        // 응답 데이터 검증
        if (!stats || typeof stats !== 'object') {
            console.error('관리자 시스템 통계 API - 잘못된 통계 데이터:', stats);
            return NextResponse.json({ error: '통계 데이터 생성에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json(stats);

    } catch (error) {
        console.error('관리자 시스템 통계 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}