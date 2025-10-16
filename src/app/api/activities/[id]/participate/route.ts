import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: activityId } = await params;
        const supabase = await createServerSupabase();

        // 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 활동 정보 조회
        const { data: activity, error: activityError } = await supabase
            .from('activities')
            .select('id, title, max_participants, current_participants, author_id')
            .eq('id', activityId)
            .single();

        if (activityError || !activity) {
            return NextResponse.json(
                { error: '활동을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 이미 참가했는지 확인
        const { data: existingParticipant } = await supabase
            .from('activity_participants')
            .select('id')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

        if (existingParticipant) {
            // 참가 취소
            const { error: deleteError } = await supabase
                .from('activity_participants')
                .delete()
                .eq('activity_id', activityId)
                .eq('user_id', user.id);

            if (deleteError) {
                return NextResponse.json(
                    { error: '참가 취소 중 오류가 발생했습니다.' },
                    { status: 500 }
                );
            }

            // current_participants 감소
            await supabase
                .from('activities')
                .update({
                    current_participants: Math.max(0, (activity.current_participants || 0) - 1)
                })
                .eq('id', activityId);


            return NextResponse.json({
                message: '참가가 취소되었습니다.',
                participated: false,
                current_participants: Math.max(0, (activity.current_participants || 0) - 1)
            });
        } else {
            // 최대 참가자 수 확인
            if (activity.max_participants && (activity.current_participants || 0) >= activity.max_participants) {
                return NextResponse.json(
                    { error: '참가자 수가 가득 찼습니다.' },
                    { status: 400 }
                );
            }

            // 참가 등록
            const { error: insertError } = await supabase
                .from('activity_participants')
                .insert({
                    activity_id: activityId,
                    user_id: user.id,
                    status: 'registered'
                });

            if (insertError) {
                return NextResponse.json(
                    { error: '참가 등록 중 오류가 발생했습니다.' },
                    { status: 500 }
                );
            }

            // current_participants 증가
            await supabase
                .from('activities')
                .update({
                    current_participants: (activity.current_participants || 0) + 1
                })
                .eq('id', activityId);

            // 활동 작성자에게 알림 (선택사항)
            if (activity.author_id !== user.id) {
                // TODO: 알림 시스템 구현
            }

            return NextResponse.json({
                message: '참가가 완료되었습니다.',
                participated: true,
                current_participants: (activity.current_participants || 0) + 1
            });
        }

    } catch {
        return NextResponse.json(
            { error: '참가 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: activityId } = await params;
        const supabase = await createServerSupabase();

        // 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 참가 상태 확인
        const { data: participant, error: participantError } = await supabase
            .from('activity_participants')
            .select('id, status, joined_at')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .maybeSingle();

        // 참가자가 없어도 오류가 아님
        if (participantError) {
            return NextResponse.json(
                { error: '참가 상태 확인 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            participated: !!participant,
            status: participant?.status || null,
            joined_at: participant?.joined_at || null
        });

    } catch {
        return NextResponse.json(
            { error: '참가 상태 확인 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}