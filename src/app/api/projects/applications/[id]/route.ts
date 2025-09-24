import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ProjectApplicationUpdateData } from '@/types/project';

// 프로젝트 신청 승인/거절 (프로젝트 작성자만)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const applicationId = parseInt(resolvedParams.id);

        if (isNaN(applicationId)) {
            return NextResponse.json({ error: '잘못된 신청 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const updateData: ProjectApplicationUpdateData = await request.json();
        const { status, review_notes, rejection_reason } = updateData;

        if (!status || !['accepted', 'rejected'].includes(status)) {
            return NextResponse.json({ error: '잘못된 상태입니다.' }, { status: 400 });
        }

        // 신청 정보 조회
        const { data: application } = await supabase
            .from('project_applications')
            .select(`
        *,
        project:project_posts!project_applications_project_id_fkey(
          post_id,
          team_size,
          current_members,
          project_status
        ),
        post:posts!project_posts_post_id_fkey(
          author_id,
          title
        )
      `)
            .eq('id', applicationId)
            .single();

        if (!application) {
            return NextResponse.json({ error: '신청을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 프로젝트 작성자 확인
        if (application.post.author_id !== user.id) {
            return NextResponse.json({ error: '프로젝트 작성자만 신청을 처리할 수 있습니다.' }, { status: 403 });
        }

        // 이미 처리된 신청인지 확인
        if (application.status !== 'pending') {
            return NextResponse.json({ error: '이미 처리된 신청입니다.' }, { status: 400 });
        }

        // 승인 시 팀원 수 확인
        if (status === 'accepted') {
            if (application.project.current_members >= application.project.team_size) {
                return NextResponse.json({ error: '팀원 수가 가득 찼습니다.' }, { status: 400 });
            }
        }

        // 신청 상태 업데이트
        const { data: updatedApplication, error: updateError } = await supabase
            .from('project_applications')
            .update({
                status,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                review_notes: review_notes?.trim() || null,
                rejection_reason: rejection_reason?.trim() || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', applicationId)
            .select(`
        *,
        applicant:user_profiles!project_applications_applicant_id_fkey(
          id,
          nickname,
          name,
          profile_image
        )
      `)
            .single();

        if (updateError) {
            console.error('신청 상태 업데이트 오류:', updateError);
            return NextResponse.json({ error: '신청 처리에 실패했습니다.' }, { status: 500 });
        }

        // 승인된 경우 팀원으로 추가
        if (status === 'accepted') {
            const { error: memberError } = await supabase
                .from('project_team_members')
                .insert({
                    project_id: application.project_id,
                    user_id: application.applicant_id,
                    role: 'member',
                    status: 'active'
                });

            if (memberError) {
                console.error('팀원 추가 오류:', memberError);
                // 팀원 추가 실패해도 신청 상태는 이미 업데이트됨
            }

            // 프로젝트 현재 팀원 수 업데이트
            await supabase
                .from('project_posts')
                .update({ current_members: application.project.current_members + 1 })
                .eq('post_id', application.project_id);
        }

        // 알림 생성 (신청자에게)
        await supabase
            .from('notifications')
            .insert({
                user_id: application.applicant_id,
                type: 'project_application_result',
                title: status === 'accepted' ? '프로젝트 신청이 승인되었습니다' : '프로젝트 신청이 거절되었습니다',
                message: `"${application.post.title}" 프로젝트 신청이 ${status === 'accepted' ? '승인' : '거절'}되었습니다.`,
                data: {
                    project_id: application.project_id,
                    application_id: applicationId,
                    status,
                    review_notes,
                    rejection_reason
                }
            });

        return NextResponse.json({
            application: updatedApplication,
            message: `신청이 ${status === 'accepted' ? '승인' : '거절'}되었습니다.`
        });
    } catch (error) {
        console.error('신청 처리 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 프로젝트 신청 취소 (신청자만)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const applicationId = parseInt(resolvedParams.id);

        if (isNaN(applicationId)) {
            return NextResponse.json({ error: '잘못된 신청 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 신청 정보 조회
        const { data: application } = await supabase
            .from('project_applications')
            .select('*')
            .eq('id', applicationId)
            .eq('applicant_id', user.id)
            .single();

        if (!application) {
            return NextResponse.json({ error: '신청을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 이미 처리된 신청인지 확인
        if (application.status !== 'pending') {
            return NextResponse.json({ error: '이미 처리된 신청은 취소할 수 없습니다.' }, { status: 400 });
        }

        // 신청 취소
        const { error: deleteError } = await supabase
            .from('project_applications')
            .update({
                status: 'withdrawn',
                updated_at: new Date().toISOString()
            })
            .eq('id', applicationId);

        if (deleteError) {
            console.error('신청 취소 오류:', deleteError);
            return NextResponse.json({ error: '신청 취소에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '신청이 취소되었습니다.' });
    } catch (error) {
        console.error('신청 취소 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
