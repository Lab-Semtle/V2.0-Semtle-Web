import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '6');

        const allPosts = [];

        // 프로젝트 최신 글 조회
        const { data: projects } = await supabase
            .from('projects')
            .select(`
        id, title, subtitle, thumbnail, created_at, published_at, status,
        category:project_categories(name, color),
        project_type:project_types(name, color),
        author_id
      `)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(limit);

        if (projects && projects.length > 0) {
            // 작성자 정보 조회
            const authorIds = [...new Set(projects.map(p => p.author_id))];
            const { data: authors } = await supabase
                .from('user_profiles')
                .select('id, nickname, name, profile_image')
                .in('id', authorIds);

            const projectsWithAuthors = projects.map(project => {
                const author = authors?.find(a => a.id === project.author_id);
                return {
                    ...project,
                    post_type: 'project',
                    board_type: 'projects',
                    author: author || { nickname: 'Unknown', name: 'Unknown', profile_image: null },
                    display_date: project.published_at || project.created_at
                };
            });

            allPosts.push(...projectsWithAuthors);
        }

        // 자료실 최신 글 조회
        const { data: resources } = await supabase
            .from('resources')
            .select(`
        id, title, subtitle, thumbnail, created_at, published_at, status,
        category:resource_categories(name, color),
        author_id
      `)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(limit);

        if (resources && resources.length > 0) {
            // 작성자 정보 조회
            const authorIds = [...new Set(resources.map(r => r.author_id))];
            const { data: authors } = await supabase
                .from('user_profiles')
                .select('id, nickname, name, profile_image')
                .in('id', authorIds);

            const resourcesWithAuthors = resources.map(resource => {
                const author = authors?.find(a => a.id === resource.author_id);
                return {
                    ...resource,
                    post_type: 'resource',
                    board_type: 'resources',
                    author: author || { nickname: 'Unknown', name: 'Unknown', profile_image: null },
                    display_date: resource.published_at || resource.created_at
                };
            });

            allPosts.push(...resourcesWithAuthors);
        }

        // 활동 최신 글 조회
        const { data: activities } = await supabase
            .from('activities')
            .select(`
        id, title, subtitle, thumbnail, created_at, published_at, status,
        category:activity_categories(name, color),
        author_id
      `)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(limit);

        if (activities && activities.length > 0) {
            // 작성자 정보 조회
            const authorIds = [...new Set(activities.map(a => a.author_id))];
            const { data: authors } = await supabase
                .from('user_profiles')
                .select('id, nickname, name, profile_image')
                .in('id', authorIds);

            const activitiesWithAuthors = activities.map(activity => {
                const author = authors?.find(a => a.id === activity.author_id);
                return {
                    ...activity,
                    post_type: 'activity',
                    board_type: 'activities',
                    author: author || { nickname: 'Unknown', name: 'Unknown', profile_image: null },
                    display_date: activity.published_at || activity.created_at
                };
            });

            allPosts.push(...activitiesWithAuthors);
        }

        // 날짜순으로 정렬 (최신순)
        allPosts.sort((a, b) =>
            new Date(b.display_date).getTime() - new Date(a.display_date).getTime()
        );

        // 요청된 개수만큼 반환
        const latestPosts = allPosts.slice(0, limit);

        return NextResponse.json({
            posts: latestPosts,
            total: allPosts.length
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
