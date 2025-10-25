import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

interface UserProfile {
    id: string;
    nickname: string;
    profile_image?: string;
}

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
    replies?: CommentWithLikes[];
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

// 통합 댓글 조회 API
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postType: string; postId: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const { postType, postId } = resolvedParams;
        const postIdNum = parseInt(postId);

        if (isNaN(postIdNum)) {
            return NextResponse.json({ error: '잘못된 게시물 ID입니다.' }, { status: 400 });
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

        // 게시물 존재 확인
        const postTableMap = {
            project: 'projects',
            activity: 'activities',
            resource: 'resources'
        };

        const postTable = postTableMap[postType as keyof typeof postTableMap];
        const postIdField = postType === 'activity' ? 'id' : 'id';

        const { data: post } = await supabase
            .from(postTable)
            .select('id, status')
            .eq(postIdField, postIdNum)
            .eq('status', 'published')
            .single();

        if (!post) {
            return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 댓글 조회 (부모 댓글만) - 좋아요 수 포함
        const likeTable = commentTable.replace('_comments', '_comment_likes');
        const { data: comments, error } = await supabase
            .from(commentTable)
            .select(`
                *,
                likes_count:${likeTable}(count)
            `)
            .eq(`${postType}_id`, postIdNum)
            .is('parent_id', null)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('댓글 조회 오류:', error);
            return NextResponse.json({ error: '댓글을 불러올 수 없습니다.' }, { status: 500 });
        }

        // 각 댓글의 대댓글 조회
        const commentsWithReplies = await Promise.all(
            (comments as unknown as RawComment[] || []).map(async (comment: RawComment) => {
                const { data: replies } = await supabase
                    .from(commentTable)
                    .select(`
                        *,
                        likes_count:${likeTable}(count)
                    `)
                    .eq('parent_id', comment.id)
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: true });

                return {
                    ...transformComment(comment),
                    replies: (replies as unknown as RawComment[] || []).map((reply: RawComment) => transformComment(reply))
                };
            })
        );

        // 모든 댓글과 대댓글의 사용자 정보 조회
        const allCommentIds = [
            ...commentsWithReplies.map(c => c.user_id),
            ...commentsWithReplies.flatMap(c => c.replies?.map((r: CommentWithLikes) => r.user_id) || [])
        ];
        const uniqueUserIds = [...new Set(allCommentIds)];

        const { data: users } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .in('id', uniqueUserIds) as { data: UserProfile[] | null };

        // 사용자 정보를 댓글에 매핑
        const commentsWithUsers = commentsWithReplies.map(comment => ({
            ...comment,
            user_id: comment.user_id,
            user: users?.find(u => u.id === comment.user_id) || {
                id: comment.user_id,
                nickname: 'Unknown',
                profile_image: null
            },
            replies: comment.replies?.map((reply: CommentWithLikes) => ({
                ...reply,
                user_id: reply.user_id,
                user: users?.find(u => u.id === reply.user_id) || {
                    id: reply.user_id,
                    nickname: 'Unknown',
                    profile_image: null
                }
            }))
        }));

        return NextResponse.json({ comments: commentsWithUsers });
    } catch (error) {
        console.error('댓글 조회 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 통합 댓글 생성 API
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postType: string; postId: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const { postType, postId } = resolvedParams;
        const postIdNum = parseInt(postId);

        if (isNaN(postIdNum)) {
            return NextResponse.json({ error: '잘못된 게시물 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const { content, parent_id } = await request.json();

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

        // 게시물 존재 확인
        const postTableMap = {
            project: 'projects',
            activity: 'activities',
            resource: 'resources'
        };

        const postTable = postTableMap[postType as keyof typeof postTableMap];
        const postIdField = postType === 'activity' ? 'id' : 'id';

        const { data: post } = await supabase
            .from(postTable)
            .select('id, title, author_id')
            .eq(postIdField, postIdNum)
            .eq('status', 'published')
            .single();

        if (!post) {
            return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 댓글 생성
        const likeTable = commentTable.replace('_comments', '_comment_likes');
        const { data: newComment, error } = await supabase
            .from(commentTable)
            .insert({
                [`${postType}_id`]: postIdNum,
                user_id: user.id,
                content: content.trim(),
                parent_id: parent_id || null
            })
            .select(`
                *,
                likes_count:${likeTable}(count)
            `)
            .single();

        if (error) {
            console.error('댓글 생성 오류:', error);
            return NextResponse.json({ error: '댓글 생성에 실패했습니다.' }, { status: 500 });
        }

        // 사용자 정보 조회
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .eq('id', user.id)
            .single();

        const commentWithUser = {
            ...transformComment(newComment as unknown as RawComment),
            user: userProfile || {
                id: user.id,
                nickname: 'Unknown',
                profile_image: null
            }
        };

        // 알림 생성 (작성자에게, 대댓글이 아닌 경우)
        if (!parent_id && post.author_id !== user.id) {
            await supabase
                .from('notifications')
                .insert({
                    user_id: post.author_id,
                    type: 'comment',
                    title: '새로운 댓글이 달렸습니다',
                    message: `${commentWithUser.user.nickname}님이 ${postType === 'project' ? '프로젝트' : postType === 'activity' ? '활동' : '자료'} "${post.title}"에 댓글을 남겼습니다.`,
                    related_id: postIdNum,
                    related_type: postType
                });
        }

        return NextResponse.json({ comment: commentWithUser });
    } catch (error) {
        console.error('댓글 생성 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
