import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 프로젝트 댓글 수정
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const commentId = parseInt(resolvedParams.id);

        if (isNaN(commentId)) {
            return NextResponse.json({ error: '잘못된 댓글 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const { content, is_deleted } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
        }

        // 기존 댓글 확인
        const { data: existingComment, error: fetchError } = await supabase
            .from('project_comments')
            .select('*')
            .eq('id', commentId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 권한 확인 (작성자 또는 관리자)
        const { data: currentUserProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthor = existingComment.user_id === user.id;
        const isAdmin = currentUserProfile?.role === 'admin' || currentUserProfile?.role === 'super_admin';

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: '댓글을 수정할 권한이 없습니다.' }, { status: 403 });
        }

        // 댓글 수정 (또는 소프트 삭제)
        const updateData: Record<string, unknown> = {
            content: content.trim(),
            updated_at: new Date().toISOString()
        };

        // 소프트 삭제인 경우 is_deleted 플래그 설정
        if (is_deleted) {
            updateData.is_deleted = true;
        }

        const { data: updatedComment, error } = await supabase
            .from('project_comments')
            .update(updateData)
            .eq('id', commentId)
            .select('*')
            .single();

        if (error) {
            console.error('댓글 수정 오류:', error);
            return NextResponse.json({ error: '댓글 수정에 실패했습니다.' }, { status: 500 });
        }

        // 사용자 정보 조회
        const { data: commentUserProfile } = await supabase
            .from('user_profiles')
            .select('id, nickname, profile_image')
            .eq('id', updatedComment.user_id)
            .single();

        const commentWithUser = {
            ...updatedComment,
            user: commentUserProfile || {
                id: updatedComment.user_id,
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

// 프로젝트 댓글 삭제
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const commentId = parseInt(resolvedParams.id);

        if (isNaN(commentId)) {
            return NextResponse.json({ error: '잘못된 댓글 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 기존 댓글 확인
        const { data: existingComment, error: fetchError } = await supabase
            .from('project_comments')
            .select('*')
            .eq('id', commentId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 권한 확인 (작성자 또는 관리자)
        const { data: currentUserProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthor = existingComment.user_id === user.id;
        const isAdmin = currentUserProfile?.role === 'admin' || currentUserProfile?.role === 'super_admin';

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: '댓글을 삭제할 권한이 없습니다.' }, { status: 403 });
        }

        // 댓글 삭제 (소프트 삭제)
        const { error } = await supabase
            .from('project_comments')
            .update({
                is_deleted: true,
                content: '[삭제된 댓글입니다]',
                updated_at: new Date().toISOString()
            })
            .eq('id', commentId);

        if (error) {
            console.error('댓글 삭제 오류:', error);
            return NextResponse.json({ error: '댓글 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('댓글 삭제 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
