import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 가시성(공개/비공개) 변경
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

        const { visibility } = await request.json();

        if (!['public', 'private', 'unlisted'].includes(visibility)) {
            return NextResponse.json({ error: '유효하지 않은 가시성 설정입니다.' }, { status: 400 });
        }

        // 작성자 확인
        const { data: resourceData } = await supabase
            .from('resources')
            .select('author_id')
            .eq('id', resourceId)
            .single();

        if (!resourceData || resourceData.author_id !== user.id) {
            return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
        }

        // visibility 업데이트
        const { error: updateError } = await supabase
            .from('resources')
            .update({
                visibility,
                updated_at: new Date().toISOString()
            })
            .eq('id', resourceId);

        if (updateError) {
            console.error('Visibility update error:', updateError);
            return NextResponse.json({ error: '가시성 설정 변경에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true,
            visibility 
        });
    } catch (error) {
        console.error('Visibility update error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}














