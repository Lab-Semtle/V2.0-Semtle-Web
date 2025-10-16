import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 자료 좋아요 토글
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const resolvedParams = await params;
        const resourceId = parseInt(resolvedParams.id);
        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '유효하지 않은 자료 ID입니다.' }, { status: 400 });
        }

        // 기존 좋아요 확인
        const { data: existingLike, error: checkError } = await supabase
            .from('resource_likes')
            .select('id')
            .eq('resource_id', resourceId)
            .eq('user_id', user.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            return NextResponse.json({ error: '좋아요 상태를 확인할 수 없습니다.' }, { status: 500 });
        }

        let isLiked = false;
        let likesCount = 0;

        if (existingLike) {
            // 좋아요 취소
            const { error: deleteError } = await supabase
                .from('resource_likes')
                .delete()
                .eq('resource_id', resourceId)
                .eq('user_id', user.id);

            if (deleteError) {
                return NextResponse.json({ error: '좋아요 취소에 실패했습니다.' }, { status: 500 });
            }

            isLiked = false;
        } else {
            // 좋아요 추가
            const { error: insertError } = await supabase
                .from('resource_likes')
                .insert({
                    resource_id: resourceId,
                    user_id: user.id
                });

            if (insertError) {
                return NextResponse.json({ error: '좋아요 추가에 실패했습니다.' }, { status: 500 });
            }

            isLiked = true;
        }

        // 실제 좋아요 수 계산
        const { data: likeCountData } = await supabase
            .from('resource_likes')
            .select('id', { count: 'exact' })
            .eq('resource_id', resourceId);

        likesCount = likeCountData?.length || 0;

        // resources 테이블의 likes_count 업데이트
        await supabase
            .from('resources')
            .update({ likes_count: likesCount })
            .eq('id', resourceId);

        return NextResponse.json({
            success: true,
            isLiked,
            likesCount
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 자료 좋아요 상태 확인
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const resolvedParams = await params;
        const resourceId = parseInt(resolvedParams.id);
        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '유효하지 않은 자료 ID입니다.' }, { status: 400 });
        }

        // 좋아요 상태 확인
        const { data: existingLike, error: checkError } = await supabase
            .from('resource_likes')
            .select('id')
            .eq('resource_id', resourceId)
            .eq('user_id', user.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            return NextResponse.json({ error: '좋아요 상태를 확인할 수 없습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            isLiked: !!existingLike
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
