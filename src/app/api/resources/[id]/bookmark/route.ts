import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 자료 북마크 토글
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

        // 기존 북마크 확인
        const { data: existingBookmark, error: checkError } = await supabase
            .from('resource_bookmarks')
            .select('id')
            .eq('resource_id', resourceId)
            .eq('user_id', user.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('북마크 확인 오류:', checkError);
            return NextResponse.json({ error: '북마크 상태를 확인할 수 없습니다.' }, { status: 500 });
        }

        let isBookmarked = false;
        let bookmarksCount = 0;

        if (existingBookmark) {
            // 북마크 취소
            const { error: deleteError } = await supabase
                .from('resource_bookmarks')
                .delete()
                .eq('resource_id', resourceId)
                .eq('user_id', user.id);

            if (deleteError) {
                console.error('북마크 취소 오류:', deleteError);
                return NextResponse.json({ error: '북마크 취소에 실패했습니다.' }, { status: 500 });
            }

            isBookmarked = false;
        } else {
            // 북마크 추가
            const { error: insertError } = await supabase
                .from('resource_bookmarks')
                .insert({
                    resource_id: resourceId,
                    user_id: user.id
                });

            if (insertError) {
                console.error('북마크 추가 오류:', insertError);
                return NextResponse.json({ error: '북마크 추가에 실패했습니다.' }, { status: 500 });
            }

            isBookmarked = true;
        }

        // 실제 북마크 수 계산
        const { data: bookmarkCountData } = await supabase
            .from('resource_bookmarks')
            .select('id', { count: 'exact' })
            .eq('resource_id', resourceId);

        bookmarksCount = bookmarkCountData?.length || 0;

        // resources 테이블의 bookmarks_count 업데이트
        await supabase
            .from('resources')
            .update({ bookmarks_count: bookmarksCount })
            .eq('id', resourceId);

        return NextResponse.json({
            success: true,
            isBookmarked,
            bookmarksCount
        });

    } catch (error) {
        console.error('자료 북마크 처리 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 자료 북마크 상태 확인
export async function GET(
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

        // 북마크 상태 확인
        const { data: existingBookmark, error: checkError } = await supabase
            .from('resource_bookmarks')
            .select('id')
            .eq('resource_id', resourceId)
            .eq('user_id', user.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('북마크 상태 확인 오류:', checkError);
            return NextResponse.json({ error: '북마크 상태를 확인할 수 없습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            isBookmarked: !!existingBookmark
        });

    } catch (error) {
        console.error('자료 북마크 상태 확인 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
