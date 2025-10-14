import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 내 프로젝트들의 신청자 통합 관리
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
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 전체 프로젝트 수 조회
        const { count: totalCount, error: countError } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', user.id)
            .eq('status', 'published');

        if (countError) {
            console.error('프로젝트 수 조회 오류:', countError);
            return NextResponse.json({ error: '프로젝트 수를 불러올 수 없습니다.' }, { status: 500 });
        }

        // 페이지네이션된 프로젝트 목록 조회
        const { data: myProjects, error: projectsError } = await supabase
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
                category:project_categories(name),
                project_type:project_types(name, color)
            `)
            .eq('author_id', user.id)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (projectsError) {
            console.error('프로젝트 목록 조회 오류:', projectsError);
            return NextResponse.json({ error: '프로젝트 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

        console.log('내 프로젝트 목록:', myProjects?.length || 0, '개');

        // 각 프로젝트별 신청자 목록 조회
        const projectsWithApplications = await Promise.all(
            (myProjects || []).map(async (project) => {
                try {
                    console.log(`프로젝트 ${project.id} (${project.title}) 신청자 조회 시작`);

                    // 먼저 신청자 ID 목록을 가져옵니다
                    const { data: applications, error: applicationsError } = await supabase
                        .from('project_applications')
                        .select('*')
                        .eq('project_id', project.id)
                        .order('applied_at', { ascending: false });

                    if (applicationsError) {
                        console.error(`프로젝트 ${project.id} 신청자 조회 오류:`, applicationsError);
                        return { ...project, applications: [] };
                    }

                    // 신청자가 있는 경우에만 사용자 프로필 정보를 조회합니다
                    let applicationsWithProfiles = [];
                    if (applications && applications.length > 0) {
                        const applicantIds = applications.map(app => app.applicant_id);

                        const { data: profiles, error: profilesError } = await supabase
                            .from('user_profiles')
                            .select('id, nickname, name, profile_image, major, grade, github_url, portfolio_url')
                            .in('id', applicantIds);

                        if (profilesError) {
                            console.error(`프로젝트 ${project.id} 사용자 프로필 조회 오류:`, profilesError);
                            // 프로필 정보 없이도 신청 목록은 반환
                            applicationsWithProfiles = applications.map(app => ({
                                ...app,
                                applicant: {
                                    id: app.applicant_id,
                                    nickname: '알 수 없음',
                                    name: '알 수 없음',
                                    profile_image: null,
                                    major: null,
                                    grade: null,
                                    github_url: null,
                                    portfolio_url: null
                                }
                            }));
                        } else {
                            // 프로필 정보와 신청 정보를 매칭합니다
                            applicationsWithProfiles = applications.map(app => {
                                const profile = profiles?.find(p => p.id === app.applicant_id);
                                return {
                                    ...app,
                                    applicant: profile || {
                                        id: app.applicant_id,
                                        nickname: '알 수 없음',
                                        name: '알 수 없음',
                                        profile_image: null,
                                        major: null,
                                        grade: null,
                                        github_url: null,
                                        portfolio_url: null
                                    }
                                };
                            });
                        }
                    }

                    console.log(`프로젝트 ${project.id} 신청자 조회 결과:`, applicationsWithProfiles.length, '명');
                    if (applicationsWithProfiles.length > 0) {
                        console.log('신청자 상세 정보:', applicationsWithProfiles.map(app => ({
                            id: app.id,
                            applicant_id: app.applicant_id,
                            status: app.status,
                            applicant: app.applicant ? {
                                nickname: app.applicant.nickname,
                                name: app.applicant.name
                            } : 'null'
                        })));
                    }

                    return {
                        ...project,
                        applications: applicationsWithProfiles,
                        applicant_count: applicationsWithProfiles.filter(app => app.status === 'pending').length
                    };
                } catch (error) {
                    console.error(`프로젝트 ${project.id} 처리 중 오류:`, error);
                    return { ...project, applications: [], applicant_count: 0 };
                }
            })
        );

        return NextResponse.json({
            projects: projectsWithApplications,
            pagination: {
                page,
                limit,
                total: totalCount || 0,
                totalPages: Math.ceil((totalCount || 0) / limit)
            }
        });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
