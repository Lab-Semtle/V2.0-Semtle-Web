import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 관리자용 게시물 통계 조회
export async function GET() {
    try {
        const supabase = await createServerSupabase();

        // 사용자 확인 (보안상 getUser 사용)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user || authError) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        if (!isAdmin) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        // 각 게시판별 통계 조회

        // 프로젝트 통계
        const { data: projectStats } = await supabase
            .from('projects')
            .select('status, created_at')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 최근 30일

        // 자료실 통계
        const { data: resourceStats } = await supabase
            .from('resources')
            .select('status, created_at')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 최근 30일

        // 활동 통계
        const { data: activityStats } = await supabase
            .from('activities')
            .select('status, created_at')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 최근 30일

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

        return NextResponse.json(stats);
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
