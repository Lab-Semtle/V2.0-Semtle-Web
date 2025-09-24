import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ProjectApplicationData } from '@/types/project';

// 프로젝트 신청
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const projectId = parseInt(resolvedParams.id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '잘못된 프로젝트 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const applicationData: ProjectApplicationData = await request.json();
        const { motivation, relevant_experience, available_time, portfolio_url, github_url, additional_info } = applicationData;

        if (!motivation || !motivation.trim()) {
            return NextResponse.json({ error: '지원 동기를 입력해주세요.' }, { status: 400 });
        }

        // 프로젝트 정보 확인
        const { data: project } = await supabase
            .from('project_posts')
            .select(`
        *,
        post:posts!project_posts_post_id_fkey(
          id,
          title,
          status,
          author_id
        )
      `)
            .eq('post_id', projectId)
            .single();

        if (!project || project.post.status !== 'published') {
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 프로젝트 상태 확인
        if (project.project_status !== 'recruiting') {
            return NextResponse.json({ error: '현재 모집 중인 프로젝트가 아닙니다.' }, { status: 400 });
        }

        // 마감일 확인
        if (new Date(project.deadline) < new Date()) {
            return NextResponse.json({ error: '프로젝트 모집이 마감되었습니다.' }, { status: 400 });
        }

        // 작성자는 신청할 수 없음
        if (project.post.author_id === user.id) {
            return NextResponse.json({ error: '프로젝트 작성자는 신청할 수 없습니다.' }, { status: 400 });
        }

        // 기존 신청 확인
        const { data: existingApplication } = await supabase
            .from('project_applications')
            .select('id, status')
            .eq('project_id', projectId)
            .eq('applicant_id', user.id)
            .single();

        if (existingApplication) {
            if (existingApplication.status === 'pending') {
                return NextResponse.json({ error: '이미 신청한 프로젝트입니다.' }, { status: 400 });
            } else if (existingApplication.status === 'accepted') {
                return NextResponse.json({ error: '이미 승인된 프로젝트입니다.' }, { status: 400 });
            }
        }

        // 프로젝트 신청
        const { data: newApplication, error: insertError } = await supabase
            .from('project_applications')
            .insert({
                project_id: projectId,
                applicant_id: user.id,
                motivation: motivation.trim(),
                relevant_experience: relevant_experience?.trim() || null,
                available_time: available_time?.trim() || null,
                portfolio_url: portfolio_url?.trim() || null,
                github_url: github_url?.trim() || null,
                additional_info: additional_info?.trim() || null,
                status: 'pending'
            })
            .select(`
        *,
        applicant:user_profiles!project_applications_applicant_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          major,
          grade
        )
      `)
            .single();

        if (insertError) {
            console.error('프로젝트 신청 오류:', insertError);
            return NextResponse.json({ error: '프로젝트 신청에 실패했습니다.' }, { status: 500 });
        }

        // 알림 생성 (프로젝트 작성자에게)
        await supabase
            .from('notifications')
            .insert({
                user_id: project.post.author_id,
                type: 'project_application',
                title: '새로운 프로젝트 신청',
                message: `"${project.post.title}" 프로젝트에 새로운 신청자가 있습니다.`,
                data: {
                    project_id: projectId,
                    application_id: newApplication.id,
                    applicant_id: user.id
                }
            });

        return NextResponse.json({
            application: newApplication,
            message: '프로젝트 신청이 완료되었습니다.'
        }, { status: 201 });
    } catch (error) {
        console.error('프로젝트 신청 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 프로젝트 신청 상태 확인
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const projectId = parseInt(resolvedParams.id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '잘못된 프로젝트 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ applied: false });
        }

        // 신청 상태 확인
        const { data: application } = await supabase
            .from('project_applications')
            .select('id, status, applied_at')
            .eq('project_id', projectId)
            .eq('applicant_id', user.id)
            .single();

        return NextResponse.json({
            applied: !!application,
            status: application?.status || null,
            applied_at: application?.applied_at || null
        });
    } catch (error) {
        console.error('프로젝트 신청 상태 확인 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
