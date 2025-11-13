import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';

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

        // 현재 로그인한 사용자 확인용 supabase
        const serverSupabase = await createServerSupabase();
        const resolvedParams = await params;
        const userId = resolvedParams.userId;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all'; // all, projects, resources, activities
        const includeDrafts = searchParams.get('include_drafts') === 'true';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');

        // 현재 로그인한 사용자 ID 확인
        let isOwnProfile = false;
        try {
            const { data: { user } } = await serverSupabase.auth.getUser();
            isOwnProfile = user?.id === userId;
        } catch {
            // Auth error
        }

        const posts = [];

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
                        } catch {
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
            // 자료 조회 (메타데이터만)
            let query = supabase
                .from('resources')
                .select(`
                    id,
                    author_id,
                    status,
                    views_count_cached,
                    likes_count_cached,
                    comments_count_cached,
                    bookmarks_count_cached,
                    downloads_count_cached,
                    published_at,
                    republished_at,
                    published_version_id
                `)
                .eq('author_id', userId);

            // draft 게시물은 본인만 보임
            // includeDrafts=true이고 isOwnProfile=true면 모든 게시물 조회
            // includeDrafts=false이거나 isOwnProfile=false면 public만

            if (includeDrafts && isOwnProfile) {
                // 본인이면 모든 게시물 조회 (draft + public + private)
                // 필터 없음
            } else {
                // public만 조회
                query = query.eq('status', 'public');
            }

            const { data: resourcesMeta } = await query.order('published_at', { ascending: false });

            if (resourcesMeta && resourcesMeta.length > 0) {
                // 버전 ID 수집 (published_version_id 또는 최신 버전)
                const versionIds: number[] = [];
                const resourceVersionMap = new Map<number, number>();

                for (const meta of resourcesMeta) {
                    let versionId = meta.published_version_id;

                    // published_version_id가 없으면 최신 버전 조회 (내 프로필인 경우만)
                    if (!versionId && includeDrafts && isOwnProfile) {
                        const { data: latestVersion } = await supabase
                            .from('resource_versions')
                            .select('id')
                            .eq('resource_id', meta.id)
                            .order('version_number', { ascending: false })
                            .limit(1)
                            .single();

                        versionId = latestVersion?.id || null;
                    }

                    if (versionId) {
                        versionIds.push(versionId);
                        resourceVersionMap.set(meta.id, versionId);
                    }
                }

                if (versionIds.length > 0) {
                    // 버전 데이터 조회
                    const { data: versions } = await supabase
                        .from('resource_versions')
                        .select('id, resource_id, title, subtitle, thumbnail, content, category_id, created_at, updated_at')
                        .in('id', versionIds);

                    // 카테고리 정보 조회
                    interface ResourceCategory {
                        id: number;
                        name: string;
                        color: string;
                    }

                    const categoryIds = [...new Set(versions?.map(v => v.category_id).filter(Boolean) || [])];
                    let categoriesMap: Record<number, ResourceCategory> = {};
                    if (categoryIds.length > 0) {
                        const { data: categories } = await supabase
                            .from('resource_categories')
                            .select('id, name, color')
                            .in('id', categoryIds);
                        if (categories) {
                            categoriesMap = categories.reduce((acc, cat) => {
                                acc[cat.id] = cat;
                                return acc;
                            }, {} as Record<number, ResourceCategory>);
                        }
                    }

                    // 파일 정보를 별도로 조회
                    const { data: resourceFiles } = await supabase
                        .from('resource_files')
                        .select('resource_id, file_size')
                        .in('resource_id', resourcesMeta.map(r => r.id));

                    // 자료 메타데이터와 버전 데이터 병합
                    const versionMap = new Map(versions?.map(v => [v.id, v]) || []);
                    const resourcesWithFiles = [];

                    for (const meta of resourcesMeta) {
                        const versionId = resourceVersionMap.get(meta.id);
                        const version = versionId ? versionMap.get(versionId) : null;

                        if (!version && !includeDrafts) {
                            // 공개 게시물만 조회하는 경우 버전이 없으면 스킵
                            continue;
                        }

                        const files = resourceFiles?.filter(f => f.resource_id === meta.id) || [];
                        const totalFileSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);

                        // 상태 결정
                        let displayStatus = meta.status;
                        if (meta.status === 'public') {
                            displayStatus = 'published';
                        }

                        resourcesWithFiles.push({
                            id: meta.id,
                            author_id: meta.author_id,
                            title: version?.title || null,
                            subtitle: version?.subtitle || null,
                            thumbnail: version?.thumbnail || null,
                            content: version?.content || null,
                            views: meta.views_count_cached || 0,
                            likes_count: meta.likes_count_cached || 0,
                            comments_count: meta.comments_count_cached || 0,
                            bookmarks_count: meta.bookmarks_count_cached || 0,
                            downloads_count: meta.downloads_count_cached || 0,
                            created_at: version?.created_at || meta.published_at || null,
                            updated_at: version?.updated_at || meta.republished_at || null,
                            published_at: meta.published_at,
                            status: displayStatus,
                            category: version?.category_id ? categoriesMap[version.category_id] : null,
                            post_type: 'resource',
                            file_size: totalFileSize,
                            visibility: 'public',
                            is_published_version: !!meta.published_version_id,
                            has_unpublished_changes: false,
                            is_editing: false
                        });
                    }

                    posts.push(...resourcesWithFiles);
                }
            }
        }

        if (type === 'all' || type === 'activity' || type === 'activities') {
            // 활동 조회 (메타데이터만)
            let activitiesQuery = supabase
                .from('activities')
                .select(`
                    id,
                    author_id,
                    status,
                    views_count_cached,
                    likes_count_cached,
                    comments_count_cached,
                    bookmarks_count_cached,
                    published_at,
                    republished_at,
                    published_version_id
                `)
                .eq('author_id', userId);

            if (!includeDrafts) {
                activitiesQuery = activitiesQuery.eq('status', 'public');
            }

            const { data: activitiesMeta } = await activitiesQuery.order('published_at', { ascending: false });

            if (activitiesMeta && activitiesMeta.length > 0) {
                // 버전 ID 수집 (published_version_id 또는 최신 버전)
                const versionIds: number[] = [];
                const activityVersionMap = new Map<number, number>();

                for (const meta of activitiesMeta) {
                    let versionId = meta.published_version_id;

                    // published_version_id가 없으면 최신 버전 조회 (내 프로필인 경우만)
                    if (!versionId && includeDrafts && isOwnProfile) {
                        const { data: latestVersion } = await supabase
                            .from('activity_versions')
                            .select('id')
                            .eq('activity_id', meta.id)
                            .order('version_number', { ascending: false })
                            .limit(1)
                            .single();

                        versionId = latestVersion?.id || null;
                    }

                    if (versionId) {
                        versionIds.push(versionId);
                        activityVersionMap.set(meta.id, versionId);
                    }
                }

                if (versionIds.length > 0) {
                    // 버전 데이터 조회
                    const { data: versions } = await supabase
                        .from('activity_versions')
                        .select('id, activity_id, title, subtitle, thumbnail, category_id, tags, created_at, updated_at')
                        .in('id', versionIds);

                    // 카테고리 정보 조회
                    interface ActivityCategory {
                        id: number;
                        name: string;
                        color: string;
                    }

                    const categoryIds = [...new Set(versions?.map(v => v.category_id).filter(Boolean) || [])];
                    let categoriesMap: Record<number, ActivityCategory> = {};
                    if (categoryIds.length > 0) {
                        const { data: categories } = await supabase
                            .from('activity_categories')
                            .select('id, name, color')
                            .in('id', categoryIds);
                        if (categories) {
                            categoriesMap = categories.reduce((acc, cat) => {
                                acc[cat.id] = cat;
                                return acc;
                            }, {} as Record<number, ActivityCategory>);
                        }
                    }

                    // 활동 메타데이터와 버전 데이터 병합
                    const versionMap = new Map(versions?.map(v => [v.id, v]) || []);
                    const activities = activitiesMeta
                        .map(meta => {
                            const versionId = activityVersionMap.get(meta.id);
                            const version = versionId ? versionMap.get(versionId) : null;

                            if (!version && !includeDrafts) {
                                // 공개 게시물만 조회하는 경우 버전이 없으면 스킵
                                return null;
                            }

                            return {
                                id: meta.id,
                                author_id: meta.author_id,
                                title: version?.title || null,
                                subtitle: version?.subtitle || null,
                                thumbnail: version?.thumbnail || null,
                                tags: version?.tags || [],
                                views: meta.views_count_cached || 0,
                                likes_count: meta.likes_count_cached || 0,
                                comments_count: meta.comments_count_cached || 0,
                                bookmarks_count: meta.bookmarks_count_cached || 0,
                                created_at: version?.created_at || meta.published_at || null,
                                updated_at: version?.updated_at || meta.republished_at || null,
                                published_at: meta.published_at,
                                status: meta.status,
                                category: version?.category_id ? categoriesMap[version.category_id] : null,
                                post_type: 'activity'
                            };
                        })
                        .filter(Boolean);

                    posts.push(...activities);
                }
            }
        }

        // 최신순으로 정렬
        posts.sort((a, b) => {
            if (!a || !b) return 0;
            const dateA = (a.published_at || a.created_at) ? new Date(a.published_at || a.created_at || 0).getTime() : 0;
            const dateB = (b.published_at || b.created_at) ? new Date(b.published_at || b.created_at || 0).getTime() : 0;
            return dateB - dateA;
        });


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
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

