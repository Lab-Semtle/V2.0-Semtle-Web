import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 내가 신청한 모든 프로젝트 목록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // URL에서 페이지네이션 파라미터 추출
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '5');
        const offset = (page - 1) * limit;

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
            console.error('인증 오류:', authError);
            return NextResponse.json({ error: '인증 오류가 발생했습니다.' }, { status: 401 });
        }
        if (!user) {
            console.log('사용자가 로그인하지 않음');
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        console.log('사용자 인증 성공:', { userId: user.id, email: user.email });

        // 전체 신청 수 조회
        const { count: totalCount, error: countError } = await supabase
            .from('project_applications')
            .select('*', { count: 'exact', head: true })
            .eq('applicant_id', user.id);

        if (countError) {
            console.error('신청 수 조회 오류:', countError);
            return NextResponse.json({ error: '신청 수를 불러올 수 없습니다.' }, { status: 500 });
        }

        // 페이지네이션된 신청 목록 조회
        const { data: applications, error } = await supabase
            .from('project_applications')
            .select('*')
            .eq('applicant_id', user.id)
            .order('applied_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('신청 목록 조회 오류:', error);
            return NextResponse.json({ error: '신청 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

        console.log('기본 신청 목록 조회 성공:', { count: applications?.length || 0 });

        // 프로젝트 정보가 필요한 경우에만 추가 조회
        if (applications && applications.length > 0) {
            const projectIds = applications.map(app => app.project_id);
            console.log('프로젝트 ID 목록:', projectIds);

            // 프로젝트 기본 정보 조회
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select(`
                    id,
                    title,
                    subtitle,
                    thumbnail,
                    project_status,
                    team_size,
                    current_members,
                    deadline,
                    created_at,
                    author_id,
                    category_id,
                    project_type_id
                `)
                .in('id', projectIds);

            if (projectsError) {
                console.error('프로젝트 정보 조회 오류:', projectsError);
                // 프로젝트 정보 없이도 신청 목록은 반환
            } else {
                console.log('프로젝트 기본 정보 조회 성공:', projects?.length || 0);

                // 카테고리 정보 조회
                const categoryIds = [...new Set(projects?.map(p => p.category_id).filter(Boolean) || [])];
                const { data: categories } = await supabase
                    .from('project_categories')
                    .select('id, name')
                    .in('id', categoryIds);

                // 프로젝트 타입 정보 조회
                const typeIds = [...new Set(projects?.map(p => p.project_type_id).filter(Boolean) || [])];
                const { data: projectTypes } = await supabase
                    .from('project_types')
                    .select('id, name, color')
                    .in('id', typeIds);

                // 작성자 정보 조회
                const authorIds = [...new Set(projects?.map(p => p.author_id).filter(Boolean) || [])];
                const { data: authors } = await supabase
                    .from('user_profiles')
                    .select('id, nickname, name, profile_image')
                    .in('id', authorIds);

                // 프로젝트 정보를 신청에 추가
                const applicationsWithProjects = applications.map(app => {
                    const project = projects?.find(p => p.id === app.project_id);
                    if (!project) {
                        return { ...app, project: null };
                    }

                    const category = categories?.find(c => c.id === project.category_id);
                    const projectType = projectTypes?.find(t => t.id === project.project_type_id);
                    const author = authors?.find(a => a.id === project.author_id);

                    return {
                        ...app,
                        project: {
                            ...project,
                            category: category ? { name: category.name } : null,
                            project_type: projectType ? { name: projectType.name, color: projectType.color } : null,
                            author: author || null
                        }
                    };
                });

                console.log('최종 응답 데이터 준비 완료:', applicationsWithProjects.length);
                return NextResponse.json({
                    applications: applicationsWithProjects,
                    pagination: {
                        page,
                        limit,
                        total: totalCount || 0,
                        totalPages: Math.ceil((totalCount || 0) / limit)
                    }
                });
            }
        }

        // 빈 배열도 정상적인 응답으로 처리
        const result = applications || [];
        console.log('신청 목록 조회 성공:', { count: result.length, userId: user.id });
        return NextResponse.json({
            applications: result,
            pagination: {
                page,
                limit,
                total: totalCount || 0,
                totalPages: Math.ceil((totalCount || 0) / limit)
            }
        });
    } catch (error) {
        console.error('API 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
