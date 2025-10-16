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

        // 활동 목록 조회
        let query = supabase
            .from('activities')
            .select(`
                id,
                title,
                subtitle,
                author_id,
                status,
                is_pinned,
                is_featured,
                views,
                likes_count,
                comments_count,
                location,
                start_date,
                end_date,
                max_participants,
                current_participants,
                created_at,
                updated_at
            `, { count: 'exact' });

        // 검색 필터
        if (search) {
            query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
        }

        // 상태 필터
        if (status !== 'all') {
            query = query.eq('status', status);
        }

        // 정렬
        query = query.order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: activities, error, count } = await query;

        if (error) {
            return NextResponse.json({ error: '활동을 조회하는데 실패했습니다.' }, { status: 500 });
        }

        // 작성자 정보를 별도로 조회
        const authorIds = [...new Set(activities?.map(a => a.author_id) || [])];
        const { data: authors } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .in('id', authorIds);

        // 작성자 정보 매핑
        const activitiesWithAuthor = activities?.map(activity => {
            const author = authors?.find(a => a.id === activity.author_id);
            return {
                ...activity,
                author: {
                    nickname: author?.nickname || '알 수 없음',
                    profile_image: author?.profile_image || null
                }
            };
        }) || [];

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
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

