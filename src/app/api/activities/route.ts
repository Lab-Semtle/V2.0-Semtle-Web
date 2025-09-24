import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ActivityCreateData } from '@/types/activity';

// 활동 게시물 목록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 쿼리 파라미터
        const { searchParams } = new URL(request.url);
        const activity_type = searchParams.get('activity_type');
        const location = searchParams.get('location');
        const start_date_from = searchParams.get('start_date_from');
        const start_date_to = searchParams.get('start_date_to');
        const has_voting = searchParams.get('has_voting');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // 활동 게시물 조회 (새로운 분리된 구조)
        let query = supabase
            .from('activities')
            .select(`
        *,
        category:board_categories(*),
        author:user_profiles!activities_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        )
      `)
            .eq('status', 'published');

        // 필터 적용 (새로운 구조에 맞게)
        if (activity_type) {
            query = query.eq('activity_type', activity_type);
        }

        if (location) {
            query = query.ilike('location', `%${location}%`);
        }

        if (start_date_from) {
            query = query.gte('start_date', start_date_from);
        }

        if (start_date_to) {
            query = query.lte('start_date', start_date_to);
        }

        if (has_voting === 'true') {
            query = query.not('vote_options', 'is', null);
        }

        // 정렬 (시작일 기준)
        query = query.order('start_date', { ascending: false });

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: activities, error, count } = await query;

        if (error) {
            console.error('활동 목록 조회 오류:', error);
            return NextResponse.json({ error: '활동 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

        // 카테고리 목록 조회
        const { data: categories } = await supabase
            .from('board_categories')
            .select('*')
            .eq('board_type', 'activities')
            .eq('is_active', true)
            .order('sort_order');

        return NextResponse.json({
            activities: activities || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            },
            categories: categories || []
        });
    } catch (error) {
        console.error('활동 목록 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 활동 게시물 생성 (관리자 전용)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
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
            return NextResponse.json({ error: '활동 게시판은 관리자만 작성할 수 있습니다.' }, { status: 403 });
        }

        const activityData: ActivityCreateData = await request.json();
        const {
            title,
            subtitle,
            content,
            thumbnail,
            category_id,
            status = 'draft',
            tags = [],
            activity_type,
            location,
            start_date,
            end_date,
            max_participants,
            vote_options,
            vote_deadline,
            allow_multiple_votes = false
        } = activityData;

        // 필수 필드 검증
        if (!title || !content || !activity_type) {
            return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
        }

        // 슬러그 생성
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-') + '-' + Date.now();

        // 트랜잭션으로 게시물과 활동 데이터 생성
        const { data: newActivity, error: activityError } = await supabase
            .from('activities')
            .insert({
                title,
                subtitle,
                content,
                thumbnail,
                slug,
                category_id,
                author_id: user.id,
                status,
                tags,
                activity_type,
                location,
                start_date,
                end_date,
                max_participants,
                current_participants: 0,
                vote_options: vote_options || [],
                vote_deadline,
                allow_multiple_votes,
                published_at: status === 'published' ? new Date().toISOString() : null
            })
            .select()
            .single();

        if (activityError) {
            console.error('활동 게시물 생성 오류:', activityError);
            return NextResponse.json({ error: '활동 게시물 생성에 실패했습니다.' }, { status: 500 });
        }

        // 완전한 데이터 조회
        const { data: completeActivity } = await supabase
            .from('activities')
            .select(`
        *,
        category:board_categories(*),
        author:user_profiles!activities_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        )
      `)
            .eq('id', newActivity.id)
            .single();

        return NextResponse.json({ activity: completeActivity }, { status: 201 });
    } catch (error) {
        console.error('활동 생성 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
