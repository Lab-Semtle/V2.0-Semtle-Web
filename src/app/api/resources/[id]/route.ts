import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 특정 자료 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabase();

    try {
        const { id: idParam } = await params;

        // 먼저 resources 테이블에서 조회 시도
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

        let resourceId: string | null = idParam;
        let resourceMeta: ResourceMeta | null = null;
        let metaError: Error | null = null;

        const { data: resourceMetaDirect, error: directError } = await supabase
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
            .eq('id', idParam)
            .maybeSingle();

        if (resourceMetaDirect) {
            resourceMeta = resourceMetaDirect;
        } else {
            // resources 테이블에서 찾지 못했으면 resource_versions 테이블에서 resource_id 찾기
            const { data: version, error: versionError } = await supabase
                .from('resource_versions')
                .select('resource_id')
                .eq('id', idParam)
                .maybeSingle();

            if (version && version.resource_id) {
                resourceId = version.resource_id;

                const { data: resourceMetaRetry, error: retryError } = await supabase
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
                    .eq('id', resourceId)
                    .maybeSingle();

                if (resourceMetaRetry) {
                    resourceMeta = resourceMetaRetry;
                } else {
                    metaError = retryError;
                }
            } else {
                metaError = directError || versionError;
            }
        }

        if (metaError) {
            console.error('Error fetching resource metadata:', metaError);
            return NextResponse.json({ error: '자료를 조회하는 중 오류가 발생했습니다.' }, { status: 500 });
        }

        if (!resourceMeta) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 버전 데이터 조회
        const isEditMode = request.headers.get('x-edit-mode') === 'true';
        
        interface ResourceVersion {
            id: number;
            resource_id: number;
            title: string;
            subtitle?: string;
            content: unknown;
            thumbnail?: string | string[] | null;
            category_id?: number | null;
            resource_type_id?: number | null;
            subject?: string | null;
            professor?: string | null;
            year?: number | null;
            semester?: string | null;
            created_at: string;
            updated_at?: string | null;
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

        type Resource = ResourceMeta & Partial<ResourceVersion> & {
            category?: ResourceCategory | null;
            resource_type?: ResourceType | null;
            comments_count?: number;
            current_participants?: number;
            views?: number;
            likes_count?: number;
            bookmarks_count?: number;
            downloads_count?: number;
            files?: Array<{
                resource_id: number;
                file_path: string;
                file_size: number;
                file_extension: string;
                original_filename: string;
                file_type: string;
                upload_order: number;
            }>;
            author?: { id: string; nickname: string; name?: string; profile_image?: string | null } | null;
        };
        
        let resource: Resource = resourceMeta;
        
        const requestedVersionId = request.headers.get('x-version-id');
        let targetVersionId = isEditMode && requestedVersionId
            ? parseInt(requestedVersionId)
            : resourceMeta.published_version_id;

        if (isEditMode && !targetVersionId) {
            targetVersionId = resourceMeta.published_version_id;
        }

        // published_version_id가 없으면 최신 버전 조회 (비공개/임시저장 게시물)
        if (!targetVersionId) {
            const { data: latestVersion } = await supabase
                .from('resource_versions')
                .select('id')
                .eq('resource_id', resourceMeta.id)
                .order('version_number', { ascending: false })
                .limit(1)
                .single();

            if (latestVersion) {
                targetVersionId = latestVersion.id;
            }
        }

        if (targetVersionId) {
            const { data: version, error: versionError } = await supabase
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
                    created_at,
                    updated_at
                `)
                .eq('id', targetVersionId)
                .single();

            if (!versionError && version) {
                let category = null;
                if (version.category_id) {
                    const { data: categoryData } = await supabase
                        .from('resource_categories')
                        .select('id, name, color, icon')
                        .eq('id', version.category_id)
                        .single();

                    category = categoryData;
                }

                let resource_type = null;
                if (version.resource_type_id) {
                    const { data: typeData } = await supabase
                        .from('resource_types')
                        .select('id, name, icon, color')
                        .eq('id', version.resource_type_id)
                        .single();

                    resource_type = typeData;
                }

                resource = {
                    ...resourceMeta,
                    ...version,
                    id: resourceMeta.id,
                    category,
                    resource_type
                };
            }
        } else if (isEditMode) {
            resource = resourceMeta;
        }

        // 작성자 정보 조회
        if (resource && resource.author_id) {
            const { data: author } = await supabase
                .from('user_profiles')
                .select('id, nickname, name, profile_image')
                .eq('id', resource.author_id)
                .single();

            resource.author = author;
        }

        // 다운로드 수 집계 (댓글 개수는 트리거에서 자동 관리)
        const { count: downloadsCount } = await supabase
            .from('resource_downloads')
            .select('*', { count: 'exact', head: true })
            .eq('resource_id', resourceId);

        // 파일 정보 조회
        const { data: files } = await supabase
            .from('resource_files')
            .select('id, resource_id, file_path, file_size, file_extension, original_filename, file_type, upload_order')
            .eq('resource_id', resourceId)
            .order('upload_order', { ascending: true });

        // 댓글 개수와 다운로드 수를 자료 데이터에 추가
        if (resource) {
            resource.comments_count = resource.comments_count_cached || 0;
            resource.downloads_count = downloadsCount || 0;
            resource.views = resource.views_count_cached || 0;
            resource.likes_count = resource.likes_count_cached || 0;
            resource.bookmarks_count = resource.bookmarks_count_cached || 0;
            resource.files = files || [];
        }

        return NextResponse.json({ resource });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
