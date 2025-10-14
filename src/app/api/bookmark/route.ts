import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 북마크/북마크 해제
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { postId, postType } = await request.json();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        if (!postId || !postType) {
            return NextResponse.json({ error: '게시물 ID와 타입이 필요합니다.' }, { status: 400 });
        }

        // 북마크 상태 확인
        const { data: existingBookmark } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .eq('post_type', postType)
            .single();

        if (existingBookmark) {
            // 북마크 해제
            const { error: deleteError } = await supabase
                .from('bookmarks')
                .delete()
                .eq('user_id', user.id)
                .eq('post_id', postId)
                .eq('post_type', postType);

            if (deleteError) {
                return NextResponse.json({ error: '북마크 해제에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({
                message: '북마크가 해제되었습니다.',
                isBookmarked: false
            });
        } else {
            // 북마크
            const { error: insertError } = await supabase
                .from('bookmarks')
                .insert({
                    user_id: user.id,
                    post_id: postId,
                    post_type: postType
                });

            if (insertError) {
                return NextResponse.json({ error: '북마크에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({
                message: '북마크되었습니다.',
                isBookmarked: true
            });
        }
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 북마크 상태 확인
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');
        const postType = searchParams.get('postType');

        if (!postId || !postType) {
            return NextResponse.json({ error: '게시물 ID와 타입이 필요합니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 북마크 상태 확인
        const { data: bookmark } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .eq('post_type', postType)
            .single();

        return NextResponse.json({
            isBookmarked: !!bookmark
        });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}





