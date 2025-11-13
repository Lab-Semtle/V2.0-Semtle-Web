import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '6');
        const type = searchParams.get('type'); // 'activity', 'project', 'resource' 또는 null (전체)

        const allPosts = [];

        // 프로젝트 최신 글 조회 (type이 지정되지 않았거나 'project'인 경우만)
        if (!type || type === 'project') {
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
        }

        // 자료실 최신 글 조회 (type이 지정되지 않았거나 'resource'인 경우만)
        if (!type || type === 'resource') {
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
        }

        // 활동 최신 글 조회 (type이 지정되지 않았거나 'activity'인 경우만)
        if (!type || type === 'activity') {
            // activities 테이블에서 메타데이터만 조회 (새 스키마: status='public'만 조회)
            const { data: activitiesMeta, error: activitiesError } = await supabase
                .from('activities')
                .select(`
                    id,
                    author_id,
                    status,
                    is_pinned,
                    views_count_cached,
                    likes_count_cached,
                    bookmarks_count_cached,
                    comments_count_cached,
                    published_at,
                    republished_at,
                    published_version_id
                `)
                .eq('status', 'public')
                .not('published_version_id', 'is', null)
                .order('is_pinned', { ascending: false })
                .order('published_at', { ascending: false })
                .limit(limit);

            if (activitiesError) {
                console.error('Error fetching activities metadata:', activitiesError);
            } else if (activitiesMeta && activitiesMeta.length > 0) {
                // published_version_id로 버전 데이터 JOIN
                const versionIds = activitiesMeta
                    .map(a => a.published_version_id)
                    .filter(Boolean);

                if (versionIds.length > 0) {
                    const { data: versions, error: versionsError } = await supabase
                        .from('activity_versions')
                        .select(`
                            id,
                            activity_id,
                            title,
                            subtitle,
                            thumbnail,
                            category_id,
                            location,
                            start_date,
                            end_date,
                            max_participants,
                            participation_fee,
                            contact_info,
                            has_voting,
                            vote_options,
                            vote_deadline,
                            created_at
                        `)
                        .in('id', versionIds);

                    if (!versionsError && versions && versions.length > 0) {
                        // category_id 목록 추출
                        const categoryIds = [...new Set(versions.map(v => v.category_id).filter(Boolean))];

                        // activity_categories 조회
                        interface ActivityCategory {
                            id: number;
                            name: string;
                            color: string;
                            icon: string;
                        }

                        let categoriesMap: Record<number, ActivityCategory> = {};
                        if (categoryIds.length > 0) {
                            const { data: categories } = await supabase
                                .from('activity_categories')
                                .select('id, name, color, icon')
                                .in('id', categoryIds);

                            if (categories) {
                                categoriesMap = categories.reduce((acc, cat) => {
                                    acc[cat.id] = cat;
                                    return acc;
                                }, {} as Record<number, ActivityCategory>);
                            }
                        }

                        // 작성자 정보 조회
                        const authorIds = [...new Set(activitiesMeta.map(a => a.author_id).filter(Boolean))];
                        const { data: authors } = await supabase
                            .from('user_profiles')
                            .select('id, nickname, name, profile_image')
                            .in('id', authorIds);

                        // 메타데이터와 버전 데이터 병합
                        const activitiesWithData = activitiesMeta.map(meta => {
                            const version = versions.find(v => v.id === meta.published_version_id);
                            if (version) {
                                const author = authors?.find(a => a.id === meta.author_id);
                                return {
                                    id: meta.id, // activities 테이블의 id
                                    title: version.title,
                                    subtitle: version.subtitle,
                                    thumbnail: version.thumbnail,
                                    post_type: 'activity',
                                    board_type: 'activities',
                                    author_id: meta.author_id,
                                    author: author || { nickname: 'Unknown', name: 'Unknown', profile_image: null },
                                    display_date: meta.published_at || null,
                                    created_at: meta.published_at || null,
                                    published_at: meta.published_at,
                                    status: 'published',
                                    category: version.category_id ? categoriesMap[version.category_id] : null,
                                    views_count_cached: meta.views_count_cached || 0,
                                    likes_count_cached: meta.likes_count_cached || 0,
                                    bookmarks_count_cached: meta.bookmarks_count_cached || 0,
                                    comments_count_cached: meta.comments_count_cached || 0,
                                    location: version.location,
                                    start_date: version.start_date,
                                    end_date: version.end_date,
                                    max_participants: version.max_participants,
                                    participation_fee: version.participation_fee,
                                    contact_info: version.contact_info,
                                    has_voting: version.has_voting,
                                    vote_options: version.vote_options,
                                    vote_deadline: version.vote_deadline,
                                    published_version_id: meta.published_version_id
                                };
                            }
                            return null;
                        }).filter(Boolean);

                        allPosts.push(...activitiesWithData);
                    }
                }
            }
        }

        // 날짜순으로 정렬 (최신순)
        allPosts.sort((a, b) => {
            if (!a || !b) return 0;
            const dateA = a.display_date ? new Date(a.display_date).getTime() : 0;
            const dateB = b.display_date ? new Date(b.display_date).getTime() : 0;
            return dateB - dateA;
        });

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
