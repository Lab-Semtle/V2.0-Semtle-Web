import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { canManageActivity } from '@/lib/auth/permissions';

// 특정 활동의 모든 버전 목록 조회
export async function GET(
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

        // 편집 폼에서는 activity_versions 테이블에서 직접 조회
        // RLS 정책 때문에 activities 테이블 조회가 필요 없음
        // 먼저 버전 존재 여부 확인 (RLS 정책 최소한의 검사만)
        const { data: versionsCheck, error: checkError } = await supabase
            .from('activity_versions')
            .select('id')
            .eq('activity_id', activityId)
            .limit(1);

        console.log(`버전 존재 확인: activityId=${activityId}, checkError=`, checkError);
        console.log(`versionsCheck=`, versionsCheck);

        if (checkError) {
            console.error('Version check error:', checkError);
            // RLS 정책 문제일 수 있음
            return NextResponse.json({
                versions: [],
                published_version_id: null,
                current_version_id: null
            });
        }

        // 버전이 존재하는 경우 상세 정보 조회 (새 스키마)
        if (versionsCheck && versionsCheck.length > 0) {
            // activities 테이블에서 published_version_id와 status 조회
            const { data: activityMeta } = await supabase
                .from('activities')
                .select('published_version_id, status')
                .eq('id', activityId)
                .single();

            const { data: versions, error: versionsError } = await supabase
                .from('activity_versions')
                .select('id, version_number, version_code, parent_version_id, version_label, created_at, updated_at, category_id, title, subtitle')
                .eq('activity_id', activityId)
                .order('version_number', { ascending: false });

            if (versionsError) {
                console.error('Version query error (상세 조회):', versionsError);
                // 상세 조회 실패 시에도 최소한 버전 ID만 반환
                const basicVersions = versionsCheck.map((v, idx) => ({
                    id: v.id,
                    version_number: idx + 1,
                    version_code: `v${idx + 1}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    category_id: null,
                    title: null,
                    subtitle: null
                }));

                return NextResponse.json({
                    versions: basicVersions,
                    published_version_id: activityMeta?.published_version_id || null
                });
            }

            console.log(`버전 조회 성공: activityId=${activityId}, versionsCount=${versions?.length || 0}`);

            if (versions && versions.length > 0) {
                return NextResponse.json({
                    versions: versions,
                    published_version_id: activityMeta?.published_version_id || null,
                    status: activityMeta?.status || null
                });
            }
        }

        // 버전이 없음
        console.warn(`버전이 없음: activityId=${activityId}`);

        // 버전이 없어도 status는 조회
        const { data: activityMeta } = await supabase
            .from('activities')
            .select('status')
            .eq('id', activityId)
            .single();

        return NextResponse.json({
            versions: [],
            published_version_id: null,
            status: activityMeta?.status || null
        });
    } catch (error) {
        console.error('Versions API error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 특정 버전 데이터 조회
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

        // 버전 데이터 조회
        const { data: version, error: versionError } = await supabase
            .from('activity_versions')
            .select('*')
            .eq('id', version_id)
            .eq('activity_id', activityId)
            .single();

        if (versionError || !version) {
            return NextResponse.json({ error: '버전을 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({ version });
    } catch (error) {
        console.error('Get version API error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 특정 버전을 출판 (재출판)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log('[PUT /api/activities/[id]/versions] 재출판 요청 시작');
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const activityId = parseInt(resolvedParams.id);

        console.log(`[PUT /api/activities/[id]/versions] activityId: ${activityId}`);

        if (isNaN(activityId)) {
            return NextResponse.json({ error: '유효하지 않은 활동 ID입니다.' }, { status: 400 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('[PUT /api/activities/[id]/versions] 인증 실패:', authError);
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 권한 확인 (관리자 또는 작성자)
        const hasPermission = await canManageActivity(supabase, user.id, activityId);
        if (!hasPermission) {
            console.error(`[PUT /api/activities/[id]/versions] 권한 없음: userId=${user.id}, activityId=${activityId}`);
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const body = await request.json();
        const { version_id } = body;

        console.log(`[PUT /api/activities/[id]/versions] version_id: ${version_id}`);

        if (!version_id) {
            return NextResponse.json({ error: '버전 ID가 필요합니다.' }, { status: 400 });
        }

        // 버전 존재 확인 (새 스키마: is_published 컬럼 제거됨)
        const { data: version, error: versionCheckError } = await supabase
            .from('activity_versions')
            .select('id, activity_id')
            .eq('id', version_id)
            .eq('activity_id', activityId)
            .single();

        if (versionCheckError || !version) {
            console.error('[PUT /api/activities/[id]/versions] 버전 조회 실패:', {
                versionCheckError,
                version_id,
                activityId
            });
            return NextResponse.json({ error: '버전을 찾을 수 없습니다.' }, { status: 404 });
        }

        console.log(`[PUT /api/activities/[id]/versions] 버전 확인 완료: versionId=${version.id}`);

        // 활동 정보 조회 (기존 published_at 유지하기 위해)
        const { data: currentActivity } = await supabase
            .from('activities')
            .select('published_version_id, published_at, status')
            .eq('id', activityId)
            .single();

        if (!currentActivity) {
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 새 스키마: published_version_id만 변경, republished_at 갱신
        // published_at은 최초 출판 시각이므로 불변 (없으면 현재 시각으로 설정)
        const updateData: Record<string, unknown> = {
            published_version_id: version_id,
            republished_at: new Date().toISOString()
        };

        // 최초 출판인 경우 published_at 설정
        if (!currentActivity.published_at) {
            updateData.published_at = new Date().toISOString();
        }

        // status가 draft인 경우 public으로 변경 (재출판 시)
        if (currentActivity.status === 'draft') {
            updateData.status = 'public';
        }

        console.log(`[PUT /api/activities/[id]/versions] 업데이트 데이터:`, updateData);

        const { error: updateError } = await supabase
            .from('activities')
            .update(updateData)
            .eq('id', activityId);

        if (updateError) {
            console.error('[PUT /api/activities/[id]/versions] 업데이트 실패:', updateError);
            return NextResponse.json({ error: '재출판에 실패했습니다.' }, { status: 500 });
        }

        console.log(`[PUT /api/activities/[id]/versions] 재출판 성공: activityId=${activityId}, versionId=${version_id}`);

        return NextResponse.json({
            success: true,
            message: '버전이 재출판되었습니다.'
        });
    } catch (error) {
        console.error('[PUT /api/activities/[id]/versions] 예외 발생:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

