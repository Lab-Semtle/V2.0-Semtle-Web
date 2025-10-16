import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await params; // params를 await하여 Promise 해결
        const { commentId } = await request.json();
        const supabase = await createServerSupabase();

        // 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 기존 좋아요 확인
        const { data: existingLike } = await supabase
            .from('activity_comment_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', user.id)
            .single();

        if (existingLike) {
            // 좋아요 취소
            const { error: deleteError } = await supabase
                .from('activity_comment_likes')
                .delete()
                .eq('comment_id', commentId)
                .eq('user_id', user.id);

            if (deleteError) {
                return NextResponse.json(
                    { error: '좋아요 취소 중 오류가 발생했습니다.' },
                    { status: 500 }
                );
            }

            // 댓글의 좋아요 수 감소
            await supabase.rpc('decrement_likes_count', {
                comment_id: commentId
            });

            return NextResponse.json({
                message: '좋아요가 취소되었습니다.',
                liked: false
            });
        } else {
            // 좋아요 추가
            const { error: insertError } = await supabase
                .from('activity_comment_likes')
                .insert({
                    comment_id: commentId,
                    user_id: user.id
                });

            if (insertError) {
                return NextResponse.json(
                    { error: '좋아요 추가 중 오류가 발생했습니다.' },
                    { status: 500 }
                );
            }

            // 댓글의 좋아요 수 증가
            await supabase.rpc('increment_likes_count', {
                comment_id: commentId
            });

            return NextResponse.json({
                message: '좋아요가 추가되었습니다.',
                liked: true
            });
        }

    } catch (error) {
        console.error('댓글 좋아요 처리 오류:', error);
        return NextResponse.json(
            { error: '댓글 좋아요 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await params; // params를 await하여 Promise 해결
        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get('commentId');
        const supabase = await createServerSupabase();

        // 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        if (!commentId) {
            return NextResponse.json(
                { error: '댓글 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        // 사용자의 좋아요 상태 확인
        const { data: like } = await supabase
            .from('activity_comment_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', user.id)
            .single();

        return NextResponse.json({
            liked: !!like
        });

    } catch (error) {
        console.error('댓글 좋아요 상태 확인 오류:', error);
        return NextResponse.json(
            { error: '댓글 좋아요 상태 확인 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
