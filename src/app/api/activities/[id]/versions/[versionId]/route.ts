import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 특정 버전 업데이트
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const activityId = parseInt(resolvedParams.id);
        const versionId = parseInt(resolvedParams.versionId);

        if (isNaN(activityId) || isNaN(versionId)) {
            return NextResponse.json({ error: '유효하지 않은 활동 ID 또는 버전 ID입니다.' }, { status: 400 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
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
            vote_deadline,
            version_label
        } = body;

        // 권한 확인 (관리자 또는 작성자)
        const { canManageActivity } = await import('@/lib/auth/permissions');
        const hasPermission = await canManageActivity(supabase, user.id, activityId);
        if (!hasPermission) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        // 활동 존재 확인
        const { data: activity } = await supabase
            .from('activities')
            .select('id')
            .eq('id', activityId)
            .single();

        if (!activity) {
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 버전 존재 및 소유권 확인
        const { data: version } = await supabase
            .from('activity_versions')
            .select('id, activity_id')
            .eq('id', versionId)
            .eq('activity_id', activityId)
            .single();

        if (!version) {
            return NextResponse.json({ error: '버전을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 버전 업데이트
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString()
        };

        if (title !== undefined) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (content !== undefined) updateData.content = content;
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
        if (version_label !== undefined) updateData.version_label = version_label?.trim() || null;

        const { error: updateError } = await supabase
            .from('activity_versions')
            .update(updateData)
            .eq('id', versionId)
            .eq('activity_id', activityId);

        if (updateError) {
            console.error('Version update error:', updateError);
            return NextResponse.json({ error: '버전 업데이트에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: '버전이 업데이트되었습니다.'
        });
    } catch (error) {
        console.error('Update version API error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 특정 버전 삭제
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const activityId = parseInt(resolvedParams.id);
        const versionId = parseInt(resolvedParams.versionId);

        if (isNaN(activityId) || isNaN(versionId)) {
            return NextResponse.json({ error: '유효하지 않은 활동 ID 또는 버전 ID입니다.' }, { status: 400 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 먼저 버전 정보 조회 (RLS 정책 문제를 피하기 위해 버전 먼저 확인)
        const { data: versionInfo, error: versionError } = await supabase
            .from('activity_versions')
            .select('id, activity_id')
            .eq('id', versionId)
            .eq('activity_id', activityId)
            .maybeSingle();

        if (versionError) {
            console.error('버전 조회 오류:', versionError);
            return NextResponse.json({ error: '버전 조회 중 오류가 발생했습니다.' }, { status: 500 });
        }

        if (!versionInfo) {
            console.error('버전을 찾을 수 없음:', { versionId, activityId });
            return NextResponse.json({ error: '버전을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 버전의 activity_id와 전달된 activityId가 일치하는지 확인
        if (versionInfo.activity_id !== activityId) {
            console.error('버전의 activity_id가 일치하지 않음:', { 
                versionActivityId: versionInfo.activity_id, 
                passedActivityId: activityId 
            });
            return NextResponse.json({ error: '버전이 해당 활동에 속하지 않습니다.' }, { status: 400 });
        }

        // 권한 확인 (관리자 또는 작성자) - 버전이 존재하면 activityId는 유효함
        const { canManageActivity } = await import('@/lib/auth/permissions');
        const hasPermission = await canManageActivity(supabase, user.id, activityId);
        if (!hasPermission) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        // 활동 정보 조회 (published_version_id 확인용)
        const { data: activity, error: activityError } = await supabase
            .from('activities')
            .select('id, published_version_id')
            .eq('id', activityId)
            .maybeSingle();

        // 활동이 없어도 버전이 존재하면 계속 진행 (RLS 정책 문제일 수 있음)
        let publishedVersionId: number | null = null;
        if (activity) {
            publishedVersionId = activity.published_version_id;
        } else if (activityError) {
            console.warn('활동 조회 실패 (RLS 정책 문제 가능성):', activityError);
            // 버전이 존재하므로 활동도 존재한다고 가정하고 계속 진행
        } else {
            console.warn('활동을 찾을 수 없음 (버전은 존재):', { activityId, userId: user.id });
            // 버전이 존재하므로 활동도 존재한다고 가정하고 계속 진행
        }

        // 출판된 버전은 삭제 불가 (새 스키마: published_version_id로 확인)
        if (publishedVersionId && versionId === publishedVersionId) {
            return NextResponse.json({ error: '출판된 버전은 삭제할 수 없습니다. 먼저 다른 버전을 출판하세요.' }, { status: 400 });
        }

        // 버전 삭제
        const { error: deleteError } = await supabase
            .from('activity_versions')
            .delete()
            .eq('id', versionId)
            .eq('activity_id', activityId);

        if (deleteError) {
            console.error('Version delete error:', deleteError);
            return NextResponse.json({ error: '버전 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: '버전이 삭제되었습니다.'
        });
    } catch (error) {
        console.error('Delete version API error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

