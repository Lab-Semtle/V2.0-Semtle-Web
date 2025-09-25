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
        const subject = searchParams.get('subject');
        const professor = searchParams.get('professor');
        const semester = searchParams.get('semester');
        const year = searchParams.get('year');
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
        resource_type:resource_types(*),
        author:user_profiles!resources_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        )
      `)
            .eq('status', 'published');

        // 필터 적용 (최적화된 구조에 맞게)
        if (resource_type_id) {
            query = query.eq('resource_type_id', resource_type_id);
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



        if (downloads_min) {
            query = query.gte('downloads_count', parseInt(downloads_min));
        }

        if (downloads_max) {
            query = query.lte('downloads_count', parseInt(downloads_max));
        }

        // 정렬 (다운로드 수 기준)
        query = query.order('downloads_count', { ascending: false });

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: resources, error, count } = await query;

        if (error) {
            console.error('자료 목록 조회 오류:', error);
            return NextResponse.json({ error: '자료 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

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
            resources: resources || [],
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
        console.error('자료 목록 조회 중 오류:', error);
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
        console.log('Received resource data:', resourceData);

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
            difficulty_level = 'intermediate'
        } = resourceData;

        // 필수 필드 검증
        if (!title || !resource_type_id) {
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

        // 자료 데이터 생성 (최적화된 구조)
        const { data: newResource, error: resourceError } = await supabase
            .from('resources')
            .insert({
                title,
                subtitle: description || '',
                content: content || null,
                thumbnail,
                category_id,
                resource_type_id,
                author_id: user.id,
                status: status === 'published' ? 'published' : 'draft',
                tags: [],
                file_url: '',
                file_size: 0,
                file_extension: '',
                original_filename: '',
                subject: subject || '',
                professor: professor || '',
                semester: semester || '',
                year: year ? parseInt(year) : new Date().getFullYear(),
                difficulty_level,
                rating: 0.0,
                rating_count: 0,
                downloads_count: 0,
                published_at: status === 'published' ? new Date().toISOString() : null
            })
            .select()
            .single();

        if (resourceError) {
            console.error('자료 생성 오류:', resourceError);
            return NextResponse.json({ error: '자료 생성에 실패했습니다.' }, { status: 500 });
        }

        // 완전한 데이터 조회
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
        )
      `)
            .eq('id', newResource.id)
            .single();

        return NextResponse.json({ resource: completeResource }, { status: 201 });
    } catch (error) {
        console.error('자료 생성 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
