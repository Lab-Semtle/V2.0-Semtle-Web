import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 출판되지 않은 자료 목록 조회 (관리자 전용)
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

        // 새 스키마: 출판되지 않은 자료 메타데이터 조회 (draft, private)
        const { data: resourcesMeta, error: resourcesError } = await supabase
            .from('resources')
            .select(`
                id,
                author_id,
                status,
                is_pinned,
                views_count_cached,
                likes_count_cached,
                bookmarks_count_cached,
                comments_count_cached,
                downloads_count_cached,
                published_at,
                republished_at,
                published_version_id
            `)
            .in('status', ['draft', 'private'])
            .order('id', { ascending: false }); // created_at 컬럼 제거로 인해 ID 기준 정렬 (최신순)

        if (resourcesError) {
            return NextResponse.json({ error: '자료를 조회하는데 실패했습니다.' }, { status: 500 });
        }

        // 새 스키마: published_version_id 또는 최신 버전으로 버전 데이터 JOIN
        interface ResourceVersion {
            id: number;
            resource_id: number;
            title: string;
            subtitle?: string;
            content: unknown;
            thumbnail?: string | string[] | null;
            category_id?: number | null;
            resource_type_id?: number | null;
            file_url?: string | null;
            file_size?: number | null;
            file_extension?: string | null;
            original_filename?: string | null;
            year?: number | null;
            semester?: string | null;
            subject?: string | null;
            professor?: string | null;
            difficulty_level?: number | null;
            rating?: number | null;
            rating_count?: number | null;
            tags?: string[];
            created_at: string;
        }

        interface ResourceCategory {
            id: number;
            name: string;
            color: string;
            icon?: string;
        }

        interface ResourceType {
            id: number;
            name: string;
            icon?: string;
            color?: string;
        }

        interface ResourceMeta {
            id: number;
            author_id: string;
            status: string;
            is_pinned?: boolean;
            views_count_cached: number;
            likes_count_cached: number;
            bookmarks_count_cached: number;
            comments_count_cached: number;
            downloads_count_cached: number;
            published_at?: string | null;
            republished_at?: string | null;
            published_version_id: number | null;
        }

        type Resource = ResourceMeta & Partial<ResourceVersion> & {
            category?: ResourceCategory | null;
            resource_type?: ResourceType | null;
            comments_count?: number;
            views?: number;
            likes_count?: number;
            bookmarks_count?: number;
            downloads_count?: number;
            author?: { id: string; nickname: string; profile_image?: string | null } | null;
        };

        let resources: Resource[] = [];
        if (resourcesMeta && resourcesMeta.length > 0) {
            // 각 자료의 최신 버전 조회 (published_version_id가 없으면 최신 버전 사용)
            const resourcesWithVersions = await Promise.all(
                resourcesMeta.map(async (meta) => {
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

                    if (!versionId) return null;

                    const { data: version } = await supabase
                        .from('resource_versions')
                        .select(`
                            id,
                            resource_id,
                            title,
                            subtitle,
                            content,
                            thumbnail,
                            category_id,
                            resource_type_id,
                            file_url,
                            file_size,
                            file_extension,
                            original_filename,
                            year,
                            semester,
                            subject,
                            professor,
                            difficulty_level,
                            rating,
                            rating_count,
                            tags,
                            created_at
                        `)
                        .eq('id', versionId)
                        .single();

                    if (!version) return null;

                    // category 조회
                    let category = null;
                    if (version.category_id) {
                        const { data: categoryData } = await supabase
                            .from('resource_categories')
                            .select('id, name, color, icon')
                            .eq('id', version.category_id)
                            .single();

                        category = categoryData;
                    }

                    // resource_type 조회
                    let resource_type = null;
                    if (version.resource_type_id) {
                        const { data: typeData } = await supabase
                            .from('resource_types')
                            .select('id, name, icon, color')
                            .eq('id', version.resource_type_id)
                            .single();

                        resource_type = typeData;
                    }

                    return {
                        ...meta,
                        ...version,
                        id: meta.id, // resources 테이블 ID 유지
                        category,
                        resource_type
                    } as Resource;
                })
            );

            resources = resourcesWithVersions.filter((resource): resource is Resource => resource !== null);
        }

        // 각 자료의 댓글 개수는 트리거에서 자동 관리
        if (resources && resources.length > 0) {
            resources = resources.map((resource) => ({
                ...resource,
                comments_count: resource.comments_count_cached || 0,
                views: resource.views_count_cached || 0,
                likes_count: resource.likes_count_cached || 0,
                bookmarks_count: resource.bookmarks_count_cached || 0,
                downloads_count: resource.downloads_count_cached || 0
            }));
        }

        // 작성자 정보를 별도로 조회
        if (resources && resources.length > 0) {
            const authorIds = resources.map(r => r.author_id).filter(Boolean);
            if (authorIds.length > 0) {
                const { data: authors } = await supabase
                    .from('user_profiles')
                    .select('id, nickname, profile_image')
                    .in('id', authorIds);

                // 작성자 정보를 자료에 매핑
                resources.forEach(resource => {
                    resource.author = authors?.find(a => a.id === resource.author_id) || null;
                });
            }
        }

        return NextResponse.json({
            resources: resources || []
        });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

