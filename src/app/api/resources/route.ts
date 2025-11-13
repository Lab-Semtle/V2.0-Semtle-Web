import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 자료실 게시물 목록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 쿼리 파라미터
        const { searchParams } = new URL(request.url);
        const category_id = searchParams.get('category_id');
        const author_id = searchParams.get('author_id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sortBy = searchParams.get('sort') || 'latest';

        // 자료실 목록 조회 (메타데이터만)
        let query = supabase
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
            `);

        // 작성자 필터 적용
        if (author_id) {
            // 내 자료: 모든 상태의 자료 조회 (draft, private, public 모두 포함)
            query = query.eq('author_id', author_id);
            // published_version_id 필터 제거: 초안도 포함하기 위함
        } else {
            // 전체 자료: 공개 자료만 조회, published_version_id가 있는 것만
            query = query.eq('status', 'public')
                .not('published_version_id', 'is', null);
        }

        // 필터 적용
        if (category_id) {
            // category는 버전 데이터에 있으므로 나중에 필터링
        }

        // 정렬 옵션
        if (sortBy === 'latest') {
            query = query.order('published_at', { ascending: false });
        } else if (sortBy === 'popular') {
            query = query.order('views_count_cached', { ascending: false });
        } else if (sortBy === 'likes') {
            query = query.order('likes_count_cached', { ascending: false });
        } else if (sortBy === 'downloads') {
            query = query.order('downloads_count_cached', { ascending: false });
        } else {
            query = query.order('published_at', { ascending: false });
        }

        // is_pinned 우선 정렬
        query = query.order('is_pinned', { ascending: false });

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: resourcesMeta, error, count } = await query;

        if (error) {
            console.error('Error fetching resources metadata:', error);
            return NextResponse.json({ error: '자료 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

        // 버전 데이터 JOIN
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
            likes_count?: number;
            comments_count?: number;
            views?: number;
            file_size?: number;
            author?: { id: string; nickname: string; name?: string; profile_image?: string | null } | null;
        };

        let resources: Resource[] = [];
        if (resourcesMeta && resourcesMeta.length > 0) {
            // 내 자료인 경우: published_version_id가 없으면 최신 버전 조회
            if (author_id) {
                // 각 자료별로 버전 조회 (published_version_id가 있으면 그것, 없으면 최신 버전)
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

                        // 버전이 없으면 제외
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
            } else {
                // 전체 자료: published_version_id로 버전 조회 (기존 로직)
                const versionIds = resourcesMeta
                    .map(r => r.published_version_id)
                    .filter(Boolean);

                if (versionIds.length > 0) {
                    const { data: versions, error: versionsError } = await supabase
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
                        .in('id', versionIds);

                    if (versionsError) {
                        console.error('Error fetching resource versions:', versionsError);
                        resources = [];
                    } else if (versions && versions.length > 0) {
                        // category_id 목록 추출
                        const categoryIds = [...new Set(versions.map(v => v.category_id).filter(Boolean))];

                        // resource_categories 조회
                        let categoriesMap: Record<number, ResourceCategory> = {};
                        if (categoryIds.length > 0) {
                            const { data: categories } = await supabase
                                .from('resource_categories')
                                .select('id, name, color, icon')
                                .in('id', categoryIds);

                            if (categories) {
                                categoriesMap = categories.reduce((acc, cat) => {
                                    acc[cat.id] = cat;
                                    return acc;
                                }, {} as Record<number, ResourceCategory>);
                            }
                        }

                        // resource_type_id 목록 추출
                        const typeIds = [...new Set(versions.map(v => v.resource_type_id).filter(Boolean))];
                        let typesMap: Record<number, ResourceType> = {};
                        if (typeIds.length > 0) {
                            const { data: types } = await supabase
                                .from('resource_types')
                                .select('id, name, icon, color')
                                .in('id', typeIds);

                            if (types) {
                                typesMap = types.reduce((acc, t) => {
                                    acc[t.id] = t;
                                    return acc;
                                }, {} as Record<number, ResourceType>);
                            }
                        }

                        // 메타데이터와 버전 데이터 병합
                        const mappedResources = resourcesMeta.map(meta => {
                            const version = versions.find(v => v.id === meta.published_version_id);
                            if (version) {
                                return {
                                    ...meta,
                                    ...version,
                                    id: meta.id, // resources 테이블의 id를 명시적으로 유지
                                    category: version.category_id ? categoriesMap[version.category_id] : null,
                                    resource_type: version.resource_type_id ? typesMap[version.resource_type_id] : null,
                                } as Resource;
                            }
                            return null;
                        });
                        resources = mappedResources.filter((resource): resource is Resource => resource !== null);
                    } else {
                        resources = [];
                    }
                }
            }

            // 카테고리 필터 적용
            if (category_id) {
                resources = resources.filter(r => r.category_id === parseInt(category_id));
            }
        }

        // 각 자료의 실제 좋아요 개수 및 댓글 개수 조회
        if (resources && resources.length > 0) {
            const resourcesWithCounts = await Promise.all(
                resources.map(async (resource) => {
                    const [likeCountResult, commentCountResult] = await Promise.all([
                        supabase
                            .from('resource_likes')
                            .select('*', { count: 'exact', head: true })
                            .eq('resource_id', resource.id),
                        supabase
                            .from('resource_comments')
                            .select('*', { count: 'exact', head: true })
                            .eq('resource_id', resource.id)
                            .is('parent_id', null)
                            .eq('is_deleted', false)
                    ]);

                    return {
                        ...resource,
                        // 실제 좋아요 개수 사용
                        likes_count: likeCountResult.count || 0,
                        // 실제 댓글 개수 사용 (답글 제외)
                        comments_count: commentCountResult.count || 0,
                        views: resource.views_count_cached || 0,
                        bookmarks_count: resource.bookmarks_count_cached || 0,
                        downloads_count: resource.downloads_count_cached || 0
                    };
                })
            );

            resources = resourcesWithCounts;
        }

        // 작성자 정보를 별도로 조회
        if (resources && resources.length > 0) {
            const authorIds = resources.map(r => r.author_id).filter(Boolean);
            if (authorIds.length > 0) {
                const { data: authors } = await supabase
                    .from('user_profiles')
                    .select('id, nickname, profile_image')
                    .in('id', authorIds);

                // 작성자 정보를 리소스에 매핑
                resources.forEach(resource => {
                    resource.author = authors?.find(a => a.id === resource.author_id) || null;
                });
            }
        }

        // 카테고리 목록 조회
        const { data: categories } = await supabase
            .from('resource_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        return NextResponse.json({
            resources: resources || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            },
            categories: categories || []
        });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 자료실 게시물 생성
export async function POST(request: NextRequest) {
    const supabase = await createServerSupabase();

    try {
        const body = await request.json();
        const {
            title,
            subtitle,
            content,
            category_id,
            thumbnail,
            status = 'draft',
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
            files
        } = body;

        // 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json(
                { error: '인증되지 않은 요청입니다.' },
                { status: 401 }
            );
        }

        // thumbnail을 배열 형태로 변환
        const thumbnailArray = Array.isArray(thumbnail)
            ? thumbnail
            : (thumbnail && thumbnail.trim() ? [thumbnail] : []);

        // 새 스키마: 외래키 제약조건 때문에 resources를 먼저 생성해야 함
        const insertData = {
            author_id: user.id,
            status: 'draft' as const,
            published_version_id: null,
        };

        // 자료 생성 (RLS 정책이 auth.uid()를 사용하여 작동)
        const { data: resource, error: resourceError } = await supabase
            .from('resources')
            .insert(insertData)
            .select()
            .single();

        if (resourceError) {
            console.error('Resource creation error:', resourceError);
            throw resourceError;
        }

        // 첫 번째 버전 생성 (v1, version_code='v1')
        const versionCode = 'v1';
        const { data: firstVersion, error: versionError } = await supabase
            .from('resource_versions')
            .insert({
                resource_id: resource.id,
                author_id: user.id,
                version_number: 1,
                version_code: versionCode,
                parent_version_id: null,
                content,
                title,
                subtitle,
                thumbnail: thumbnailArray.length > 0 ? thumbnailArray : null,
                category_id: category_id || null,
                resource_type_id: resource_type_id || null,
                file_url: file_url || null,
                file_size: file_size || null,
                file_extension: file_extension || null,
                original_filename: original_filename || null,
                year: year || null,
                semester: semester || null,
                subject: subject || null,
                professor: professor || null,
                difficulty_level: difficulty_level || null,
                rating: rating || 0,
                rating_count: rating_count || 0,
                tags: tags || []
            })
            .select()
            .single();

        if (versionError) {
            console.error('First version creation error:', versionError);
            // 버전 생성 실패 시 자료도 삭제
            await supabase.from('resources').delete().eq('id', resource.id);
            throw versionError;
        }

        // 파일 저장 처리
        interface FileInput {
            file_path?: string;
            url?: string;
            size?: number;
            name?: string;
            type?: string;
        }

        if (files && Array.isArray(files) && files.length > 0) {
            const fileRecords = files.map((file: FileInput, index: number) => ({
                resource_id: resource.id,
                file_path: file.file_path || file.url || '',
                file_size: file.size || 0,
                file_extension: file.name?.split('.').pop()?.toLowerCase() || '',
                original_filename: file.name || '',
                file_type: file.type || 'application/octet-stream',
                upload_order: index + 1
            })).filter((file) => file.file_path); // file_path가 있는 것만 저장

            if (fileRecords.length > 0) {
                const { error: filesError } = await supabase
                    .from('resource_files')
                    .insert(fileRecords);

                if (filesError) {
                    console.error('Files save error:', filesError);
                    // 파일 저장 실패해도 버전 생성은 성공했으므로 경고만
                }
            }
        }

        // 출판 시: 버전이 생성되었으므로 이제 status='public'으로 업데이트 가능
        if (status !== 'draft') {
            const finalStatus = status === 'published' ? 'public' : 'private';

            // 버전이 준비되었으므로 status와 published_version_id를 한 번에 업데이트
            const { data: updatedResource, error: updateError } = await supabase
                .from('resources')
                .update({
                    status: finalStatus,
                    published_version_id: firstVersion.id,
                    published_at: new Date().toISOString(),
                    republished_at: new Date().toISOString()
                })
                .eq('id', resource.id)
                .select('id, published_version_id, status')
                .single();

            if (updateError) {
                console.error('Update resource status error:', updateError);
                // 업데이트 실패 시 버전과 자료 모두 삭제
                await supabase.from('resource_versions').delete().eq('id', firstVersion.id);
                await supabase.from('resources').delete().eq('id', resource.id);
                throw updateError;
            }

            // 응답용 resource 객체 구성
            const responseResource = {
                ...resource,
                ...firstVersion,
                published_version_id: updatedResource?.published_version_id || firstVersion.id,
                status: updatedResource?.status || finalStatus
            };

            return NextResponse.json({
                message: '자료가 성공적으로 생성되었습니다.',
                resource: responseResource
            }, { status: 201 });
        } else {
            // 임시저장 (draft): published_version_id는 NULL 그대로 유지, status도 draft 유지
            const responseResource = {
                ...resource,
                ...firstVersion,
                published_version_id: null,
                status: 'draft'
            };

            return NextResponse.json({
                message: '자료가 임시저장되었습니다.',
                resource: responseResource
            }, { status: 201 });
        }

    } catch (error) {
        console.error('Resource creation error:', error);
        return NextResponse.json(
            { error: '자료 생성에 실패했습니다.' },
            { status: 500 }
        );
    }
}
