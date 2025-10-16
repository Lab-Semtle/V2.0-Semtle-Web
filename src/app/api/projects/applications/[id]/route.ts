import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// 서비스 역할 키를 사용하는 클라이언트 (RLS 우회)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const resolvedParams = await params;
        const applicationId = parseInt(resolvedParams.id);
        if (isNaN(applicationId)) {
            return NextResponse.json({ error: '유효하지 않은 신청 ID입니다.' }, { status: 400 });
        }

        const body = await request.json();
        const { status, review_notes, rejection_reason } = body;

        if (!status || !['accepted', 'rejected'].includes(status)) {
            return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 });
        }

        // 신청 정보 조회 및 권한 확인
        const { data: application, error: fetchError } = await supabase
            .from('project_applications')
            .select(`
        *,
        projects!inner (
          id,
          title,
          author_id
        )
      `)
            .eq('id', applicationId)
            .single();

        if (fetchError || !application) {
            return NextResponse.json({ error: '신청을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 프로젝트 작성자인지 확인
        if (application.projects.author_id !== user.id) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        // 신청 상태 업데이트
        const updateData: Record<string, unknown> = {
            status,
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id
        };

        if (review_notes) {
            updateData.review_notes = review_notes;
        }

        if (rejection_reason) {
            updateData.rejection_reason = rejection_reason;
        }

        const { data: updatedApplication, error: updateError } = await supabase
            .from('project_applications')
            .update(updateData)
            .eq('id', applicationId)
            .select()
            .single();

        if (updateError) {
            console.error('신청 상태 업데이트 오류:', updateError);
            return NextResponse.json({ error: '신청 상태 업데이트에 실패했습니다.' }, { status: 500 });
        }

        // 신청이 승인된 경우 project_team_members 테이블에 추가
        if (status === 'accepted') {
            console.log('팀원 추가 시도:', {
                project_id: application.project_id,
                user_id: application.applicant_id,
                role: 'member',
                status: 'active'
            });

            const { error: teamMemberError } = await supabaseAdmin
                .from('project_team_members')
                .insert({
                    project_id: application.project_id,
                    user_id: application.applicant_id,
                    role: 'member',
                    status: 'active'
                });

            if (teamMemberError) {
                console.error('팀원 추가 오류:', teamMemberError);
                // 팀원 추가 실패해도 신청 승인은 유지
            } else {
                console.log('팀원 추가 성공');
            }
        }

        return NextResponse.json({
            success: true,
            application: updatedApplication,
            message: status === 'accepted' ? '신청이 승인되었습니다.' : '신청이 거절되었습니다.'
        });

    } catch (error) {
        console.error('신청 처리 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}