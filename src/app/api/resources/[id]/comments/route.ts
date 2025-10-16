import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 자료 댓글 목록 조회
export async function GET(
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

        // 댓글 조회
        const { data: comments, error } = await supabase
            .from('resource_comments')
            .select('*')
            .eq('resource_id', resourceId)
            .order('created_at', { ascending: true });

        if (error) {
            return NextResponse.json({ error: '댓글을 불러올 수 없습니다.' }, { status: 500 });
        }

        // 각 댓글별 사용자 정보와 좋아요 수 계산
        const commentsWithLikes = await Promise.all(
            (comments || []).map(async (comment) => {
                try {
                    // 사용자 정보 조회
                    const { data: userProfile } = await supabase
                        .from('user_profiles')
                        .select('id, nickname, name, profile_image, role')
                        .eq('id', comment.user_id)
                        .single();

                    // 좋아요 수 계산
                    const { data: likeCountData } = await supabase
                        .from('resource_comment_likes')
                        .select('id', { count: 'exact' })
                        .eq('comment_id', comment.id);

                    return {
                        ...comment,
                        author: userProfile || {
                            id: comment.user_id,
                            nickname: 'Unknown',
                            name: 'Unknown',
                            profile_image: null,
                            role: 'member'
                        },
                        likes_count: likeCountData?.length || 0
                    };
                } catch {
                    return {
                        ...comment,
                        author: {
                            id: comment.user_id,
                            nickname: 'Unknown',
                            name: 'Unknown',
                            profile_image: null,
                            role: 'member'
                        },
                        likes_count: 0
                    };
                }
            })
        );

        return NextResponse.json({ comments: commentsWithLikes });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 자료 댓글 작성
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

        const body = await request.json();
        const { content, parent_id } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
        }

        // 댓글 작성
        const { data: newComment, error: commentError } = await supabase
            .from('resource_comments')
            .insert({
                resource_id: resourceId,
                user_id: user.id,
                content: content.trim(),
                parent_id: parent_id || null
            })
            .select('*')
            .single();

        if (commentError) {
            return NextResponse.json({ error: '댓글 작성에 실패했습니다.' }, { status: 500 });
        }

        // 사용자 정보 조회
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('id, nickname, name, profile_image, role')
            .eq('id', user.id)
            .single();

        const commentWithUser = {
            ...newComment,
            author: userProfile || {
                id: user.id,
                nickname: 'Unknown',
                name: 'Unknown',
                profile_image: null,
                role: 'member'
            }
        };

        // 댓글 수 업데이트
        const { data: commentCountData } = await supabase
            .from('resource_comments')
            .select('id', { count: 'exact' })
            .eq('resource_id', resourceId);

        const commentsCount = commentCountData?.length || 0;

        await supabase
            .from('resources')
            .update({ comments_count: commentsCount })
            .eq('id', resourceId);

        return NextResponse.json({
            success: true,
            comment: {
                ...commentWithUser,
                likes_count: 0
            }
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
