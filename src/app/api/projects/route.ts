import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 프로젝트 게시물 목록 조회
export async function GET(request: NextRequest) {
    try {

        // 쿼리 파라미터
        const { searchParams } = new URL(request.url);
        const project_type = searchParams.get('project_type');
        const difficulty = searchParams.get('difficulty');
        const location = searchParams.get('location');
        const tech_stack = searchParams.get('tech_stack')?.split(',') || [];
        const project_status = searchParams.get('project_status'); // 기본값 제거
        const deadline_from = searchParams.get('deadline_from');
        const deadline_to = searchParams.get('deadline_to');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // 프로젝트 게시물 조회 (최적화된 구조)
        let query = supabase
            .from('projects')
            .select(`
        *,
        category:project_categories(*),
        project_type:project_types(*),
        project_status_info:project_statuses!project_status(name, display_name, color, icon)
      `)
            .eq('status', 'published');

        // 필터 적용 (최적화된 구조에 맞게)
        if (project_type) {
            query = query.eq('project_type_id', project_type);
        }

        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }

        if (location) {
            query = query.eq('location', location);
        }

        if (tech_stack.length > 0) {
            query = query.overlaps('tech_stack', tech_stack);
        }

        if (project_status && project_status !== 'all') {
            query = query.eq('project_status', project_status);
        }

        if (deadline_from) {
            query = query.gte('deadline', deadline_from);
        }

        if (deadline_to) {
            query = query.lte('deadline', deadline_to);
        }

        // 정렬 (고정된 게시물 우선, 그 다음 최신순)
        query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: projects, error, count } = await query;

        if (error) {
            return NextResponse.json({ error: '프로젝트 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

        // 디버깅: 좋아요 카운트 확인
        if (projects && projects.length > 0) {
            console.log('프로젝트 목록 좋아요 카운트:', projects.map(p => ({ id: p.id, title: p.title, likes_count: p.likes_count })));
        }

        // 카테고리 및 타입 목록 조회
        const [categoriesResult, typesResult] = await Promise.all([
            supabase
                .from('project_categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order'),
            supabase
                .from('project_types')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')
        ]);

        // 작성자 정보 조회 및 좋아요 수 동기화
        const projectsWithAuthors = await Promise.all(
            (projects || []).map(async (project) => {
                // 실제 좋아요 수 계산
                const { data: likeCountData } = await supabase
                    .from('project_likes')
                    .select('id', { count: 'exact' })
                    .eq('project_id', project.id);

                const actualLikesCount = likeCountData?.length || 0;

                // projects 테이블의 likes_count를 실제 값으로 업데이트
                await supabase
                    .from('projects')
                    .update({ likes_count: actualLikesCount })
                    .eq('id', project.id);

                const { data: author } = await supabase
                    .from('user_profiles')
                    .select('id, nickname, name, profile_image, role')
                    .eq('id', project.author_id)
                    .single();

                // 실제 승인된 팀원 수 계산 (작성자 + 승인된 신청자)
                // project_team_members 테이블에서 프로젝트 작성자를 제외한 승인된 팀원 수
                await supabase
                    .from('project_team_members')
                    .select('id, user_id')
                    .eq('project_id', project.id)
                    .eq('status', 'active')
                    .neq('user_id', project.author_id); // 작성자 제외

                // 승인된 신청자 수 (project_applications에서 status='accepted'인 것들)
                const { data: acceptedApplications } = await supabase
                    .from('project_applications')
                    .select('id')
                    .eq('project_id', project.id)
                    .eq('status', 'accepted');

                // 실제 신청자 수 계산 (대기중인 신청자만)
                const { data: applications } = await supabase
                    .from('project_applications')
                    .select('id')
                    .eq('project_id', project.id)
                    .eq('status', 'pending');

                const actualApplicantCount = applications?.length || 0;

                // 작성자(1) + 승인된 신청자 수
                const actualCurrentMembers = 1 + (acceptedApplications?.length || 0);

                // 디버깅 로그
                console.log(`프로젝트 ${project.id} 모집현황:`, {
                    project_title: project.title,
                    author_id: project.author_id,
                    team_size: project.team_size,
                    accepted_applications: acceptedApplications?.length || 0,
                    actual_current_members: actualCurrentMembers,
                    pending_applications: actualApplicantCount
                });

                return {
                    ...project,
                    likes_count: actualLikesCount, // 실제 좋아요 수 사용
                    author: author || null,
                    project_data: {
                        team_size: project.team_size,
                        needed_skills: project.needed_skills,
                        deadline: project.deadline,
                        difficulty: project.difficulty,
                        location: project.location,
                        project_goals: project.project_goals,
                        tech_stack: project.tech_stack,
                        github_url: project.github_url,
                        demo_url: project.demo_url,
                        project_status: project.project_status,
                        current_members: actualCurrentMembers,
                        progress_percentage: project.progress_percentage
                    },
                    project_type: project.project_type, // 프로젝트 타입 정보 포함
                    applicant_count: actualApplicantCount // 실제 신청자 수
                };
            })
        );

        return NextResponse.json({
            projects: projectsWithAuthors,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            },
            categories: categoriesResult.data || [],
            types: typesResult.data || []
        });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 프로젝트 게시물 생성
export async function POST(request: NextRequest) {
    try {
        const projectData = await request.json();

        const {
            title,
            description,
            content,
            thumbnail,
            category,
            project_type_id,
            status = 'draft',
            team_size,
            needed_skills,
            deadline,
            difficulty,
            location,
            project_status,
            project_goals,
            userId
        } = projectData;


        // 필수 필드 검증
        if (!title || !description || !content || !userId || !project_type_id || !team_size || !deadline || !difficulty || !location || !project_status) {
            return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
        }

        // 카테고리 ID 찾기
        let category_id = null;
        if (category) {
            const { data: categoryData } = await supabase
                .from('project_categories')
                .select('id')
                .eq('name', category)
                .single();
            category_id = categoryData?.id;
        }

        // 프로젝트 데이터 생성 (최적화된 구조)
        const { data: newProject, error: projectError } = await supabase
            .from('projects')
            .insert({
                title,
                subtitle: description || '',
                content: content || null,
                thumbnail,
                category_id,
                project_type_id,
                author_id: userId,
                status: status === 'published' ? 'published' : 'draft',
                tags: [],
                team_size: parseInt(team_size),
                current_members: 1, // 작성자 포함
                needed_skills: needed_skills || [],
                deadline: new Date(deadline).toISOString(),
                difficulty,
                location,
                project_status: project_status || 'recruiting',
                tech_stack: [],
                project_goals: project_goals || '',
                published_at: status === 'published' ? new Date().toISOString() : null
            })
            .select()
            .single();

        if (projectError) {
            return NextResponse.json({ error: '프로젝트 생성에 실패했습니다.' }, { status: 500 });
        }

        // 프로젝트 리더로 팀원 추가
        await supabase
            .from('project_team_members')
            .insert({
                project_id: newProject.id,
                user_id: userId,
                role: 'leader',
                status: 'active'
            });

        // 완전한 데이터 조회
        const { data: completeProject } = await supabase
            .from('projects')
            .select(`
        *,
        category:project_categories(*),
        project_type:project_types(*)
      `)
            .eq('id', newProject.id)
            .single();

        // 작성자 정보 조회
        const { data: author } = await supabase
            .from('user_profiles')
            .select('id, nickname, name, profile_image, role')
            .eq('id', completeProject.author_id)
            .single();

        const projectWithAuthor = {
            ...completeProject,
            author: author || null,
            project_data: {
                team_size: completeProject.team_size,
                needed_skills: completeProject.needed_skills,
                deadline: completeProject.deadline,
                difficulty: completeProject.difficulty,
                location: completeProject.location,
                project_goals: completeProject.project_goals,
                tech_stack: completeProject.tech_stack,
                github_url: completeProject.github_url,
                demo_url: completeProject.demo_url,
                project_status: completeProject.project_status,
                current_members: completeProject.current_members,
                progress_percentage: completeProject.progress_percentage
            }
        };

        return NextResponse.json({ project: projectWithAuthor }, { status: 201 });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
