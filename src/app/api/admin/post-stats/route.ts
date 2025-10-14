import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 관리자용 게시물 통계 조회
export async function GET(request: NextRequest) {
    try {
        console.log('관리자 게시물 통계 API 시작');
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        console.log('관리자 게시물 통계 API - 사용자 확인 시작');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('관리자 게시물 통계 API - 사용자 결과:', { user: !!user, authError });

        if (authError || !user) {
            console.log('관리자 게시물 통계 API - 인증 실패:', authError);
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        console.log('관리자 게시물 통계 API - 권한 확인 시작:', user.id);
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log('관리자 게시물 통계 API - 프로필 결과:', { userProfile, profileError });

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        if (!isAdmin) {
            console.log('관리자 게시물 통계 API - 관리자 권한 없음:', userProfile?.role);
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        // 각 게시판별 통계 조회
        console.log('관리자 게시물 통계 API - 통계 조회 시작');

        // 프로젝트 통계
        const { data: projectStats, error: projectError } = await supabase
            .from('projects')
            .select('status, created_at')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 최근 30일

        // 자료실 통계
        const { data: resourceStats, error: resourceError } = await supabase
            .from('resources')
            .select('status, created_at')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 최근 30일

        // 활동 통계
        const { data: activityStats, error: activityError } = await supabase
            .from('activities')
            .select('status, created_at')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 최근 30일

        console.log('관리자 게시물 통계 API - 통계 조회 결과:', {
            projectStats: projectStats?.length || 0,
            resourceStats: resourceStats?.length || 0,
            activityStats: activityStats?.length || 0,
            projectError,
            resourceError,
            activityError
        });

        // 통계 데이터 가공
        const stats = {
            projects: {
                total: projectStats?.length || 0,
                published: projectStats?.filter(p => p.status === 'published').length || 0,
                drafts: projectStats?.filter(p => p.status === 'draft').length || 0,
                recent: projectStats?.length || 0
            },
            resources: {
                total: resourceStats?.length || 0,
                published: resourceStats?.filter(r => r.status === 'published').length || 0,
                drafts: resourceStats?.filter(r => r.status === 'draft').length || 0,
                recent: resourceStats?.length || 0
            },
            activities: {
                total: activityStats?.length || 0,
                published: activityStats?.filter(a => a.status === 'published').length || 0,
                drafts: activityStats?.filter(a => a.status === 'draft').length || 0,
                recent: activityStats?.length || 0
            }
        };

        console.log('관리자 게시물 통계 API - 최종 결과:', stats);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('관리자 게시물 통계 조회 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
