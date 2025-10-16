import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { CommentUpdateData } from '@/types/post';

// 댓글 수정
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

        const updateData: CommentUpdateData = await request.json();
        const { content } = updateData;

        if (!content || !content.trim()) {
            return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
        }

        // 기존 댓글 확인
        const { data: existingComment, error: fetchError } = await supabase
            .from('post_comments')
            .select('*')
            .eq('id', commentId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 권한 확인 (작성자 또는 관리자)
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthor = existingComment.user_id === user.id;
        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: '댓글을 수정할 권한이 없습니다.' }, { status: 403 });
        }

        // 댓글 수정
        const { data: updatedComment, error } = await supabase
            .from('post_comments')
            .update({
                content: content.trim(),
                updated_at: new Date().toISOString()
            })
            .eq('id', commentId)
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
            return NextResponse.json({ error: '댓글 수정에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ comment: updatedComment });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 댓글 삭제
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
            .from('post_comments')
            .select('*')
            .eq('id', commentId)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 권한 확인 (작성자 또는 관리자)
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthor = existingComment.user_id === user.id;
        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: '댓글을 삭제할 권한이 없습니다.' }, { status: 403 });
        }

        // 댓글 삭제 (소프트 삭제)
        const { error } = await supabase
            .from('post_comments')
            .update({
                is_deleted: true,
                content: '[삭제된 댓글입니다]',
                updated_at: new Date().toISOString()
            })
            .eq('id', commentId);

        if (error) {
            return NextResponse.json({ error: '댓글 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '댓글이 삭제되었습니다.' });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
