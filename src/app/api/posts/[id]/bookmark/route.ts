import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 게시물 북마크 토글
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

        // 기존 북마크 확인
        const { data: existingBookmark } = await supabase
            .from('post_bookmarks')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (existingBookmark) {
            // 북마크 취소
            const { error: deleteError } = await supabase
                .from('post_bookmarks')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);

            if (deleteError) {
                console.error('북마크 취소 오류:', deleteError);
                return NextResponse.json({ error: '북마크 취소에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({
                bookmarked: false,
                message: '북마크가 취소되었습니다.'
            });
        } else {
            // 북마크 추가
            const { error: insertError } = await supabase
                .from('post_bookmarks')
                .insert({
                    post_id: postId,
                    user_id: user.id
                });

            if (insertError) {
                console.error('북마크 추가 오류:', insertError);
                return NextResponse.json({ error: '북마크 추가에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({
                bookmarked: true,
                message: '북마크가 추가되었습니다.'
            });
        }
    } catch (error) {
        console.error('북마크 토글 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 게시물 북마크 상태 확인
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

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ bookmarked: false });
        }

        // 북마크 상태 확인
        const { data: bookmark } = await supabase
            .from('post_bookmarks')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        return NextResponse.json({ bookmarked: !!bookmark });
    } catch (error) {
        console.error('북마크 상태 확인 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
