import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 출판하기 (published로 변경)
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

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 작성자 확인
        const { data: resourceData } = await supabase
            .from('resources')
            .select('author_id, latest_version_id, published_version_id')
            .eq('id', resourceId)
            .single();

        if (!resourceData || resourceData.author_id !== user.id) {
            return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
        }

        // latest_version_id를 published_version_id로 설정
        const latestVersionId = resourceData.latest_version_id;

        if (!latestVersionId) {
            return NextResponse.json({ error: '저장된 내용이 없습니다.' }, { status: 400 });
        }

        // latest_version의 content 가져오기
        const { data: latestVersion } = await supabase
            .from('resource_versions')
            .select('content')
            .eq('id', latestVersionId)
            .single();

        if (!latestVersion) {
            return NextResponse.json({ error: '버전 정보를 찾을 수 없습니다.' }, { status: 404 });
        }

        // published_version_id가 없으면 새로 생성, 있으면 업데이트
        let publishedVersionId = resourceData.published_version_id;

        if (!publishedVersionId) {
            // 새 published 버전 생성
            const { data: newPublishedVersion } = await supabase
                .from('resource_versions')
                .insert({
                    resource_id: resourceId,
                    content: latestVersion.content,
                    version_number: 9999 // published 버전은 항상 가장 큰 번호
                })
                .select()
                .single();

            if (!newPublishedVersion) {
                return NextResponse.json({ error: '출판 버전 생성에 실패했습니다.' }, { status: 500 });
            }
            publishedVersionId = newPublishedVersion.id;
        } else {
            // 기존 published 버전 업데이트
            await supabase
                .from('resource_versions')
                .update({
                    content: latestVersion.content,
                    updated_at: new Date().toISOString()
                })
                .eq('id', publishedVersionId);
        }

        // published_at 설정 (첫 출판인 경우만)
        const { data: currentResource } = await supabase
            .from('resources')
            .select('published_at, status')
            .eq('id', resourceId)
            .single();

        const isFirstPublish = !currentResource?.published_at;
        const publishedAt = isFirstPublish ? new Date().toISOString() : currentResource?.published_at;

        // resources 업데이트
        const { error: updateError } = await supabase
            .from('resources')
            .update({
                published_version_id: publishedVersionId,
                status: 'published', // 첫 출판인 경우 published로 설정
                published_at: publishedAt,
                updated_at: new Date().toISOString()
            })
            .eq('id', resourceId);

        if (updateError) {
            console.error('Publish error:', updateError);
            return NextResponse.json({ error: '출판에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: '출판되었습니다.'
        });
    } catch (error) {
        console.error('Publish error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

