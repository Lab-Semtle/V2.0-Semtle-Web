import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { canManageActivity } from '@/lib/auth/permissions';
import { generateVersionCode } from '@/lib/utils/version-code';

// 임시저장 (draft 저장) - 새 버전 생성
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
            parent_version_id,  // 새 버전의 부모 버전 ID (선택 사항)
            version_label  // 버전 이름 (선택 사항)
        } = body;

        // 활동 정보 조회
        const { data: existingActivity } = await supabase
            .from('activities')
            .select('id, published_version_id, status')
            .eq('id', activityId)
            .single();

        if (!existingActivity) {
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 기존 버전 목록 조회 (version_code 생성 및 다음 버전 번호 결정용)
        const { data: allVersions } = await supabase
            .from('activity_versions')
            .select('version_number, version_code, parent_version_id, id')
            .eq('activity_id', activityId)
            .order('version_number', { ascending: false });

        const nextVersionNumber = allVersions && allVersions.length > 0
            ? (allVersions[0].version_number || 0) + 1
            : 1;

        // 부모 버전 찾기
        const parentVersion = parent_version_id 
            ? allVersions?.find(v => v.id === parent_version_id)
            : (allVersions && allVersions.length > 0 ? allVersions[0] : null);

        // version_code 생성
        const versionCode = generateVersionCode(
            parentVersion?.version_code || null,
            parent_version_id || null,
            allVersions || [],
            nextVersionNumber
        );

        // 새 버전 생성
        const { data: newVersion, error: createError } = await supabase
            .from('activity_versions')
            .insert({
                activity_id: activityId,
                author_id: user.id,
                version_number: nextVersionNumber,
                version_code: versionCode,
                parent_version_id: parent_version_id || parentVersion?.id || null,
                version_label: version_label?.trim() || null,  // 버전 이름 (없으면 null)
                content,
                title,
                subtitle,
                thumbnail: Array.isArray(thumbnail) ? thumbnail : (thumbnail ? [thumbnail] : []),
                category_id,
                location,
                start_date,
                end_date,
                max_participants,
                participation_fee,
                contact_info,
                tags: tags || [],
                has_voting: has_voting || false,
                vote_options: vote_options || [],
                vote_deadline
            })
            .select()
            .single();

        if (createError || !newVersion) {
            console.error('Version creation error:', createError);
            return NextResponse.json({ error: '버전 생성에 실패했습니다.' }, { status: 500 });
        }

        const newVersionId = newVersion.id;

        return NextResponse.json({
            success: true,
            version_id: newVersionId,
            version_code: versionCode,
            message: '새 버전이 생성되었습니다.'
        });
    } catch (error) {
        console.error('Draft save error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}


