import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 관리자용 프로젝트 목록 조회
export async function GET(request: NextRequest) {
    try {
        console.log('관리자 프로젝트 API 시작');
        const supabase = await createServerSupabase();

        // 쿼리 파라미터 파싱
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';

        console.log('관리자 프로젝트 API - 파라미터:', { page, limit, search, status });

        // 현재 사용자 확인
        console.log('관리자 프로젝트 API - 사용자 확인 시작');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('관리자 프로젝트 API - 사용자 결과:', { user: !!user, authError });

        if (authError || !user) {
            console.log('관리자 프로젝트 API - 인증 실패:', authError);
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        console.log('관리자 프로젝트 API - 권한 확인 시작:', user.id);
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log('관리자 프로젝트 API - 프로필 결과:', { userProfile, profileError });

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        if (!isAdmin) {
            console.log('관리자 프로젝트 API - 관리자 권한 없음:', userProfile?.role);
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        // 프로젝트 목록 조회 (작성자 정보를 별도로 조회)
        console.log('관리자 프로젝트 API - 프로젝트 조회 시작');
        let query = supabase
            .from('projects')
            .select(`
                id,
                title,
                author_id,
                status,
                project_status,
                is_pinned,
                is_featured,
                views,
                likes_count,
                comments_count,
                created_at,
                updated_at
            `, { count: 'exact' });

        // 검색 필터
        if (search) {
            query = query.ilike('title', `%${search}%`);
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

        const { data: projects, error, count } = await query;

        console.log('관리자 프로젝트 API - 프로젝트 조회 결과:', {
            projectsCount: projects?.length || 0,
            totalCount: count,
            error
        });

        if (error) {
            console.error('프로젝트 조회 오류:', error);
            return NextResponse.json({ error: '프로젝트를 조회하는데 실패했습니다.' }, { status: 500 });
        }

        // 작성자 정보를 별도로 조회
        console.log('관리자 프로젝트 API - 작성자 정보 조회 시작');
        const authorIds = [...new Set(projects?.map(p => p.author_id) || [])];
        const { data: authors, error: authorsError } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .in('id', authorIds);

        console.log('관리자 프로젝트 API - 작성자 정보 조회 결과:', {
            authorsCount: authors?.length || 0,
            authorsError
        });

        // 작성자 정보 매핑
        console.log('관리자 프로젝트 API - 작성자 정보 매핑 시작');
        const projectsWithAuthor = projects?.map(project => {
            const author = authors?.find(a => a.id === project.author_id);
            return {
                ...project,
                author: {
                    nickname: author?.nickname || '알 수 없음',
                    profile_image: author?.profile_image || null
                }
            };
        }) || [];

        console.log('관리자 프로젝트 API - 최종 결과:', {
            totalProjects: projectsWithAuthor.length,
            totalCount: count,
            currentPage: page,
            totalPages: Math.ceil((count || 0) / limit),
            projects: projectsWithAuthor.map(p => ({ id: p.id, title: p.title, author: p.author.nickname }))
        });

        return NextResponse.json({
            projects: projectsWithAuthor,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                hasNext: page < Math.ceil((count || 0) / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('관리자 프로젝트 조회 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}




