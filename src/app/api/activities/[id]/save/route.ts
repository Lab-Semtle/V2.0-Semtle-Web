import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { canManageActivity } from '@/lib/auth/permissions';

// 일반 저장 (현재 버전 내용만 업데이트, 새 버전 생성 안 함)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const activityId = parseInt(resolvedParams.id);

        if (isNaN(activityId)) {
            return NextResponse.json({ error: '유효하지 않은 활동 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 권한 확인 (관리자 또는 작성자)
        const hasPermission = await canManageActivity(supabase, user.id, activityId);
        if (!hasPermission) {
            return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
        }

        const body = await request.json();
        const {
            content,
            title,
            subtitle,
            category_id,
            thumbnail,
            location,
            start_date,
            end_date,
            max_participants,
            participation_fee,
            contact_info,
            tags,
            has_voting,
            vote_options,
            vote_deadline
        } = body;

        // 새 스키마: 버전 ID는 요청 본문에서 받음
        const { version_id } = body;

        if (!version_id) {
            return NextResponse.json({ error: '버전 ID가 필요합니다.' }, { status: 400 });
        }

        // 활동 정보 조회
        const { data: activity } = await supabase
            .from('activities')
            .select('id')
            .eq('id', activityId)
            .single();

        if (!activity) {
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 선택된 버전만 업데이트 (새 버전 생성 안 함)
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString()
        };

        if (content !== undefined) updateData.content = content;
        if (title !== undefined) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (category_id !== undefined) updateData.category_id = category_id;
        if (thumbnail !== undefined) {
            updateData.thumbnail = Array.isArray(thumbnail) && thumbnail.length > 0 ? thumbnail : (thumbnail ? [thumbnail] : []);
        }
        if (location !== undefined) updateData.location = location;
        if (start_date !== undefined) updateData.start_date = start_date;
        if (end_date !== undefined) updateData.end_date = end_date;
        if (max_participants !== undefined) updateData.max_participants = max_participants;
        if (participation_fee !== undefined) updateData.participation_fee = participation_fee;
        if (contact_info !== undefined) updateData.contact_info = contact_info;
        if (tags !== undefined) updateData.tags = tags || [];
        if (has_voting !== undefined) updateData.has_voting = has_voting || false;
        if (vote_options !== undefined) updateData.vote_options = vote_options || [];
        if (vote_deadline !== undefined) updateData.vote_deadline = vote_deadline;

        const { error: updateError } = await supabase
            .from('activity_versions')
            .update(updateData)
            .eq('id', version_id)
            .eq('activity_id', activityId);

        if (updateError) {
            console.error('Version update error:', updateError);
            return NextResponse.json({ error: '저장에 실패했습니다.' }, { status: 500 });
        }

        // 새 스키마: activities 테이블에는 updated_at 컬럼이 없음 (제거됨)

        return NextResponse.json({
            success: true,
            message: '저장되었습니다.'
        });
    } catch (error) {
        console.error('Save error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}


