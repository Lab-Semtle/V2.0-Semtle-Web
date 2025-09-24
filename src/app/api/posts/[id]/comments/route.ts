import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { CommentCreateData } from '@/types/post';

// 게시물 댓글 목록 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const postId = parseInt(resolvedParams.id);

        if (isNaN(postId)) {
            return NextResponse.json({ error: '잘못된 게시물 ID입니다.' }, { status: 400 });
        }

        // 댓글 조회 (부모 댓글만)
        const { data: comments, error } = await supabase
            .from('post_comments')
            .select(`
        *,
        user:user_profiles!post_comments_user_id_fkey(
          id,
          nickname,
          profile_image
        )
      `)
            .eq('post_id', postId)
            .is('parent_id', null)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('댓글 조회 오류:', error);
            return NextResponse.json({ error: '댓글을 불러올 수 없습니다.' }, { status: 500 });
        }

        // 각 댓글의 대댓글 조회
        const commentsWithReplies = await Promise.all(
            (comments || []).map(async (comment) => {
                const { data: replies } = await supabase
                    .from('post_comments')
                    .select(`
            *,
            user:user_profiles!post_comments_user_id_fkey(
              id,
              nickname,
              profile_image
            )
          `)
                    .eq('parent_id', comment.id)
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: true });

                return {
                    ...comment,
                    replies: replies || []
                };
            })
        );

        return NextResponse.json({ comments: commentsWithReplies });
    } catch (error) {
        console.error('댓글 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 댓글 생성
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const postId = parseInt(resolvedParams.id);

        if (isNaN(postId)) {
            return NextResponse.json({ error: '잘못된 게시물 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const commentData: CommentCreateData = await request.json();
        const { content, parent_id } = commentData;

        if (!content || !content.trim()) {
            return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
        }

        // 게시물 존재 확인
        const { data: post } = await supabase
            .from('posts')
            .select('id, title, author_id')
            .eq('id', postId)
            .eq('status', 'published')
            .single();

        if (!post) {
            return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 댓글 생성
        const { data: newComment, error } = await supabase
            .from('post_comments')
            .insert({
                post_id: postId,
                user_id: user.id,
                content: content.trim(),
                parent_id: parent_id || null
            })
            .select(`
        *,
        user:user_profiles!post_comments_user_id_fkey(
          id,
          nickname,
          profile_image
        )
      `)
            .single();

        if (error) {
            console.error('댓글 생성 오류:', error);
            return NextResponse.json({ error: '댓글 생성에 실패했습니다.' }, { status: 500 });
        }

        // 알림 생성 (작성자에게, 대댓글이 아닌 경우)
        if (!parent_id && post.author_id !== user.id) {
            await supabase
                .from('notifications')
                .insert({
                    user_id: post.author_id,
                    type: 'comment',
                    title: '새로운 댓글',
                    message: `"${post.title}" 게시물에 댓글이 달렸습니다.`,
                    data: {
                        post_id: postId,
                        comment_id: newComment.id,
                        commenter_id: user.id
                    }
                });
        }

        // 대댓글인 경우 원댓글 작성자에게 알림
        if (parent_id) {
            const { data: parentComment } = await supabase
                .from('post_comments')
                .select('user_id')
                .eq('id', parent_id)
                .single();

            if (parentComment && parentComment.user_id !== user.id) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: parentComment.user_id,
                        type: 'comment',
                        title: '새로운 대댓글',
                        message: `"${post.title}" 게시물의 댓글에 답글이 달렸습니다.`,
                        data: {
                            post_id: postId,
                            comment_id: newComment.id,
                            parent_comment_id: parent_id,
                            commenter_id: user.id
                        }
                    });
            }
        }

        return NextResponse.json({ comment: newComment }, { status: 201 });
    } catch (error) {
        console.error('댓글 생성 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
