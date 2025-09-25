import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 개별 자료 조회
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabase();
        const resourceId = parseInt(params.id);

        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '유효하지 않은 자료 ID입니다.' }, { status: 400 });
        }

        // 자료 조회
        const { data: resource, error } = await supabase
            .from('resources')
            .select(`
                *,
                category:resource_categories(*),
                resource_type:resource_types(*),
                author:user_profiles!resources_author_id_fkey(
                    id, nickname, name, profile_image, role
                )
            `)
            .eq('id', resourceId)
            .single();

        if (error) {
            console.error('자료 조회 오류:', error);
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (!resource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({ resource });
    } catch (error) {
        console.error('자료 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 자료 수정
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabase();
        const resourceId = parseInt(params.id);

        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '유효하지 않은 자료 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const updateData = await request.json();
        console.log('Updating resource with data:', updateData);

        // 작성자 확인
        const { data: existingResource } = await supabase
            .from('resources')
            .select('author_id')
            .eq('id', resourceId)
            .single();

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
                resource_type_id: updateData.resource_type_id,
                status: updateData.status === 'published' ? 'published' : 'draft',
                subject: updateData.subject || '',
                professor: updateData.professor || '',
                semester: updateData.semester || '',
                year: updateData.year ? parseInt(updateData.year) : undefined,
                difficulty_level: updateData.difficulty_level || '',
                file_extension: updateData.file_extension || '',
                original_filename: updateData.original_filename || '',
                downloads_count: updateData.downloads_count || 0,
                rating: updateData.rating || 0,
                rating_count: updateData.rating_count || 0,
                published_at: updateData.status === 'published' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', resourceId)
            .select()
            .single();

        if (updateError) {
            console.error('자료 업데이트 오류:', updateError);
            return NextResponse.json({ error: '자료 수정에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ resource: updatedResource });
    } catch (error) {
        console.error('자료 수정 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 자료 삭제
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabase();
        const resourceId = parseInt(params.id);

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
            console.error('자료 삭제 오류:', deleteError);
            return NextResponse.json({ error: '자료 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '자료가 삭제되었습니다.' });
    } catch (error) {
        console.error('자료 삭제 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
