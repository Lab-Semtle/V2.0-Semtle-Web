import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 특정 자료의 모든 버전 목록 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const resourceId = parseInt(resolvedParams.id);

        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '유효하지 않은 자료 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 버전 존재 여부 확인
        const { data: versionsCheck, error: checkError } = await supabase
            .from('resource_versions')
            .select('id')
            .eq('resource_id', resourceId)
            .limit(1);

        if (checkError) {
            // Supabase 연결 오류인 경우를 제외하고는 로그만 남기고 계속 진행
            // RLS 정책 문제나 네트워크 일시적 오류일 수 있음
            if (checkError.message && checkError.message.includes('fetch failed')) {
                console.warn(`Version check fetch error for resource ${resourceId}:`, checkError.message);
            } else {
                console.error('Version check error:', {
                    message: checkError.message,
                    code: checkError.code,
                    details: checkError.details
                });
            }
            // 오류가 발생해도 빈 배열을 반환하여 UI가 정상 동작하도록 함
            return NextResponse.json({
                versions: [],
                published_version_id: null,
                status: null
            });
        }

        // 버전이 존재하는 경우 상세 정보 조회
        if (versionsCheck && versionsCheck.length > 0) {
            const { data: resourceMeta } = await supabase
                .from('resources')
                .select('published_version_id, status')
                .eq('id', resourceId)
                .single();

            const { data: versions, error: versionsError } = await supabase
                .from('resource_versions')
                .select('id, version_number, version_code, parent_version_id, version_label, created_at, updated_at, category_id, title, subtitle')
                .eq('resource_id', resourceId)
                .order('version_number', { ascending: false });

            if (versionsError) {
                console.error('Version query error:', versionsError);
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
                    published_version_id: resourceMeta?.published_version_id || null
                });
            }

            if (versions && versions.length > 0) {
                return NextResponse.json({
                    versions: versions,
                    published_version_id: resourceMeta?.published_version_id || null,
                    status: resourceMeta?.status || null
                });
            }
        }

        // 버전이 없음
        const { data: resourceMeta } = await supabase
            .from('resources')
            .select('status')
            .eq('id', resourceId)
            .single();

        return NextResponse.json({
            versions: [],
            published_version_id: null,
            status: resourceMeta?.status || null
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
        const resourceId = parseInt(resolvedParams.id);

        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '유효하지 않은 자료 ID입니다.' }, { status: 400 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { version_id } = body;

        if (!version_id) {
            return NextResponse.json({ error: '버전 ID가 필요합니다.' }, { status: 400 });
        }

        // 버전 데이터 조회
        const { data: version, error: versionError } = await supabase
            .from('resource_versions')
            .select('*')
            .eq('id', version_id)
            .eq('resource_id', resourceId)
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
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const resourceId = parseInt(resolvedParams.id);

        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '유효하지 않은 자료 ID입니다.' }, { status: 400 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 권한 확인
        const { data: resource } = await supabase
            .from('resources')
            .select('id, author_id')
            .eq('id', resourceId)
            .single();

        if (!resource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        const isAuthor = resource.author_id === user.id;

        if (!isAdmin && !isAuthor) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const body = await request.json();
        const { version_id } = body;

        if (!version_id) {
            return NextResponse.json({ error: '버전 ID가 필요합니다.' }, { status: 400 });
        }

        // 버전 존재 확인
        const { data: version, error: versionCheckError } = await supabase
            .from('resource_versions')
            .select('id, resource_id')
            .eq('id', version_id)
            .eq('resource_id', resourceId)
            .single();

        if (versionCheckError || !version) {
            return NextResponse.json({ error: '버전을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 자료 정보 조회
        const { data: currentResource } = await supabase
            .from('resources')
            .select('published_version_id, published_at, status')
            .eq('id', resourceId)
            .single();

        if (!currentResource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        // published_version_id만 변경, republished_at 갱신
        const updateData: Record<string, unknown> = {
            published_version_id: version_id,
            republished_at: new Date().toISOString()
        };

        // 최초 출판인 경우 published_at 설정
        if (!currentResource.published_at) {
            updateData.published_at = new Date().toISOString();
        }

        // status가 draft인 경우 public으로 변경
        if (currentResource.status === 'draft') {
            updateData.status = 'public';
        }

        const { error: updateError } = await supabase
            .from('resources')
            .update(updateData)
            .eq('id', resourceId);

        if (updateError) {
            console.error('재출판 실패:', updateError);
            return NextResponse.json({ error: '재출판에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: '버전이 재출판되었습니다.'
        });
    } catch (error) {
        console.error('재출판 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}






