import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 통합 댓글 좋아요 토글 API
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postType: string; postId: string; commentId: string }> }
) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { postType, commentId } = resolvedParams;
        const commentIdNum = parseInt(commentId);

        if (isNaN(commentIdNum)) {
            return NextResponse.json({ error: '유효하지 않은 댓글 ID입니다.' }, { status: 400 });
        }

        // 게시물 타입에 따른 좋아요 테이블 및 댓글 테이블 매핑
        const likeTableMap = {
            project: 'project_comment_likes',
            activity: 'activity_comment_likes',
            resource: 'resource_comment_likes'
        };

        const commentTableMap = {
            project: 'project_comments',
            activity: 'activity_comments',
            resource: 'resource_comments'
        };

        const likeTable = likeTableMap[postType as keyof typeof likeTableMap];
        const commentTable = commentTableMap[postType as keyof typeof commentTableMap];
        
        if (!likeTable || !commentTable) {
            return NextResponse.json({ error: '지원하지 않는 게시물 타입입니다.' }, { status: 400 });
        }

        // 기존 좋아요 확인
        const { data: existingLike, error: checkError } = await supabase
            .from(likeTable)
            .select('id')
            .eq('comment_id', commentIdNum)
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
                .from(likeTable)
                .delete()
                .eq('comment_id', commentIdNum)
                .eq('user_id', user.id);

            if (deleteError) {
                return NextResponse.json({ error: '좋아요 취소에 실패했습니다.' }, { status: 500 });
            }

            isLiked = false;
        } else {
            // 좋아요 추가
            const { error: insertError } = await supabase
                .from(likeTable)
                .insert({
                    comment_id: commentIdNum,
                    user_id: user.id
                });

            if (insertError) {
                return NextResponse.json({ error: '좋아요 추가에 실패했습니다.' }, { status: 500 });
            }

            isLiked = true;
        }

        // 댓글 테이블에서 업데이트된 likes_count 가져오기 (트리거가 자동으로 업데이트함)
        const { data: commentData, error: commentError } = await supabase
            .from(commentTable)
            .select('likes_count')
            .eq('id', commentIdNum)
            .single();

        if (commentError) {
            console.error('댓글 좋아요 수 조회 실패:', commentError);
            // 폴백: 직접 계산
            const { data: likeCountData } = await supabase
                .from(likeTable)
                .select('id', { count: 'exact' })
                .eq('comment_id', commentIdNum);
            
            likesCount = likeCountData?.length || 0;
        } else {
            likesCount = commentData?.likes_count || 0;
        }

        return NextResponse.json({
            success: true,
            isLiked,
            likesCount
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 통합 댓글 좋아요 상태 확인 API
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postType: string; postId: string; commentId: string }> }
) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { postType, commentId } = resolvedParams;
        const commentIdNum = parseInt(commentId);

        if (isNaN(commentIdNum)) {
            return NextResponse.json({ error: '유효하지 않은 댓글 ID입니다.' }, { status: 400 });
        }

        // 게시물 타입에 따른 좋아요 테이블 매핑
        const likeTableMap = {
            project: 'project_comment_likes',
            activity: 'activity_comment_likes',
            resource: 'resource_comment_likes'
        };

        const likeTable = likeTableMap[postType as keyof typeof likeTableMap];
        if (!likeTable) {
            return NextResponse.json({ error: '지원하지 않는 게시물 타입입니다.' }, { status: 400 });
        }

        // 좋아요 상태 확인
        const { data: existingLike, error: checkError } = await supabase
            .from(likeTable)
            .select('id')
            .eq('comment_id', commentIdNum)
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


