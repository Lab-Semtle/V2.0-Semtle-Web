import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 관리자용 자료실 목록 조회
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

        // 자료실 목록 조회 (메타데이터만)
        let resourcesQuery = supabase
            .from('resources')
            .select(`
                id,
                author_id,
                status,
                is_pinned,
                is_featured,
                is_verified,
                views_count_cached,
                likes_count_cached,
                comments_count_cached,
                downloads_count_cached,
                published_at,
                republished_at,
                published_version_id
            `, { count: 'exact' });

        // 상태 필터
        if (status !== 'all') {
            resourcesQuery = resourcesQuery.eq('status', status);
        }

        // 정렬
        resourcesQuery = resourcesQuery.order('is_pinned', { ascending: false })
            .order('published_at', { ascending: false });

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        resourcesQuery = resourcesQuery.range(from, to);

        const { data: resourcesMeta, error: resourcesError, count } = await resourcesQuery;

        if (resourcesError) {
            console.error('Error fetching resources metadata:', resourcesError);
            return NextResponse.json({ error: '자료실을 조회하는데 실패했습니다.' }, { status: 500 });
        }

        if (!resourcesMeta || resourcesMeta.length === 0) {
            return NextResponse.json({
                resources: [],
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
        const resourceVersionMap = new Map<number, number>();

        for (const meta of resourcesMeta) {
            let versionId = meta.published_version_id;

            // published_version_id가 없으면 최신 버전 조회
            if (!versionId) {
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

        if (versionIds.length === 0) {
            return NextResponse.json({
                resources: [],
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
            .from('resource_versions')
            .select('id, resource_id, title, subtitle, subject, professor, year, semester, created_at, updated_at')
            .in('id', versionIds);

        // 검색 필터 (버전 테이블에서 검색)
        if (search) {
            versionsQuery = versionsQuery.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%,subject.ilike.%${search}%,professor.ilike.%${search}%`);
        }

        const { data: versions, error: versionsError } = await versionsQuery;

        if (versionsError) {
            console.error('Error fetching resource versions:', versionsError);
            return NextResponse.json({ error: '버전 데이터를 조회하는데 실패했습니다.' }, { status: 500 });
        }

        // 검색 필터가 있고 버전이 없으면 빈 배열 반환
        if (search && (!versions || versions.length === 0)) {
            return NextResponse.json({
                resources: [],
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

        // 검색이 있는 경우: 매칭된 버전의 resource_id만 필터링
        const filteredResourceIds = search && versions
            ? new Set(versions.map(v => v.resource_id))
            : null;

        // 자료 메타데이터와 버전 데이터 병합
        const versionMap = new Map(versions?.map(v => [v.id, v]) || []);
        const resources = resourcesMeta
            .map(meta => {
                // 검색 필터가 있고 자료가 매칭되지 않으면 제외
                if (filteredResourceIds && !filteredResourceIds.has(meta.id)) {
                    return null;
                }

                const versionId = resourceVersionMap.get(meta.id);
                const version = versionId ? versionMap.get(versionId) : null;

                return {
                    ...meta,
                    title: version?.title || null,
                    subtitle: version?.subtitle || null,
                    subject: version?.subject || null,
                    professor: version?.professor || null,
                    year: version?.year || null,
                    semester: version?.semester || null,
                    views: meta.views_count_cached || 0,
                    likes_count: meta.likes_count_cached || 0,
                    comments_count: meta.comments_count_cached || 0,
                    downloads_count: meta.downloads_count_cached || 0,
                    created_at: version?.created_at || meta.published_at || null,
                    updated_at: version?.updated_at || meta.republished_at || null
                };
            })
            .filter((resource): resource is NonNullable<typeof resource> => resource !== null);

        // 작성자 정보를 별도로 조회
        const authorIds = [...new Set(resources.map(r => r.author_id).filter((id): id is string => Boolean(id)))];
        const { data: authors } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .in('id', authorIds);

        // 작성자 정보 매핑
        const authorMap = new Map(authors?.map(a => [a.id, a]) || []);
        const resourcesWithAuthor = resources.map(resource => {
            const author = authorMap.get(resource.author_id);
            return {
                ...resource,
                author: {
                    nickname: author?.nickname || '알 수 없음',
                    profile_image: author?.profile_image || null
                }
            };
        });

        return NextResponse.json({
            resources: resourcesWithAuthor,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                hasNext: page < Math.ceil((count || 0) / limit),
                hasPrev: page > 1
            }
        });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

