import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 출판되지 않은 활동 목록 조회 (관리자 전용)
export async function GET() {
    try {
        const supabase = await createServerSupabase();

        // 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        // 새 스키마: 출판되지 않은 활동 메타데이터 조회 (draft, private)
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
            .in('status', ['draft', 'private'])
            .order('id', { ascending: false }); // created_at 컬럼 제거로 인해 ID 기준 정렬 (최신순)

        if (activitiesError) {
            return NextResponse.json({ error: '활동을 조회하는데 실패했습니다.' }, { status: 500 });
        }

        // 새 스키마: published_version_id 또는 최신 버전으로 버전 데이터 JOIN
        interface ActivityVersion {
            id: number;
            activity_id: number;
            title: string;
            subtitle?: string;
            content: unknown;
            thumbnail?: string | string[] | null;
            category_id?: number | null;
            location?: string | null;
            start_date?: string | null;
            end_date?: string | null;
            max_participants?: number | null;
            participation_fee?: number;
            contact_info?: string | null;
            tags?: string[];
            has_voting?: boolean;
            vote_options?: unknown;
            vote_deadline?: string | null;
            created_at: string;
        }

        interface ActivityCategory {
            id: number;
            name: string;
            color: string;
            icon: string;
        }

        interface ActivityMeta {
            id: number;
            author_id: string;
            status: string;
            is_pinned?: boolean;
            views_count_cached: number;
            likes_count_cached: number;
            bookmarks_count_cached: number;
            comments_count_cached: number;
            published_at?: string | null;
            republished_at?: string | null;
            published_version_id: number | null;
        }

        type Activity = ActivityMeta & ActivityVersion & {
            category: ActivityCategory | null;
            comments_count?: number;
            views?: number;
            likes_count?: number;
            bookmarks_count?: number;
            author?: { id: string; nickname: string; profile_image?: string | null } | null;
        };

        let activities: Activity[] = [];
        if (activitiesMeta && activitiesMeta.length > 0) {
            // 각 활동의 최신 버전 조회 (published_version_id가 없으면 최신 버전 사용)
            const activitiesWithVersions = await Promise.all(
                activitiesMeta.map(async (meta) => {
                    let versionId = meta.published_version_id;

                    // published_version_id가 없으면 최신 버전 조회
                    if (!versionId) {
                        const { data: latestVersion } = await supabase
                            .from('activity_versions')
                            .select('id')
                            .eq('activity_id', meta.id)
                            .order('version_number', { ascending: false })
                            .limit(1)
                            .single();

                        versionId = latestVersion?.id || null;
                    }

                    if (!versionId) return null;

                    const { data: version } = await supabase
                        .from('activity_versions')
                        .select(`
                        id,
                        activity_id,
                        title,
                        subtitle,
                        content,
                        thumbnail,
                        category_id,
                        location,
                        start_date,
                        end_date,
                        max_participants,
                        participation_fee,
                        contact_info,
                        tags,
                        has_voting,
                        vote_options,
                            vote_deadline,
                            created_at
                    `)
                        .eq('id', versionId)
                        .single();

                    if (!version) return null;

                    // category 조회
                    let category = null;
                    if (version.category_id) {
                        const { data: categoryData } = await supabase
                            .from('activity_categories')
                            .select('id, name, color, icon')
                            .eq('id', version.category_id)
                            .single();

                        category = categoryData;
                    }

                    return {
                        ...meta,
                        ...version,
                        id: meta.id, // activities 테이블 ID 유지
                        category
                    } as Activity;
                })
            );

            activities = activitiesWithVersions.filter((activity): activity is Activity => activity !== null);
        }

        // 각 활동의 댓글 개수, 좋아요 개수 조회
        if (activities && activities.length > 0) {
            const activitiesWithCounts = await Promise.all(
                activities.map(async (activity) => {
                    const [commentCountResult, likeCountResult] = await Promise.all([
                        supabase
                            .from('activity_comments')
                            .select('*', { count: 'exact', head: true })
                            .eq('activity_id', activity.id)
                            .is('parent_id', null)
                            .eq('is_deleted', false),
                        supabase
                            .from('activity_likes')
                            .select('*', { count: 'exact', head: true })
                            .eq('activity_id', activity.id)
                    ]);

                    return {
                        ...activity,
                        // 실제 댓글 개수 사용 (답글 제외)
                        comments_count: commentCountResult.count || 0,
                        views: activity.views_count_cached || 0,
                        // 실제 좋아요 개수 사용
                        likes_count: likeCountResult.count || 0,
                        bookmarks_count: activity.bookmarks_count_cached || 0
                    };
                })
            );

            activities = activitiesWithCounts;
        }

        // 작성자 정보를 별도로 조회
        if (activities && activities.length > 0) {
            const authorIds = activities.map(a => a.author_id).filter(Boolean);
            if (authorIds.length > 0) {
                const { data: authors } = await supabase
                    .from('user_profiles')
                    .select('id, nickname, profile_image')
                    .in('id', authorIds);

                // 작성자 정보를 활동에 매핑
                activities.forEach(activity => {
                    activity.author = authors?.find(a => a.id === activity.author_id) || null;
                });
            }
        }

        return NextResponse.json({
            activities: activities || []
        });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

