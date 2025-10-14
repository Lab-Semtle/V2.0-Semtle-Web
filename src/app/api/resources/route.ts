import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ResourceCreateData } from '@/types/resource';

// 자료실 게시물 목록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 쿼리 파라미터
        const { searchParams } = new URL(request.url);
        const resource_type_id = searchParams.get('resource_type_id');
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
                category:resource_categories(*),
                resource_type:resource_types(id, name, description, icon, color, file_extensions, is_active, sort_order)
            `)
            .eq('status', 'published');

        // 필터 적용 (최적화된 구조에 맞게)
        if (resource_type_id) {
            query = query.eq('resource_type_id', resource_type_id);
        }

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

        console.log('자료실 API 응답:', {
            resourcesCount: resources?.length || 0,
            error: error?.message,
            count
        });

        if (error) {
            console.error('자료실 조회 오류:', error);
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
                } catch (error) {
                    console.error(`자료 ${resource.id} 처리 중 오류:`, error);
                    return resource;
                }
            })
        );

        // 카테고리 및 타입 목록 조회
        const [categoriesResult, typesResult] = await Promise.all([
            supabase
                .from('resource_categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order'),
            supabase
                .from('resource_types')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')
        ]);

        return NextResponse.json({
            resources: resourcesWithActualCounts,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            },
            categories: categoriesResult.data || [],
            types: typesResult.data || []
        });
    } catch (error) {
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
            resource_type_id,
            status = 'draft',
            subject,
            professor,
            semester,
            year,
            difficulty_level = 'intermediate',
            files
        } = resourceData;

        // 필수 필드 검증
        if (!title || !resource_type_id) {
            console.log('필수 필드 검증 실패:', { title, resource_type_id });
            return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
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
            resource_type_id,
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

        console.log('자료 생성 데이터:', insertData);

        const { data: newResource, error: resourceError } = await supabase
            .from('resources')
            .insert(insertData)
            .select()
            .single();

        if (resourceError) {
            console.error('자료 생성 오류:', resourceError);
            return NextResponse.json({ error: '자료 생성에 실패했습니다.' }, { status: 500 });
        }

        // 여러 파일을 resource_files 테이블에 저장
        if (files && files.length > 0) {
            console.log('여러 파일 저장 시작:', files.length);

            const fileInserts = files.map((file, index) => ({
                resource_id: newResource.id,
                file_path: file.url,
                file_size: file.size,
                file_extension: file.name.split('.').pop() || '',
                original_filename: file.name,
                file_type: file.type,
                upload_order: index + 1
            }));

            const { error: filesError } = await supabase
                .from('resource_files')
                .insert(fileInserts);

            if (filesError) {
                console.error('파일 저장 오류:', filesError);
                // 파일 저장 실패해도 자료는 생성되었으므로 계속 진행
            } else {
                console.log('파일 저장 성공:', fileInserts.length);
            }
        }

        // 완전한 데이터 조회 (파일 목록 포함)
        const { data: completeResource } = await supabase
            .from('resources')
            .select(`
        *,
        category:resource_categories(*),
        resource_type:resource_types(*),
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
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
