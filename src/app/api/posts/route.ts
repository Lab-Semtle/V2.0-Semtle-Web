import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 게시물 목록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 쿼리 파라미터
        const { searchParams } = new URL(request.url);
        const board_type = searchParams.get('board_type') as 'activities' | 'projects' | 'resources' | null;
        const category_id = searchParams.get('category_id');
        const status = searchParams.get('status') || 'published';
        const search = searchParams.get('search') || '';
        const tags = searchParams.get('tags')?.split(',') || [];
        const is_pinned = searchParams.get('is_pinned');
        const is_featured = searchParams.get('is_featured');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sort_field = searchParams.get('sort_field') || 'created_at';
        const sort_order = searchParams.get('sort_order') || 'desc';

        // 게시물 조회 쿼리
        let query = supabase
            .from('posts')
            .select(`
        *,
        category:board_categories(*),
        author:user_profiles!posts_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        )
      `)
            .eq('status', status);

        // 필터 적용
        if (board_type) {
            query = query.eq('board_type', board_type);
        }

        if (category_id) {
            query = query.eq('category_id', parseInt(category_id));
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%`);
        }

        if (tags.length > 0) {
            query = query.overlaps('tags', tags);
        }

        if (is_pinned !== null) {
            query = query.eq('is_pinned', is_pinned === 'true');
        }

        if (is_featured !== null) {
            query = query.eq('is_featured', is_featured === 'true');
        }

        // 정렬
        query = query.order(sort_field, { ascending: sort_order === 'asc' });

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: posts, error, count } = await query;

        if (error) {
            console.error('게시물 목록 조회 오류:', error);
            return NextResponse.json({ error: '게시물 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

        // 카테고리 목록 조회
        const { data: categories } = await supabase
            .from('board_categories')
            .select('*')
            .eq('board_type', board_type || 'activities')
            .eq('is_active', true)
            .order('sort_order');

        return NextResponse.json({
            posts: posts || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            },
            categories: categories || []
        });
    } catch (error) {
        console.error('게시물 목록 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 게시물 생성
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const postData = await request.json();
        const { title, subtitle, content, thumbnail, board_type, category_id, status = 'draft', tags = [], attachments = [] } = postData;

        // 필수 필드 검증
        if (!title || !content || !board_type || !category_id) {
            return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
        }

        // 활동 게시판은 관리자만 작성 가능
        if (board_type === 'activities') {
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
                return NextResponse.json({ error: '활동 게시판은 관리자만 작성할 수 있습니다.' }, { status: 403 });
            }
        }

        // 슬러그 생성
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-') + '-' + Date.now();

        // 게시물 생성
        const { data: newPost, error } = await supabase
            .from('posts')
            .insert({
                title,
                subtitle,
                content,
                thumbnail,
                slug,
                board_type,
                category_id,
                author_id: user.id,
                status,
                tags,
                attachments,
                published_at: status === 'published' ? new Date().toISOString() : null
            })
            .select(`
        *,
        category:board_categories(*),
        author:user_profiles!posts_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        )
      `)
            .single();

        if (error) {
            console.error('게시물 생성 오류:', error);
            return NextResponse.json({ error: '게시물 생성에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ post: newPost }, { status: 201 });
    } catch (error) {
        console.error('게시물 생성 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
