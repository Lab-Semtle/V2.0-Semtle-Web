import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ActivityParticipationData } from '@/types/activity';

// 활동 참가/취소
export async function POST(
    request: NextRequest,
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

        const participationData: ActivityParticipationData = await request.json();
        const { notes } = participationData;

        // 활동 정보 확인
        const { data: activity } = await supabase
            .from('activity_posts')
            .select(`
        *,
        post:posts!activity_posts_post_id_fkey(
          id,
          title,
          status
        )
      `)
            .eq('post_id', activityId)
            .single();

        if (!activity || activity.post.status !== 'published') {
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 기존 참가 확인
        const { data: existingParticipation } = await supabase
            .from('activity_participants')
            .select('id, status')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

        if (existingParticipation) {
            // 이미 참가한 경우 취소
            const { error: deleteError } = await supabase
                .from('activity_participants')
                .delete()
                .eq('activity_id', activityId)
                .eq('user_id', user.id);

            if (deleteError) {
                return NextResponse.json({ error: '활동 참가 취소에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({
                participating: false,
                message: '활동 참가가 취소되었습니다.'
            });
        } else {
            // 최대 참가자 수 확인
            if (activity.max_participants && activity.current_participants >= activity.max_participants) {
                return NextResponse.json({ error: '참가자 수가 가득 찼습니다.' }, { status: 400 });
            }

            // 활동 참가
            const { error: insertError } = await supabase
                .from('activity_participants')
                .insert({
                    activity_id: activityId,
                    user_id: user.id,
                    notes: notes || null
                });

            if (insertError) {
                return NextResponse.json({ error: '활동 참가에 실패했습니다.' }, { status: 500 });
            }

            // 알림 생성 (활동 작성자에게)
            if (activity.post.author_id !== user.id) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: activity.post.author_id,
                        type: 'activity_participation',
                        title: '새로운 활동 참가자',
                        message: `"${activity.post.title}" 활동에 새로운 참가자가 등록했습니다.`,
                        data: {
                            activity_id: activityId,
                            participant_id: user.id
                        }
                    });
            }

            return NextResponse.json({
                participating: true,
                message: '활동에 성공적으로 참가했습니다.'
            });
        }
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 활동 참가 상태 확인
export async function GET(
    request: NextRequest,
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
            return NextResponse.json({ participating: false });
        }

        // 참가 상태 확인
        const { data: participation } = await supabase
            .from('activity_participants')
            .select('id, status')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

        return NextResponse.json({
            participating: !!participation,
            status: participation?.status || null
        });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
