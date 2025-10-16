import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 활동 게시물 좋아요 토글
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const activityId = parseInt(resolvedParams.id);

        if (isNaN(activityId)) {
            return NextResponse.json({ error: '잘못된 활동 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 기존 좋아요 확인
        const { data: existingLike } = await supabase
            .from('activity_likes')
            .select('id')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

        if (existingLike) {
            // 좋아요 취소
            const { error: deleteError } = await supabase
                .from('activity_likes')
                .delete()
                .eq('activity_id', activityId)
                .eq('user_id', user.id);

            if (deleteError) {
                return NextResponse.json({ error: '좋아요 취소에 실패했습니다.' }, { status: 500 });
            }

            // 실제 DB에서 좋아요 수를 계산해서 가져오기
            const { data: likeCountData } = await supabase
                .from('activity_likes')
                .select('id', { count: 'exact' })
                .eq('activity_id', activityId);

            const actualLikesCount = likeCountData?.length || 0;

            // activities 테이블의 likes_count를 실제 값으로 업데이트
            await supabase
                .from('activities')
                .update({
                    likes_count: actualLikesCount
                })
                .eq('id', activityId);


            return NextResponse.json({
                liked: false,
                likes_count: actualLikesCount,
                message: '좋아요가 취소되었습니다.'
            });
        } else {
            // 좋아요 추가
            const { error: insertError } = await supabase
                .from('activity_likes')
                .insert({
                    activity_id: activityId,
                    user_id: user.id
                });

            if (insertError) {
                return NextResponse.json({ error: '좋아요 추가에 실패했습니다.' }, { status: 500 });
            }


            // 실제 DB에서 좋아요 수를 계산해서 가져오기
            const { data: likeCountData } = await supabase
                .from('activity_likes')
                .select('id', { count: 'exact' })
                .eq('activity_id', activityId);

            const actualLikesCount = likeCountData?.length || 0;

            // activities 테이블의 likes_count를 실제 값으로 업데이트
            await supabase
                .from('activities')
                .update({
                    likes_count: actualLikesCount
                })
                .eq('id', activityId);

            // 알림 생성 (작성자에게)
            const { data: activityData } = await supabase
                .from('activities')
                .select('author_id, title')
                .eq('id', activityId)
                .single();

            if (activityData && activityData.author_id !== user.id) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: activityData.author_id,
                        type: 'like',
                        title: '새로운 좋아요',
                        message: `"${activityData.title}" 활동에 좋아요를 받았습니다.`,
                        data: {
                            activity_id: activityId,
                            liker_id: user.id
                        }
                    });
            }

            return NextResponse.json({
                liked: true,
                likes_count: actualLikesCount,
                message: '좋아요가 추가되었습니다.'
            });
        }
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 활동 게시물 좋아요 상태 확인
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const activityId = parseInt(resolvedParams.id);

        if (isNaN(activityId)) {
            return NextResponse.json({ error: '잘못된 활동 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ liked: false });
        }

        // 좋아요 상태 확인
        const { data: like } = await supabase
            .from('activity_likes')
            .select('id')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

        return NextResponse.json({ liked: !!like });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}