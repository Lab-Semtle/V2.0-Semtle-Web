import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { canManageActivity } from '@/lib/auth/permissions';

// 버전 스냅샷 생성 (명시적 버전 저장)
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
        const { version_label } = body; // 사용자 지정 버전 이름 (선택적)

        // 활동 정보 조회
        const { data: activity } = await supabase
            .from('activities')
            .select('id, current_version_id')
            .eq('id', activityId)
            .single();

        if (!activity) {
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        if (!activity.current_version_id) {
            return NextResponse.json({ error: '현재 편집 중인 버전이 없습니다.' }, { status: 400 });
        }

        // 현재 버전 데이터 조회
        const { data: currentVersion, error: versionError } = await supabase
            .from('activity_versions')
            .select('*')
            .eq('id', activity.current_version_id)
            .eq('activity_id', activityId)
            .single();

        if (versionError || !currentVersion) {
            return NextResponse.json({ error: '현재 버전을 찾을 수 없습니다.' }, { status: 404 });
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

        // 현재 버전을 복사하여 새 버전 생성 (스냅샷)
        const { data: newVersion, error: createError } = await supabase
            .from('activity_versions')
            .insert({
                activity_id: activityId,
                author_id: currentVersion.author_id || user.id, // 기존 버전의 author_id 사용, 없으면 현재 사용자 ID
                content: currentVersion.content,
                title: currentVersion.title,
                subtitle: currentVersion.subtitle,
                thumbnail: currentVersion.thumbnail,
                category_id: currentVersion.category_id,
                location: currentVersion.location,
                start_date: currentVersion.start_date,
                end_date: currentVersion.end_date,
                max_participants: currentVersion.max_participants,
                participation_fee: currentVersion.participation_fee,
                contact_info: currentVersion.contact_info,
                tags: currentVersion.tags || [],
                has_voting: currentVersion.has_voting || false,
                vote_options: currentVersion.vote_options || [],
                vote_deadline: currentVersion.vote_deadline,
                version_number: nextVersionNumber,
                version_type: 'snapshot',
                version_label: version_label || null,
                is_current: false,
                is_published: false
            })
            .select()
            .single();

        if (createError || !newVersion) {
            console.error('Version snapshot creation error:', createError);
            return NextResponse.json({ error: '버전 저장에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            version_id: newVersion.id,
            message: '버전이 저장되었습니다.'
        });
    } catch (error) {
        console.error('Version snapshot error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}


