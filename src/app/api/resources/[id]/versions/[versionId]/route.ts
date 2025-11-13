import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 특정 버전 메타데이터 수정 (버전 이름 등)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const resourceId = parseInt(resolvedParams.id);
        const versionId = parseInt(resolvedParams.versionId);

        if (isNaN(resourceId) || isNaN(versionId)) {
            return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 });
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
        const { version_label } = body;

        // 버전 이름만 업데이트
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString()
        };

        if (version_label !== undefined) {
            updateData.version_label = version_label?.trim() || null;
        }

        const { error: updateError } = await supabase
            .from('resource_versions')
            .update(updateData)
            .eq('id', versionId)
            .eq('resource_id', resourceId);

        if (updateError) {
            console.error('Version update error:', updateError);
            return NextResponse.json({ error: '버전 수정에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: '버전이 수정되었습니다.'
        });
    } catch (error) {
        console.error('Version update error:', error);
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
        const resourceId = parseInt(resolvedParams.id);
        const versionId = parseInt(resolvedParams.versionId);

        if (isNaN(resourceId) || isNaN(versionId)) {
            return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 권한 확인
        const { data: resource } = await supabase
            .from('resources')
            .select('id, author_id, published_version_id')
            .eq('id', resourceId)
            .single();

        if (!resource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 출판된 버전은 삭제 불가
        if (resource.published_version_id === versionId) {
            return NextResponse.json({ error: '출판된 버전은 삭제할 수 없습니다.' }, { status: 400 });
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

        // 버전 삭제
        const { error: deleteError } = await supabase
            .from('resource_versions')
            .delete()
            .eq('id', versionId)
            .eq('resource_id', resourceId);

        if (deleteError) {
            console.error('Version delete error:', deleteError);
            return NextResponse.json({ error: '버전 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: '버전이 삭제되었습니다.'
        });
    } catch (error) {
        console.error('Version delete error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

