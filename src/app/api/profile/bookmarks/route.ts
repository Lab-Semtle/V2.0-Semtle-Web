import { createServerSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all'; // all, projects, resources, activities

        // 현재 사용자 확인
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const posts = [];

        // 프로젝트 북마크 조회
        if (type === 'all' || type === 'projects') {

            // 프로젝트 북마크 테이블에서 북마크한 프로젝트 ID들을 가져옴
            const { data: bookmarkedProjectIds } = await supabase
                .from('project_bookmarks')
                .select('project_id')
                .eq('user_id', user.id);


            if (bookmarkedProjectIds && bookmarkedProjectIds.length > 0) {
                const projectIds = bookmarkedProjectIds.map(b => b.project_id);

                const { data: projects } = await supabase
                    .from('projects')
                    .select(`
                        id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                        created_at, updated_at, published_at, status,
                        category:project_categories(name, color),
                        author_id,
                        project_type:project_types(name),
                        difficulty, team_size, current_members, project_status
                    `)
                    .eq('status', 'published')
                    .in('id', projectIds)
                    .order('published_at', { ascending: false });


                if (projects && projects.length > 0) {
                    // 작성자 정보 제거
                    const projectsWithoutAuthors = projects.map(project => ({
                        ...project,
                        post_type: 'project'
                    }));

                    posts.push(...projectsWithoutAuthors);
                }
            }
        }

        // 자료실 북마크 조회
        if (type === 'all' || type === 'resources') {

            // 자료실 북마크 테이블에서 북마크한 자료 ID들을 가져옴
            const { data: bookmarkedResourceIds } = await supabase
                .from('resource_bookmarks')
                .select('resource_id')
                .eq('user_id', user.id);


            if (bookmarkedResourceIds && bookmarkedResourceIds.length > 0) {
                const resourceIds = bookmarkedResourceIds.map(b => b.resource_id);

                const { data: resources } = await supabase
                    .from('resources')
                    .select(`
                        id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                        created_at, updated_at, published_at, status,
                        author_id,
                        category:resource_categories(name, color),
                        downloads_count
                    `)
                    .eq('status', 'published')
                    .in('id', resourceIds)
                    .order('published_at', { ascending: false });


                if (resources && resources.length > 0) {
                    // 파일 정보를 별도로 조회
                    const { data: resourceFiles } = await supabase
                        .from('resource_files')
                        .select('resource_id, file_size')
                        .in('resource_id', resourceIds);

                    // 파일 정보를 자료에 매핑 (작성자 정보 제거)
                    const resourcesWithoutAuthors = resources.map(resource => {
                        const files = resourceFiles?.filter(f => f.resource_id === resource.id) || [];
                        const totalFileSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);

                        return {
                            ...resource,
                            post_type: 'resource',
                            file_size: totalFileSize
                        };
                    });

                    posts.push(...resourcesWithoutAuthors);
                }
            }
        }

        // 활동 북마크 조회
        if (type === 'all' || type === 'activities') {

            // 활동 북마크 테이블에서 북마크한 활동 ID들을 가져옴
            const { data: bookmarkedActivityIds } = await supabase
                .from('activity_bookmarks')
                .select('activity_id')
                .eq('user_id', user.id);


            if (bookmarkedActivityIds && bookmarkedActivityIds.length > 0) {
                const activityIds = bookmarkedActivityIds.map(b => b.activity_id);

                const { data: activities } = await supabase
                    .from('activities')
                    .select(`
                        id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                        created_at, updated_at, published_at, status,
                        author_id,
                        activity_type:activity_types(name),
                        start_date, end_date, location, max_participants
                    `)
                    .eq('status', 'published')
                    .in('id', activityIds)
                    .order('published_at', { ascending: false });


                if (activities && activities.length > 0) {
                    // 각 활동의 참가자 수 집계
                    const activitiesWithParticipants = await Promise.all(
                        activities.map(async (activity) => {
                            const { count: participantsCount } = await supabase
                                .from('activity_participants')
                                .select('*', { count: 'exact', head: true })
                                .eq('activity_id', activity.id)
                                .eq('status', 'registered');

                            return {
                                ...activity,
                                current_participants: participantsCount || 0
                            };
                        })
                    );

                    // 작성자 정보 제거
                    const activitiesWithoutAuthors = activitiesWithParticipants.map(activity => ({
                        ...activity,
                        post_type: 'activity'
                    }));

                    posts.push(...activitiesWithoutAuthors);
                }
            }
        }


        return NextResponse.json({
            posts: posts
        });

    } catch {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}





