import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

interface FileData {
    url: string;
    size: number;
    name: string;
    type: string;
}

// 자료실 게시물 목록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 쿼리 파라미터
        const { searchParams } = new URL(request.url);
        const category_id = searchParams.get('category_id');
        const subject = searchParams.get('subject');
        const professor = searchParams.get('professor');
        const semester = searchParams.get('semester');
        const year = searchParams.get('year');
        const difficulty_level = searchParams.get('difficulty_level');
        const downloads_min = searchParams.get('downloads_min');
        const downloads_max = searchParams.get('downloads_max');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // 자료실 게시물 조회 (최적화된 구조)
        let query = supabase
            .from('resources')
            .select(`
                *,
                category:resource_categories(*)
            `)
            .eq('status', 'published');

        // 필터 적용 (최적화된 구조에 맞게)
        if (category_id) {
            query = query.eq('category_id', category_id);
        }

        if (subject) {
            query = query.ilike('subject', `%${subject}%`);
        }

        if (professor) {
            query = query.ilike('professor', `%${professor}%`);
        }

        if (semester) {
            query = query.eq('semester', semester);
        }

        if (year) {
            query = query.eq('year', parseInt(year));
        }

        if (difficulty_level) {
            query = query.eq('difficulty_level', difficulty_level);
        }

        if (downloads_min) {
            query = query.gte('downloads_count', parseInt(downloads_min));
        }

        if (downloads_max) {
            query = query.lte('downloads_count', parseInt(downloads_max));
        }

        // 정렬 옵션
        const sortBy = searchParams.get('sort') || 'latest';

        if (sortBy === 'latest') {
            query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'popular') {
            query = query.order('views', { ascending: false });
        } else if (sortBy === 'likes') {
            query = query.order('likes_count', { ascending: false });
        } else if (sortBy === 'downloads') {
            query = query.order('downloads_count', { ascending: false });
        } else if (sortBy === 'rating') {
            query = query.order('rating', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: resources, error, count } = await query;

        if (error) {
            return NextResponse.json({ error: '자료 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

        // 각 자료별 실제 좋아요 수와 다운로드 수 계산, 작성자 정보 및 파일 목록 조회
        const resourcesWithActualCounts = await Promise.all(
            (resources || []).map(async (resource) => {
                try {
                    // 실제 좋아요 수 계산
                    const { data: likeCountData } = await supabase
                        .from('resource_likes')
                        .select('id', { count: 'exact' })
                        .eq('resource_id', resource.id);

                    const actualLikesCount = likeCountData?.length || 0;

                    // 실제 다운로드 수 계산
                    const { data: downloadCountData } = await supabase
                        .from('resource_downloads')
                        .select('id', { count: 'exact' })
                        .eq('resource_id', resource.id);

                    const actualDownloadsCount = downloadCountData?.length || 0;

                    // 작성자 정보 조회
                    const { data: authorData } = await supabase
                        .from('user_profiles')
                        .select('id, nickname, name, profile_image, role')
                        .eq('id', resource.author_id)
                        .single();

                    // 파일 목록 조회
                    const { data: filesData } = await supabase
                        .from('resource_files')
                        .select('*')
                        .eq('resource_id', resource.id)
                        .order('upload_order');

                    // resources 테이블의 likes_count와 downloads_count를 실제 값으로 업데이트
                    await supabase
                        .from('resources')
                        .update({
                            likes_count: actualLikesCount,
                            downloads_count: actualDownloadsCount
                        })
                        .eq('id', resource.id);

                    return {
                        ...resource,
                        likes_count: actualLikesCount,
                        downloads_count: actualDownloadsCount,
                        author: authorData,
                        files: filesData || []
                    };
                } catch {
                    return resource;
                }
            })
        );

        // 카테고리 목록 조회
        const categoriesResult = await supabase
            .from('resource_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        return NextResponse.json({
            resources: resourcesWithActualCounts,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            },
            categories: categoriesResult.data || []
        });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 자료실 게시물 생성
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const resourceData = await request.json();

        const {
            title,
            description,
            content,
            thumbnail,
            category,
            status = 'draft',
            subject,
            professor,
            semester,
            year,
            difficulty_level = 'intermediate',
            files
        } = resourceData;

        // 필수 필드 검증
        if (!title) {
            return NextResponse.json({ error: '제목은 필수입니다.' }, { status: 400 });
        }

        // 카테고리 ID 찾기
        let category_id = null;
        if (category) {
            const { data: categoryData } = await supabase
                .from('resource_categories')
                .select('id')
                .eq('name', category)
                .single();
            category_id = categoryData?.id;
        }

        // 파일 정보는 resource_files 테이블에서 관리하므로 여기서는 처리하지 않음

        // 자료 데이터 생성 (파일 정보 제외)
        const insertData = {
            title,
            subtitle: description || '',
            content: content || null,
            thumbnail,
            category_id,
            author_id: user.id,
            status: status === 'published' ? 'published' : 'draft',
            tags: [],
            subject: subject || '',
            professor: professor || '',
            semester: semester || '',
            year: year ? parseInt(year) : new Date().getFullYear(),
            difficulty_level,
            rating: 0.0,
            rating_count: 0,
            downloads_count: 0,
            published_at: status === 'published' ? new Date().toISOString() : null
        };

        const { data: newResource, error: resourceError } = await supabase
            .from('resources')
            .insert(insertData)
            .select()
            .single();

        if (resourceError) {
            return NextResponse.json({ error: '자료 생성에 실패했습니다.' }, { status: 500 });
        }

        // 여러 파일을 resource_files 테이블에 저장
        if (files && files.length > 0) {
            const fileInserts = files.map((file: FileData, index: number) => {
                // URL에서 실제 파일 경로만 추출
                let filePath = file.url;
                const urlParts = file.url.split('/');
                const bucketIndex = urlParts.findIndex(part => part === 'resources');
                if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
                    filePath = urlParts.slice(bucketIndex + 1).join('/');
                }

                return {
                    resource_id: newResource.id,
                    file_path: filePath,
                    file_size: file.size,
                    file_extension: file.name.split('.').pop() || '',
                    original_filename: file.name,
                    file_type: file.type,
                    upload_order: index + 1
                };
            });

            const { error: filesError } = await supabase
                .from('resource_files')
                .insert(fileInserts);

            if (filesError) {
                // 파일 저장 실패해도 자료는 생성되었으므로 계속 진행
            }
        }

        // 완전한 데이터 조회 (파일 목록 포함)
        const { data: completeResource } = await supabase
            .from('resources')
            .select(`
        *,
        category:resource_categories(*),
        author:user_profiles!resources_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        ),
        files:resource_files(*)
      `)
            .eq('id', newResource.id)
            .single();

        return NextResponse.json({ resource: completeResource }, { status: 201 });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
