import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 관리자용 사용자 목록 조회
export async function GET(request: NextRequest) {
    try {
        // Authorization 헤더에서 토큰 확인
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const supabase = await createServerSupabase();

        // 토큰으로 사용자 확인
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        const { data: currentUser } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role)) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        // 쿼리 파라미터
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const role = searchParams.get('role') || '';

        // 사용자 목록 조회
        let query = supabase
            .from('user_profiles')
            .select(`
        id,
        student_id,
        nickname,
        name,
        email,
        major,
        grade,
        role,
        status,
        email_verified,
        total_posts,
        total_likes_received,
        total_comments,
        created_at,
        last_login,
        suspended_until,
        suspension_reason
      `)
            .order('created_at', { ascending: false });

        // 필터 적용
        if (search) {
            query = query.or(`nickname.ilike.%${search}%,name.ilike.%${search}%,student_id.ilike.%${search}%`);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (role) {
            query = query.eq('role', role);
        }

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: users, error, count } = await query;

        if (error) {
            console.error('사용자 목록 조회 오류:', error);
            return NextResponse.json({ error: '사용자 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });
    } catch (error) {
        console.error('사용자 목록 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

