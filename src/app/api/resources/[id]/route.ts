import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 개별 자료 조회
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

        // 자료 조회 (파일 목록 포함)
        const { data: resource, error } = await supabase
            .from('resources')
            .select(`
                *,
                category:resource_categories(*),
                files:resource_files(*)
            `)
            .eq('id', resourceId)
            .single();

        if (error) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (!resource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 실제 좋아요 수 계산
        const { data: likeCountData } = await supabase
            .from('resource_likes')
            .select('id', { count: 'exact' })
            .eq('resource_id', resourceId);

        const actualLikesCount = likeCountData?.length || 0;

        // 실제 다운로드 수 계산
        const { data: downloadCountData } = await supabase
            .from('resource_downloads')
            .select('id', { count: 'exact' })
            .eq('resource_id', resourceId);

        const actualDownloadsCount = downloadCountData?.length || 0;

        // 실제 댓글 수 계산 (답글 제외, 부모 댓글만)
        const { data: commentCountData } = await supabase
            .from('resource_comments')
            .select('id', { count: 'exact' })
            .eq('resource_id', resourceId)
            .is('parent_id', null);

        const actualCommentsCount = commentCountData?.length || 0;

        // 작성자 정보 조회
        const { data: authorData } = await supabase
            .from('user_profiles')
            .select('id, nickname, name, profile_image, role')
            .eq('id', resource.author_id)
            .single();

        // resources 테이블의 likes_count, downloads_count, comments_count를 실제 값으로 업데이트
        await supabase
            .from('resources')
            .update({
                likes_count: actualLikesCount,
                downloads_count: actualDownloadsCount,
                comments_count: actualCommentsCount
            })
            .eq('id', resourceId);

        return NextResponse.json({
            resource: {
                ...resource,
                likes_count: actualLikesCount,
                downloads_count: actualDownloadsCount,
                comments_count: actualCommentsCount,
                author: authorData
            }
        });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 자료 수정
export async function PATCH(
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

        const updateData = await request.json();

        // 작성자 확인
        const { data: existingResource, error: existingError } = await supabase
            .from('resources')
            .select('author_id')
            .eq('id', resourceId)
            .single();

        if (existingError) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (!existingResource || existingResource.author_id !== user.id) {
            return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
        }

        // 카테고리 ID 찾기
        let category_id = null;
        if (updateData.category) {
            const { data: categoryData } = await supabase
                .from('resource_categories')
                .select('id')
                .eq('name', updateData.category)
                .single();
            category_id = categoryData?.id;
        }

        // 자료 업데이트
        const { data: updatedResource, error: updateError } = await supabase
            .from('resources')
            .update({
                title: updateData.title,
                subtitle: updateData.description || '',
                content: updateData.content || null,
                thumbnail: updateData.thumbnail,
                category_id,
                status: updateData.status === 'published' ? 'published' : 'draft',
                subject: updateData.subject || '',
                professor: updateData.professor || '',
                semester: updateData.semester || '',
                year: updateData.year ? parseInt(updateData.year) : undefined,
                difficulty_level: updateData.difficulty_level || '',
                published_at: updateData.status === 'published' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', resourceId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: '자료 수정에 실패했습니다.' }, { status: 500 });
        }

        // 파일 처리 (기존 파일 삭제 후 새 파일 추가)
        if (updateData.files && Array.isArray(updateData.files)) {
            // 기존 파일들 삭제
            const { error: deleteFilesError } = await supabase
                .from('resource_files')
                .delete()
                .eq('resource_id', resourceId);

            if (deleteFilesError) {
                console.log('기존 파일 삭제 오류:', deleteFilesError);
            }

            // 새 파일들 추가
            if (updateData.files.length > 0) {
                const fileRecords = updateData.files.map((file: { file_path?: string; url?: string; name?: string; size?: number; type?: string }, index: number) => ({
                    resource_id: resourceId,
                    file_path: file.file_path || file.url || '',
                    original_filename: file.name || '',
                    file_size: file.size || 0,
                    file_type: file.type || 'application/octet-stream',
                    upload_order: index + 1
                }));

                const { error: insertFilesError } = await supabase
                    .from('resource_files')
                    .insert(fileRecords);

                if (insertFilesError) {
                    console.log('새 파일 추가 오류:', insertFilesError);
                }
            }
        }

        return NextResponse.json({ resource: updatedResource });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 자료 삭제
export async function DELETE(
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
        const { data: existingResource } = await supabase
            .from('resources')
            .select('author_id')
            .eq('id', resourceId)
            .single();

        if (!existingResource || existingResource.author_id !== user.id) {
            return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
        }

        // 자료 삭제
        const { error: deleteError } = await supabase
            .from('resources')
            .delete()
            .eq('id', resourceId);

        if (deleteError) {
            return NextResponse.json({ error: '자료 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '자료가 삭제되었습니다.' });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}





