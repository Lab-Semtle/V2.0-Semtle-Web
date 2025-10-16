import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 자료 댓글 좋아요 토글
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
        const commentId = parseInt(resolvedParams.id);
        if (isNaN(commentId)) {
            return NextResponse.json({ error: '유효하지 않은 댓글 ID입니다.' }, { status: 400 });
        }

        // 기존 좋아요 확인
        const { data: existingLike, error: checkError } = await supabase
            .from('resource_comment_likes')
            .select('id')
            .eq('comment_id', commentId)
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
                .from('resource_comment_likes')
                .delete()
                .eq('comment_id', commentId)
                .eq('user_id', user.id);

            if (deleteError) {
                return NextResponse.json({ error: '좋아요 취소에 실패했습니다.' }, { status: 500 });
            }

            isLiked = false;
        } else {
            // 좋아요 추가
            const { error: insertError } = await supabase
                .from('resource_comment_likes')
                .insert({
                    comment_id: commentId,
                    user_id: user.id
                });

            if (insertError) {
                return NextResponse.json({ error: '좋아요 추가에 실패했습니다.' }, { status: 500 });
            }

            isLiked = true;
        }

        // 실제 좋아요 수 계산
        const { data: likeCountData } = await supabase
            .from('resource_comment_likes')
            .select('id', { count: 'exact' })
            .eq('comment_id', commentId);

        likesCount = likeCountData?.length || 0;

        return NextResponse.json({
            success: true,
            isLiked,
            likesCount
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 자료 댓글 좋아요 상태 확인
export async function GET(
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
        const commentId = parseInt(resolvedParams.id);
        if (isNaN(commentId)) {
            return NextResponse.json({ error: '유효하지 않은 댓글 ID입니다.' }, { status: 400 });
        }

        // 좋아요 상태 확인
        const { data: existingLike, error: checkError } = await supabase
            .from('resource_comment_likes')
            .select('id')
            .eq('comment_id', commentId)
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