import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 사용자의 공개 게시물 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const resolvedParams = await params;
        const userId = resolvedParams.userId;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all'; // all, projects, resources, activities
        const includeDrafts = searchParams.get('include_drafts') === 'true';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');


        let posts = [];

        if (type === 'all' || type === 'project') {
            // 프로젝트 조회
            let query = supabase
                .from('projects')
                .select(`
                    id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                    created_at, updated_at, published_at, status,
                    category:project_categories(name, color),
                    project_type:project_types(name, color),
                    project_status_info:project_statuses!project_status(name, display_name, color, icon),
                    team_size, current_members, needed_skills, difficulty, location, deadline, progress_percentage, project_status
                `)
                .eq('author_id', userId);

            if (!includeDrafts) {
                query = query.eq('status', 'published');
            }


            // 디버깅을 위해 쿼리 조건 확인
            if (includeDrafts) {
            } else {
                query = query.eq('status', 'published');
            }

            const { data: projects, error: projectError } = await query.order('created_at', { ascending: false });

            if (projectError) {
            }


            // 각 프로젝트의 status 값 확인
            if (projects && projects.length > 0) {
            }

            if (projects) {
                // 각 프로젝트별 승인된 팀원 수와 신청자 수 조회
                const projectsWithCounts = await Promise.all(
                    projects.map(async (project) => {
                        try {
                            // 승인된 팀원 수 조회 (프로젝트 작성자 제외)
                            const { data: teamMembers } = await supabase
                                .from('project_team_members')
                                .select('id')
                                .eq('project_id', project.id)
                                .eq('status', 'active')
                                .neq('role', 'leader');

                            // 신청자 수 조회 (대기중인 신청자만)
                            const { data: applications } = await supabase
                                .from('project_applications')
                                .select('id')
                                .eq('project_id', project.id)
                                .eq('status', 'pending');

                            return {
                                ...project,
                                post_type: 'project',
                                project_data: {
                                    team_size: project.team_size,
                                    current_members: project.current_members,
                                    needed_skills: project.needed_skills,
                                    difficulty: project.difficulty,
                                    location: project.location,
                                    deadline: project.deadline,
                                    project_status: project.project_status,
                                    progress_percentage: project.progress_percentage
                                },
                                approved_members: teamMembers?.length || 0,
                                applicant_count: applications?.length || 0
                            };
                        } catch (error) {
                            console.error(`프로젝트 ${project.id} 처리 중 오류:`, error);
                            return {
                                ...project,
                                post_type: 'project',
                                project_data: {
                                    team_size: project.team_size,
                                    current_members: project.current_members,
                                    needed_skills: project.needed_skills,
                                    difficulty: project.difficulty,
                                    location: project.location,
                                    deadline: project.deadline,
                                    project_status: project.project_status,
                                    progress_percentage: project.progress_percentage
                                },
                                approved_members: 0,
                                applicant_count: 0
                            };
                        }
                    })
                );

                posts.push(...projectsWithCounts);
            }
        }

        if (type === 'all' || type === 'resource') {
            console.log('프로필 API - 자료실 조회 시작:', { userId, type, includeDrafts });

            // 자료 조회
            let query = supabase
                .from('resources')
                .select(`
                    id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                    created_at, updated_at, published_at, status,
                    author_id,
                    resource_type:resource_types(name, color),
                    downloads_count
                `)
                .eq('author_id', userId);

            if (!includeDrafts) {
                query = query.eq('status', 'published');
            }

            const { data: resources, error: resourcesError } = await query.order('published_at', { ascending: false });

            console.log('프로필 API - 자료실 조회 결과:', {
                count: resources?.length || 0,
                error: resourcesError,
                resources: resources?.map(r => ({ id: r.id, title: r.title, status: r.status })) || []
            });

            if (resources && resources.length > 0) {
                // 파일 정보를 별도로 조회
                const { data: resourceFiles } = await supabase
                    .from('resource_files')
                    .select('resource_id, file_size')
                    .in('resource_id', resources.map(r => r.id));

                // 각 자료별 파일 정보 매핑
                const resourcesWithFiles = resources.map(resource => {
                    const files = resourceFiles?.filter(f => f.resource_id === resource.id) || [];
                    const totalFileSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);

                    return {
                        ...resource,
                        post_type: 'resource',
                        file_size: totalFileSize
                    };
                });

                posts.push(...resourcesWithFiles);
            }
        }

        if (type === 'all' || type === 'activities') {
            // 활동 조회
            let query = supabase
                .from('activities')
                .select(`
                    id, title, subtitle, thumbnail, views, likes_count, comments_count, bookmarks_count,
                    created_at, updated_at, published_at, status,
                    category:activity_categories(name, color),
                    activity_type:activity_types(name)
                `)
                .eq('author_id', userId);

            if (!includeDrafts) {
                query = query.eq('status', 'published');
            }

            const { data: activities } = await query.order('published_at', { ascending: false });

            if (activities) {
                posts.push(...activities.map(a => ({ ...a, post_type: 'activity' })));
            }
        }

        // 최신순으로 정렬
        posts.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());


        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const paginatedPosts = posts.slice(from, to + 1);


        return NextResponse.json({
            posts: paginatedPosts,
            pagination: {
                page,
                limit,
                total: posts.length,
                totalPages: Math.ceil(posts.length / limit)
            }
        });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
