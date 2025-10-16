import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: activityId } = await params;
        const supabase = await createServerSupabase();

        // 댓글 조회 (사용자 프로필 정보 포함)
        const { data: comments, error } = await supabase
            .from('activity_comments')
            .select(`
                id,
                content,
                created_at,
                updated_at,
                likes_count,
                user_id,
                parent_id
            `)
            .eq('activity_id', activityId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('댓글 조회 오류:', error);
            return NextResponse.json(
                { error: '댓글을 불러오는데 실패했습니다.' },
                { status: 500 }
            );
        }

        // 사용자 프로필 정보를 별도로 조회하여 병합
        const commentsWithProfiles = await Promise.all(
            (comments || []).map(async (comment) => {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('id, nickname, name, profile_image, role')
                    .eq('id', comment.user_id)
                    .single();

                return {
                    ...comment,
                    user_profiles: profile || {
                        id: comment.user_id,
                        nickname: '알 수 없음',
                        name: '알 수 없음',
                        profile_image: null,
                        role: 'user'
                    }
                };
            })
        );

        return NextResponse.json({ comments: commentsWithProfiles });

    } catch (error) {
        console.error('댓글 조회 오류:', error);
        return NextResponse.json(
            { error: '댓글 조회 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: activityId } = await params;
        const { content, parent_id } = await request.json();
        const supabase = await createServerSupabase();

        // 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 댓글 내용 검증
        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: '댓글 내용을 입력해주세요.' },
                { status: 400 }
            );
        }

        if (content.length > 1000) {
            return NextResponse.json(
                { error: '댓글은 1000자 이하로 작성해주세요.' },
                { status: 400 }
            );
        }

        // 댓글 생성
        const { data: comment, error: insertError } = await supabase
            .from('activity_comments')
            .insert({
                activity_id: activityId,
                user_id: user.id,
                content: content.trim(),
                parent_id: parent_id || null
            })
            .select(`
                id,
                content,
                created_at,
                updated_at,
                likes_count,
                user_id,
                parent_id
            `)
            .single();

        if (insertError) {
            console.error('댓글 생성 오류:', insertError);
            return NextResponse.json(
                { error: '댓글 작성 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        // 사용자 프로필 정보 조회
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, nickname, name, profile_image, role')
            .eq('id', user.id)
            .single();

        const commentWithProfile = {
            ...comment,
            user_profiles: profile || {
                id: user.id,
                nickname: '알 수 없음',
                name: '알 수 없음',
                profile_image: null,
                role: 'user'
            }
        };

        // 활동의 댓글 수는 트리거가 자동으로 업데이트합니다

        return NextResponse.json({ comment: commentWithProfile });

    } catch (error) {
        console.error('댓글 생성 오류:', error);
        return NextResponse.json(
            { error: '댓글 생성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: activityId } = await params;
        const { commentId, content } = await request.json();
        const supabase = await createServerSupabase();

        // 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 댓글 내용 검증
        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: '댓글 내용을 입력해주세요.' },
                { status: 400 }
            );
        }

        if (content.length > 1000) {
            return NextResponse.json(
                { error: '댓글은 1000자 이하로 작성해주세요.' },
                { status: 400 }
            );
        }

        // 댓글 수정 권한 확인
        const { data: existingComment, error: fetchError } = await supabase
            .from('activity_comments')
            .select('user_id')
            .eq('id', commentId)
            .eq('activity_id', activityId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json(
                { error: '댓글을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        if (existingComment.user_id !== user.id) {
            return NextResponse.json(
                { error: '댓글을 수정할 권한이 없습니다.' },
                { status: 403 }
            );
        }

        // 댓글 수정
        const { data: comment, error: updateError } = await supabase
            .from('activity_comments')
            .update({
                content: content.trim(),
                updated_at: new Date().toISOString()
            })
            .eq('id', commentId)
            .eq('activity_id', activityId)
            .select(`
                id,
                content,
                created_at,
                updated_at,
                likes_count,
                user_id,
                parent_id
            `)
            .single();

        if (updateError) {
            console.error('댓글 수정 오류:', updateError);
            return NextResponse.json(
                { error: '댓글 수정 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        // 사용자 프로필 정보 조회
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, nickname, name, profile_image, role')
            .eq('id', comment.user_id)
            .single();

        const commentWithProfile = {
            ...comment,
            user_profiles: profile || {
                id: comment.user_id,
                nickname: '알 수 없음',
                name: '알 수 없음',
                profile_image: null,
                role: 'user'
            }
        };

        return NextResponse.json({ comment: commentWithProfile });

    } catch (error) {
        console.error('댓글 수정 오류:', error);
        return NextResponse.json(
            { error: '댓글 수정 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: activityId } = await params;
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

        // 댓글 삭제 권한 확인
        const { data: existingComment, error: fetchError } = await supabase
            .from('activity_comments')
            .select('user_id')
            .eq('id', commentId)
            .eq('activity_id', activityId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json(
                { error: '댓글을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        if (existingComment.user_id !== user.id) {
            return NextResponse.json(
                { error: '댓글을 삭제할 권한이 없습니다.' },
                { status: 403 }
            );
        }

        // 댓글 삭제 (소프트 삭제)
        const { error: deleteError } = await supabase
            .from('activity_comments')
            .update({ is_deleted: true })
            .eq('id', commentId)
            .eq('activity_id', activityId);

        if (deleteError) {
            console.error('댓글 삭제 오류:', deleteError);
            return NextResponse.json(
                { error: '댓글 삭제 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        // 활동의 댓글 수는 트리거가 자동으로 업데이트합니다

        return NextResponse.json({ message: '댓글이 삭제되었습니다.' });

    } catch (error) {
        console.error('댓글 삭제 오류:', error);
        return NextResponse.json(
            { error: '댓글 삭제 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
