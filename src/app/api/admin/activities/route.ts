import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 관리자용 활동 목록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 쿼리 파라미터 파싱
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';

        // 사용자 확인 (보안상 getUser 사용)
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

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        if (!isAdmin) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        // 활동 목록 조회 (메타데이터만)
        let activitiesQuery = supabase
            .from('activities')
            .select(`
                id,
                author_id,
                status,
                is_pinned,
                views_count_cached,
                likes_count_cached,
                comments_count_cached,
                published_at,
                republished_at,
                published_version_id
            `, { count: 'exact' });

        // 상태 필터
        if (status !== 'all') {
            activitiesQuery = activitiesQuery.eq('status', status);
        }

        // 정렬
        activitiesQuery = activitiesQuery.order('is_pinned', { ascending: false })
            .order('published_at', { ascending: false });

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        activitiesQuery = activitiesQuery.range(from, to);

        const { data: activitiesMeta, error: activitiesError, count } = await activitiesQuery;

        if (activitiesError) {
            console.error('Error fetching activities metadata:', activitiesError);
            return NextResponse.json({ error: '활동을 조회하는데 실패했습니다.' }, { status: 500 });
        }

        if (!activitiesMeta || activitiesMeta.length === 0) {
            return NextResponse.json({
                activities: [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit),
                    hasNext: false,
                    hasPrev: page > 1
                }
            });
        }

        // 버전 ID 수집 (published_version_id 또는 최신 버전)
        const versionIds: number[] = [];
        const activityVersionMap = new Map<number, number>();

        for (const meta of activitiesMeta) {
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

            if (versionId) {
                versionIds.push(versionId);
                activityVersionMap.set(meta.id, versionId);
            }
        }

        if (versionIds.length === 0) {
            return NextResponse.json({
                activities: [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit),
                    hasNext: false,
                    hasPrev: page > 1
                }
            });
        }

        // 버전 데이터 조회
        let versionsQuery = supabase
            .from('activity_versions')
            .select('id, activity_id, title, subtitle, location, start_date, end_date, max_participants, created_at, updated_at')
            .in('id', versionIds);

        // 검색 필터 (버전 테이블에서 검색)
        if (search) {
            versionsQuery = versionsQuery.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%,location.ilike.%${search}%`);
        }

        const { data: versions, error: versionsError } = await versionsQuery;

        if (versionsError) {
            console.error('Error fetching activity versions:', versionsError);
            return NextResponse.json({ error: '버전 데이터를 조회하는데 실패했습니다.' }, { status: 500 });
        }

        // 검색 필터가 있고 버전이 없으면 빈 배열 반환
        if (search && (!versions || versions.length === 0)) {
            return NextResponse.json({
                activities: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                }
            });
        }

        // 검색이 있는 경우: 매칭된 버전의 activity_id만 필터링
        const filteredActivityIds = search && versions
            ? new Set(versions.map(v => v.activity_id))
            : null;

        // 활동 메타데이터와 버전 데이터 병합
        const versionMap = new Map(versions?.map(v => [v.id, v]) || []);
        const activities = activitiesMeta
            .map(meta => {
                // 검색 필터가 있고 활동이 매칭되지 않으면 제외
                if (filteredActivityIds && !filteredActivityIds.has(meta.id)) {
                    return null;
                }

                const versionId = activityVersionMap.get(meta.id);
                const version = versionId ? versionMap.get(versionId) : null;

                return {
                    ...meta,
                    title: version?.title || null,
                    subtitle: version?.subtitle || null,
                    location: version?.location || null,
                    start_date: version?.start_date || null,
                    end_date: version?.end_date || null,
                    max_participants: version?.max_participants || null,
                    views: meta.views_count_cached || 0,
                    likes_count: meta.likes_count_cached || 0,
                    comments_count: meta.comments_count_cached || 0,
                    created_at: version?.created_at || meta.published_at || null,
                    updated_at: version?.updated_at || meta.republished_at || null,
                    current_participants: 0 // 아래에서 집계로 채움
                } as {
                    id: number;
                    author_id: string;
                    status: string;
                    is_pinned?: boolean;
                    views_count_cached: number;
                    likes_count_cached: number;
                    comments_count_cached: number;
                    published_at?: string | null;
                    republished_at?: string | null;
                    published_version_id: number | null;
                    title: string | null;
                    subtitle: string | null;
                    location: string | null;
                    start_date: string | null;
                    end_date: string | null;
                    max_participants: number | null;
                    views: number;
                    likes_count: number;
                    comments_count: number;
                    created_at: string | null;
                    updated_at: string | null;
                    current_participants: number;
                };
            })
            .filter((activity): activity is NonNullable<typeof activity> => activity !== null);

        // 각 활동의 참가자 수 집계
        if (activities && activities.length > 0) {
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

            activities.splice(0, activities.length, ...activitiesWithParticipants);
        }

        // 작성자 정보를 별도로 조회
        const authorIds = [...new Set(activities.map(a => a.author_id).filter((id): id is string => Boolean(id)))];
        const { data: authors } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .in('id', authorIds);

        // 작성자 정보 매핑
        const authorMap = new Map(authors?.map(a => [a.id, a]) || []);
        const activitiesWithAuthor = activities.map(activity => {
            const author = authorMap.get(activity.author_id);
            return {
                ...activity,
                author: {
                    nickname: author?.nickname || '알 수 없음',
                    profile_image: author?.profile_image || null
                }
            };
        });

        return NextResponse.json({
            activities: activitiesWithAuthor,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                hasNext: page < Math.ceil((count || 0) / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Admin activities API error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

