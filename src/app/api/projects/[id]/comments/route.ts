import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

interface Comment {
    id: number;
    user_id: string;
    content: string;
    created_at: string;
    replies?: Comment[];
}

// 프로젝트 댓글 목록 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const projectId = parseInt(resolvedParams.id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '잘못된 프로젝트 ID입니다.' }, { status: 400 });
        }

        // 프로젝트 존재 확인
        const { data: project } = await supabase
            .from('projects')
            .select('id, status')
            .eq('id', projectId)
            .eq('status', 'published')
            .single();

        if (!project) {
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 댓글 조회 (부모 댓글만)
        const { data: comments, error } = await supabase
            .from('project_comments')
            .select('*')
            .eq('project_id', projectId)
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
                    .from('project_comments')
                    .select('*')
                    .eq('parent_id', comment.id)
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: true });

                return {
                    ...comment,
                    replies: replies || []
                };
            })
        );

        // 모든 댓글과 대댓글의 사용자 정보 조회
        const allCommentIds = [
            ...commentsWithReplies.map(c => c.user_id),
            ...commentsWithReplies.flatMap(c => c.replies.map((r: Comment) => r.user_id))
        ];
        const uniqueUserIds = [...new Set(allCommentIds)];

        const { data: users } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .in('id', uniqueUserIds);

        // 사용자 정보를 댓글에 매핑
        const commentsWithUsers = commentsWithReplies.map(comment => ({
            ...comment,
            user: users?.find(u => u.id === comment.user_id) || {
                id: comment.user_id,
                nickname: 'Unknown',
                profile_image: null
            },
            replies: comment.replies.map((reply: Comment) => ({
                ...reply,
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

// 프로젝트 댓글 생성
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const projectId = parseInt(resolvedParams.id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '잘못된 프로젝트 ID입니다.' }, { status: 400 });
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

        // 프로젝트 존재 확인
        const { data: project } = await supabase
            .from('projects')
            .select('id, title, author_id')
            .eq('id', projectId)
            .eq('status', 'published')
            .single();

        if (!project) {
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 댓글 생성
        const { data: newComment, error } = await supabase
            .from('project_comments')
            .insert({
                project_id: projectId,
                user_id: user.id,
                content: content.trim(),
                parent_id: parent_id || null
            })
            .select('*')
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
            ...newComment,
            user: userProfile || {
                id: user.id,
                nickname: 'Unknown',
                profile_image: null
            }
        };

        // 알림 생성 (작성자에게, 대댓글이 아닌 경우)
        if (!parent_id && project.author_id !== user.id) {
            await supabase
                .from('notifications')
                .insert({
                    user_id: project.author_id,
                    type: 'comment',
                    title: '새로운 댓글이 달렸습니다',
                    message: `${commentWithUser.user.nickname}님이 프로젝트 "${project.title}"에 댓글을 남겼습니다.`,
                    related_id: projectId,
                    related_type: 'project'
                });
        }

        return NextResponse.json({ comment: commentWithUser });
    } catch (error) {
        console.error('댓글 생성 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
