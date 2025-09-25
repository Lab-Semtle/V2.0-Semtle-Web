import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 개별 프로젝트 조회
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabase();
        const projectId = parseInt(params.id);

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
                author:user_profiles!projects_author_id_fkey(
                    id, nickname, name, profile_image, role
                )
            `)
            .eq('id', projectId)
            .single();

        if (error) {
            console.error('프로젝트 조회 오류:', error);
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (!project) {
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error('프로젝트 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 프로젝트 수정
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabase();
        const projectId = parseInt(params.id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '유효하지 않은 프로젝트 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const updateData = await request.json();
        console.log('Updating project with data:', updateData);

        // 작성자 확인
        const { data: existingProject } = await supabase
            .from('projects')
            .select('author_id')
            .eq('id', projectId)
            .single();

        if (!existingProject || existingProject.author_id !== user.id) {
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
                project_goals: updateData.project_goals || '',
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
            console.error('프로젝트 업데이트 오류:', updateError);
            return NextResponse.json({ error: '프로젝트 수정에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ project: updatedProject });
    } catch (error) {
        console.error('프로젝트 수정 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 프로젝트 삭제
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabase();
        const projectId = parseInt(params.id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '유효하지 않은 프로젝트 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 작성자 확인
        const { data: existingProject } = await supabase
            .from('projects')
            .select('author_id')
            .eq('id', projectId)
            .single();

        if (!existingProject || existingProject.author_id !== user.id) {
            return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
        }

        // 프로젝트 삭제
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (deleteError) {
            console.error('프로젝트 삭제 오류:', deleteError);
            return NextResponse.json({ error: '프로젝트 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '프로젝트가 삭제되었습니다.' });
    } catch (error) {
        console.error('프로젝트 삭제 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
