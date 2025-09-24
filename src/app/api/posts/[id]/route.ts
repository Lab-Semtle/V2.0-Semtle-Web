import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 특정 게시물 조회
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

        // 게시물 조회
        const { data: post, error } = await supabase
            .from('posts')
            .select(`
        *,
        category:board_categories(*),
        author:user_profiles!posts_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        )
      `)
            .eq('id', postId)
            .eq('status', 'published')
            .single();

        if (error) {
            console.error('게시물 조회 오류:', error);
            return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 조회수 증가
        await supabase
            .from('posts')
            .update({ views: post.views + 1 })
            .eq('id', postId);

        return NextResponse.json({ post });
    } catch (error) {
        console.error('게시물 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 게시물 수정
export async function PUT(
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

        // 기존 게시물 조회
        const { data: existingPost, error: fetchError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (fetchError || !existingPost) {
            return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 권한 확인 (작성자 또는 관리자)
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthor = existingPost.author_id === user.id;
        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: '게시물을 수정할 권한이 없습니다.' }, { status: 403 });
        }

        const updateData = await request.json();
        const { title, subtitle, content, thumbnail, category_id, status, tags, attachments } = updateData;

        // 업데이트할 데이터 준비
        const updates: Record<string, unknown> = {
            updated_at: new Date().toISOString()
        };

        if (title !== undefined) updates.title = title;
        if (subtitle !== undefined) updates.subtitle = subtitle;
        if (content !== undefined) updates.content = content;
        if (thumbnail !== undefined) updates.thumbnail = thumbnail;
        if (category_id !== undefined) updates.category_id = category_id;
        if (status !== undefined) {
            updates.status = status;
            if (status === 'published' && existingPost.status !== 'published') {
                updates.published_at = new Date().toISOString();
            }
        }
        if (tags !== undefined) updates.tags = tags;
        if (attachments !== undefined) updates.attachments = attachments;

        // 게시물 업데이트
        const { data: updatedPost, error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', postId)
            .select(`
        *,
        category:board_categories(*),
        author:user_profiles!posts_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        )
      `)
            .single();

        if (error) {
            console.error('게시물 업데이트 오류:', error);
            return NextResponse.json({ error: '게시물 업데이트에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ post: updatedPost });
    } catch (error) {
        console.error('게시물 업데이트 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 게시물 삭제
export async function DELETE(
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

        // 기존 게시물 조회
        const { data: existingPost, error: fetchError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (fetchError || !existingPost) {
            return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 권한 확인 (작성자 또는 관리자)
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthor = existingPost.author_id === user.id;
        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: '게시물을 삭제할 권한이 없습니다.' }, { status: 403 });
        }

        // 게시물 삭제 (소프트 삭제)
        const { error } = await supabase
            .from('posts')
            .update({
                status: 'deleted',
                updated_at: new Date().toISOString()
            })
            .eq('id', postId);

        if (error) {
            console.error('게시물 삭제 오류:', error);
            return NextResponse.json({ error: '게시물 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '게시물이 삭제되었습니다.' });
    } catch (error) {
        console.error('게시물 삭제 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
