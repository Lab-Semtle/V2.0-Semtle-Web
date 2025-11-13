import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Supabase에서 반환되는 원시 댓글 타입
interface RawComment {
    id: number;
    user_id: string;
    content: string;
    created_at: string;
    updated_at?: string;
    parent_id?: number;
    is_deleted: boolean;
    likes_count: { count: number }[];
}

// 최종 변환된 댓글 타입
interface CommentWithLikes {
    id: number;
    user_id: string;
    content: string;
    created_at: string;
    updated_at?: string;
    parent_id?: number;
    is_deleted: boolean;
    likes_count: number;
}

// 좋아요 수를 숫자로 변환하는 헬퍼 함수
function normalizeLikesCount(likesCount: { count: number }[]): number {
    return likesCount[0]?.count || 0;
}

// RawComment를 CommentWithLikes로 변환하는 헬퍼 함수
function transformComment(rawComment: RawComment): CommentWithLikes {
    return {
        ...rawComment,
        likes_count: normalizeLikesCount(rawComment.likes_count)
    };
}

// 통합 댓글 수정 API
export async function PUT(
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
        const { postType, postId, commentId } = resolvedParams;
        const postIdNum = parseInt(postId);
        const commentIdNum = parseInt(commentId);

        if (isNaN(postIdNum) || isNaN(commentIdNum)) {
            return NextResponse.json({ error: '잘못된 게시물 또는 댓글 ID입니다.' }, { status: 400 });
        }

        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
        }

        // 게시물 타입에 따른 테이블 매핑
        const tableMap = {
            project: 'project_comments',
            activity: 'activity_comments',
            resource: 'resource_comments'
        };

        const commentTable = tableMap[postType as keyof typeof tableMap];
        if (!commentTable) {
            return NextResponse.json({ error: '지원하지 않는 게시물 타입입니다.' }, { status: 400 });
        }

        // 댓글 존재 확인 및 작성자 확인
        const { data: comment, error: commentError } = await supabase
            .from(commentTable)
            .select('id, user_id, content')
            .eq('id', commentIdNum)
            .eq(`${postType}_id`, postIdNum)
            .eq('is_deleted', false)
            .single();

        if (commentError || !comment) {
            return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
        }

        if (comment.user_id !== user.id) {
            return NextResponse.json({ error: '댓글을 수정할 권한이 없습니다.' }, { status: 403 });
        }

        // 실제로 내용이 변경되었는지 확인
        const trimmedContent = content.trim();
        const currentContent = comment.content.trim();
        
        // 내용이 변경되지 않았으면 updated_at을 업데이트하지 않음
        const updateData: { content: string; updated_at?: string } = {
            content: trimmedContent
        };
        
        // 실제로 내용이 변경된 경우에만 updated_at 업데이트
        if (trimmedContent !== currentContent) {
            updateData.updated_at = new Date().toISOString();
        }

        // 댓글 수정
        const { data: updatedComment, error: updateError } = await supabase
            .from(commentTable)
            .update(updateData)
            .eq('id', commentIdNum)
            .select(`
                *,
                likes_count:${commentTable.replace('_comments', '_comment_likes')}(count)
            `)
            .single();

        if (updateError) {
            console.error('댓글 수정 오류:', updateError);
            return NextResponse.json({ error: '댓글 수정에 실패했습니다.' }, { status: 500 });
        }

        // 사용자 정보 조회
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .eq('id', user.id)
            .single();

        const commentWithUser = {
            ...transformComment(updatedComment as unknown as RawComment),
            user: userProfile || {
                id: user.id,
                nickname: 'Unknown',
                profile_image: null
            }
        };

        return NextResponse.json({ comment: commentWithUser });
    } catch (error) {
        console.error('댓글 수정 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}


