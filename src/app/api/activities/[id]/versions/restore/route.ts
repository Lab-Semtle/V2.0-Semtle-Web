import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { canManageActivity } from '@/lib/auth/permissions';

// 버전 복원 (이전 버전 내용으로 새 버전 생성)
export async function POST(
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

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 권한 확인 (관리자 또는 작성자)
        const hasPermission = await canManageActivity(supabase, user.id, activityId);
        if (!hasPermission) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const body = await request.json();
        const { version_id } = body;

        if (!version_id) {
            return NextResponse.json({ error: '버전 ID가 필요합니다.' }, { status: 400 });
        }

        // 활동 존재 확인
        const { data: activity } = await supabase
            .from('activities')
            .select('id, current_version_id')
            .eq('id', activityId)
            .single();

        if (!activity) {
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 복원할 버전 데이터 조회
        const { data: sourceVersion, error: versionError } = await supabase
            .from('activity_versions')
            .select('*')
            .eq('id', version_id)
            .eq('activity_id', activityId)
            .single();

        if (versionError || !sourceVersion) {
            return NextResponse.json({ error: '버전을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 기존 버전 목록 조회하여 다음 버전 번호 결정
        const { data: existingVersions } = await supabase
            .from('activity_versions')
            .select('version_number')
            .eq('activity_id', activityId)
            .order('version_number', { ascending: false })
            .limit(1);

        const nextVersionNumber = existingVersions && existingVersions.length > 0
            ? existingVersions[0].version_number + 1
            : 1;

        // 기존 current_version을 false로 변경
        if (activity.current_version_id) {
            await supabase
                .from('activity_versions')
                .update({ is_current: false })
                .eq('id', activity.current_version_id);
        }

        // 복원할 버전의 내용으로 새 버전 생성
        const { data: newVersion, error: createError } = await supabase
            .from('activity_versions')
            .insert({
                activity_id: activityId,
                content: sourceVersion.content,
                title: sourceVersion.title,
                subtitle: sourceVersion.subtitle,
                thumbnail: sourceVersion.thumbnail,
                category_id: sourceVersion.category_id,
                location: sourceVersion.location,
                start_date: sourceVersion.start_date,
                end_date: sourceVersion.end_date,
                max_participants: sourceVersion.max_participants,
                participation_fee: sourceVersion.participation_fee,
                contact_info: sourceVersion.contact_info,
                tags: sourceVersion.tags || [],
                has_voting: sourceVersion.has_voting || false,
                vote_options: sourceVersion.vote_options || [],
                vote_deadline: sourceVersion.vote_deadline,
                version_number: nextVersionNumber,
                version_type: 'draft',
                is_current: true,
                is_published: false
            })
            .select()
            .single();

        if (createError || !newVersion) {
            console.error('Version restoration error:', createError);
            return NextResponse.json({ error: '버전 복원에 실패했습니다.' }, { status: 500 });
        }

        // current_version_id 업데이트
        const { error: updateError } = await supabase
            .from('activities')
            .update({
                current_version_id: newVersion.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', activityId);

        if (updateError) {
            console.error('Activity update error:', updateError);
            return NextResponse.json({ error: '활동 업데이트에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            version_id: newVersion.id,
            message: '버전이 복원되었습니다.'
        });
    } catch (error) {
        console.error('Restore version error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

