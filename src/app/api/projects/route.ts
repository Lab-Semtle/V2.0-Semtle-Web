import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ProjectCreateData } from '@/types/project';

// 프로젝트 게시물 목록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 쿼리 파라미터
        const { searchParams } = new URL(request.url);
        const project_type = searchParams.get('project_type');
        const difficulty = searchParams.get('difficulty');
        const location = searchParams.get('location');
        const tech_stack = searchParams.get('tech_stack')?.split(',') || [];
        const project_status = searchParams.get('project_status') || 'recruiting';
        const deadline_from = searchParams.get('deadline_from');
        const deadline_to = searchParams.get('deadline_to');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // 프로젝트 게시물 조회 (새로운 분리된 구조)
        let query = supabase
            .from('projects')
            .select(`
        *,
        category:board_categories(*),
        author:user_profiles!projects_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        )
      `)
            .eq('status', 'published');

        // 필터 적용 (새로운 구조에 맞게)
        if (project_type) {
            query = query.eq('project_type', project_type);
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

        if (project_status) {
            query = query.eq('project_status', project_status);
        }

        if (deadline_from) {
            query = query.gte('deadline', deadline_from);
        }

        if (deadline_to) {
            query = query.lte('deadline', deadline_to);
        }

        // 정렬 (마감일 기준)
        query = query.order('deadline', { ascending: true });

        // 페이지네이션
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: projects, error, count } = await query;

        if (error) {
            console.error('프로젝트 목록 조회 오류:', error);
            return NextResponse.json({ error: '프로젝트 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

        // 카테고리 목록 조회
        const { data: categories } = await supabase
            .from('board_categories')
            .select('*')
            .eq('board_type', 'projects')
            .eq('is_active', true)
            .order('sort_order');

        return NextResponse.json({
            projects: projects || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            },
            categories: categories || []
        });
    } catch (error) {
        console.error('프로젝트 목록 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 프로젝트 게시물 생성
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const projectData = await request.json();
        console.log('Received project data:', projectData);

        const {
            title,
            description,
            content,
            thumbnail,
            category,
            status = 'draft',
            project_type,
            team_size,
            needed_skills,
            deadline,
            difficulty,
            location,
            project_goals
        } = projectData;

        // 필수 필드 검증
        if (!title || !project_type || !team_size || !deadline || !difficulty || !location) {
            return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
        }

        // 슬러그 생성
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-') + '-' + Date.now();

        // 카테고리 ID 찾기
        let category_id = null;
        if (category) {
            const { data: categoryData } = await supabase
                .from('board_categories')
                .select('id')
                .eq('name', category)
                .eq('board_type', 'projects')
                .single();
            category_id = categoryData?.id;
        }

        // 프로젝트 데이터 생성 (새로운 분리된 구조)
        const { data: newProject, error: projectError } = await supabase
            .from('projects')
            .insert({
                title,
                subtitle: description || '',
                content: content || null,
                thumbnail,
                slug,
                category_id,
                author_id: user.id,
                status: status === 'published' ? 'published' : 'draft',
                tags: [],
                project_type,
                team_size: parseInt(team_size),
                current_members: 1, // 작성자 포함
                needed_skills: needed_skills || [],
                deadline: new Date(deadline).toISOString(),
                difficulty,
                location,
                project_status: 'recruiting',
                progress_percentage: 0,
                tech_stack: [],
                tools: [],
                project_goals: project_goals || '',
                deliverables: '',
                requirements: '',
                benefits: '',
                published_at: status === 'published' ? new Date().toISOString() : null
            })
            .select()
            .single();

        if (projectError) {
            console.error('프로젝트 생성 오류:', projectError);
            return NextResponse.json({ error: '프로젝트 생성에 실패했습니다.' }, { status: 500 });
        }

        // 프로젝트 리더로 팀원 추가
        await supabase
            .from('project_team_members')
            .insert({
                project_id: newProject.id,
                user_id: user.id,
                role: 'leader',
                status: 'active'
            });

        // 완전한 데이터 조회
        const { data: completeProject } = await supabase
            .from('projects')
            .select(`
        *,
        category:board_categories(*),
        author:user_profiles!projects_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        )
      `)
            .eq('id', newProject.id)
            .single();

        return NextResponse.json({ project: completeProject }, { status: 201 });
    } catch (error) {
        console.error('프로젝트 생성 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
