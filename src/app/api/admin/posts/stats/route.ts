import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createServerSupabase();

        // 프로젝트 통계
        const [projectsTotalResult, projectsPublishedResult, projectsDraftsResult, projectsRecentResult] = await Promise.all([
            supabase.from('projects').select('id', { count: 'exact' }),
            supabase.from('projects').select('id', { count: 'exact' }).eq('status', 'published'),
            supabase.from('projects').select('id', { count: 'exact' }).eq('status', 'draft'),
            supabase.from('projects').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        ]);

        // 자료 통계
        const [resourcesTotalResult, resourcesPublishedResult, resourcesDraftsResult, resourcesRecentResult] = await Promise.all([
            supabase.from('resources').select('id', { count: 'exact' }),
            supabase.from('resources').select('id', { count: 'exact' }).eq('status', 'published'),
            supabase.from('resources').select('id', { count: 'exact' }).eq('status', 'draft'),
            supabase.from('resources').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        ]);

        // 활동 통계
        const [activitiesTotalResult, activitiesPublishedResult, activitiesDraftsResult, activitiesRecentResult] = await Promise.all([
            supabase.from('activities').select('id', { count: 'exact' }),
            supabase.from('activities').select('id', { count: 'exact' }).eq('status', 'published'),
            supabase.from('activities').select('id', { count: 'exact' }).eq('status', 'draft'),
            supabase.from('activities').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        ]);

        const stats = {
            projects: {
                total: projectsTotalResult.count || 0,
                published: projectsPublishedResult.count || 0,
                drafts: projectsDraftsResult.count || 0,
                recent: projectsRecentResult.count || 0
            },
            resources: {
                total: resourcesTotalResult.count || 0,
                published: resourcesPublishedResult.count || 0,
                drafts: resourcesDraftsResult.count || 0,
                recent: resourcesRecentResult.count || 0
            },
            activities: {
                total: activitiesTotalResult.count || 0,
                published: activitiesPublishedResult.count || 0,
                drafts: activitiesDraftsResult.count || 0,
                recent: activitiesRecentResult.count || 0
            }
        };

        return NextResponse.json({ stats });

    } catch {
        return NextResponse.json(
            { error: '게시물 통계를 불러올 수 없습니다.' },
            { status: 500 }
        );
    }
}





