import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 개별 프로젝트 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '유효하지 않은 프로젝트 ID입니다.' }, { status: 400 });
        }

        // 프로젝트 조회
        const { data: project, error } = await supabase
            .from('projects')
            .select(`
                *,
                category:project_categories(*),
                project_type:project_types(*),
                project_status_info:project_statuses!project_status(name, display_name, color, icon)
            `)
            .eq('id', projectId)
            .single();

        if (error) {
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (!project) {
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 실제 좋아요 수 계산
        const { data: likeCountData } = await supabase
            .from('project_likes')
            .select('id', { count: 'exact' })
            .eq('project_id', projectId);

        const actualLikesCount = likeCountData?.length || 0;

        // 승인된 팀원 수 조회 (프로젝트 작성자 제외)
        const { data: teamMembers } = await supabase
            .from('project_team_members')
            .select('id')
            .eq('project_id', projectId)
            .eq('status', 'active')
            .neq('role', 'leader');

        // 신청자 수 조회 (대기중인 신청자만)
        const { data: applications } = await supabase
            .from('project_applications')
            .select('id')
            .eq('project_id', projectId)
            .eq('status', 'pending');

        const approvedMembers = teamMembers?.length || 0;
        const applicantCount = applications?.length || 0;

        // projects 테이블의 likes_count를 실제 값으로 업데이트
        await supabase
            .from('projects')
            .update({ likes_count: actualLikesCount })
            .eq('id', projectId);

        // 실제 좋아요 수로 프로젝트 데이터 업데이트
        const projectWithActualLikes = {
            ...project,
            likes_count: actualLikesCount
        };

        // 작성자 정보 조회
        const { data: author } = await supabase
            .from('user_profiles')
            .select('id, nickname, name, profile_image, role')
            .eq('id', project.author_id)
            .single();

        const projectWithAuthor = {
            ...projectWithActualLikes,
            author: author || null,
            project_data: {
                team_size: projectWithActualLikes.team_size,
                needed_skills: projectWithActualLikes.needed_skills,
                deadline: projectWithActualLikes.deadline,
                difficulty: projectWithActualLikes.difficulty,
                location: projectWithActualLikes.location,
                project_goals: projectWithActualLikes.project_goals,
                tech_stack: projectWithActualLikes.tech_stack,
                github_url: projectWithActualLikes.github_url,
                demo_url: projectWithActualLikes.demo_url,
                project_status: projectWithActualLikes.project_status,
                current_members: projectWithActualLikes.current_members,
                progress_percentage: projectWithActualLikes.progress_percentage
            }
        };

        return NextResponse.json({
            project: {
                ...projectWithAuthor,
                approved_members: approvedMembers,
                applicant_count: applicantCount
            }
        });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 프로젝트 수정
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '유효하지 않은 프로젝트 ID입니다.' }, { status: 400 });
        }

        const updateData = await request.json();

        // 작성자 확인 (userId를 직접 받아서 사용)
        const { data: existingProject } = await supabase
            .from('projects')
            .select('author_id')
            .eq('id', projectId)
            .single();

        if (!existingProject || existingProject.author_id !== updateData.userId) {
            return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
        }

        // 카테고리 ID 찾기
        let category_id = null;
        if (updateData.category) {
            const { data: categoryData } = await supabase
                .from('project_categories')
                .select('id')
                .eq('name', updateData.category)
                .single();
            category_id = categoryData?.id;
        }

        // 프로젝트 업데이트
        const { data: updatedProject, error: updateError } = await supabase
            .from('projects')
            .update({
                title: updateData.title,
                subtitle: updateData.description || '',
                content: updateData.content || null,
                thumbnail: updateData.thumbnail,
                category_id,
                project_type_id: updateData.project_type_id,
                status: updateData.status === 'published' ? 'published' : 'draft',
                team_size: updateData.team_size ? parseInt(updateData.team_size) : undefined,
                needed_skills: updateData.needed_skills || [],
                deadline: updateData.deadline ? new Date(updateData.deadline).toISOString() : undefined,
                difficulty: updateData.difficulty,
                location: updateData.location,
                project_status: updateData.project_status || 'recruiting',
                tech_stack: updateData.tech_stack || [],
                github_url: updateData.github_url || '',
                demo_url: updateData.demo_url || '',
                published_at: updateData.status === 'published' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: '프로젝트 수정에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ project: updatedProject });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 프로젝트 삭제
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '유효하지 않은 프로젝트 ID입니다.' }, { status: 400 });
        }

        // URL에서 userId 쿼리 파라미터 가져오기
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
        }

        // 작성자 확인
        const { data: existingProject } = await supabase
            .from('projects')
            .select('author_id')
            .eq('id', projectId)
            .single();

        if (!existingProject) {
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 권한 확인 (작성자만 삭제 가능)
        if (existingProject.author_id !== userId) {
            return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
        }

        // 프로젝트 삭제
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (deleteError) {
            return NextResponse.json({ error: '프로젝트 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '프로젝트가 삭제되었습니다.' });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}




