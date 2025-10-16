import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const { id } = await params;

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 요청 본문에서 새로운 상태 가져오기
        const { project_status } = await request.json();

        if (!project_status) {
            return NextResponse.json({ error: '프로젝트 상태가 필요합니다.' }, { status: 400 });
        }

        // 유효한 상태 값인지 확인
        const validStatuses = ['recruiting', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(project_status)) {
            return NextResponse.json({ error: '유효하지 않은 프로젝트 상태입니다.' }, { status: 400 });
        }

        // 프로젝트가 존재하고 작성자인지 확인
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, author_id')
            .eq('id', id)
            .single();

        if (projectError || !project) {
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (project.author_id !== user.id) {
            return NextResponse.json({ error: '프로젝트 작성자만 상태를 변경할 수 있습니다.' }, { status: 403 });
        }

        // 프로젝트 상태 업데이트
        const { data: updatedProject, error: updateError } = await supabase
            .from('projects')
            .update({ project_status })
            .eq('id', id)
            .select('id, project_status')
            .single();

        if (updateError) {
            console.error('프로젝트 상태 업데이트 오류:', updateError);
            return NextResponse.json({ error: '프로젝트 상태 업데이트에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            project: updatedProject
        });

    } catch (error) {
        console.error('프로젝트 상태 변경 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}