import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: activityId } = await params;
        const { voteOption } = await request.json();
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
            .select('id, title, has_voting, vote_deadline, vote_options')
            .eq('id', activityId)
            .single();

        if (activityError || !activity) {
            return NextResponse.json(
                { error: '활동을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 투표 기능이 활성화되어 있는지 확인
        if (!activity.has_voting) {
            return NextResponse.json(
                { error: '이 활동은 투표 기능이 비활성화되어 있습니다.' },
                { status: 400 }
            );
        }

        // 투표 마감일 확인
        if (activity.vote_deadline) {
            const deadline = new Date(activity.vote_deadline);
            const now = new Date();
            if (now > deadline) {
                return NextResponse.json(
                    { error: '투표 마감일이 지났습니다.' },
                    { status: 400 }
                );
            }
        }

        // 투표 옵션이 유효한지 확인
        const voteOptions = activity.vote_options as Array<{ text: string }>;
        const isValidOption = voteOptions.some(option => option.text === voteOption);
        if (!isValidOption) {
            return NextResponse.json(
                { error: '유효하지 않은 투표 옵션입니다.' },
                { status: 400 }
            );
        }

        // 기존 투표 확인
        const { data: existingVote } = await supabase
            .from('activity_votes')
            .select('id')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .eq('vote_option', voteOption)
            .single();

        if (existingVote) {
            // 이미 같은 옵션에 투표했으면 투표 취소
            const { error: deleteError } = await supabase
                .from('activity_votes')
                .delete()
                .eq('activity_id', activityId)
                .eq('user_id', user.id)
                .eq('vote_option', voteOption);

            if (deleteError) {
                return NextResponse.json(
                    { error: '투표 취소 중 오류가 발생했습니다.' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                message: '투표가 취소되었습니다.',
                voted: false,
                voteOption: null
            });
        } else {
            // 다른 옵션에 투표했는지 확인
            const { data: otherVote } = await supabase
                .from('activity_votes')
                .select('id, vote_option')
                .eq('activity_id', activityId)
                .eq('user_id', user.id)
                .single();

            if (otherVote) {
                // 기존 투표를 삭제하고 새 투표 추가
                const { error: deleteError } = await supabase
                    .from('activity_votes')
                    .delete()
                    .eq('activity_id', activityId)
                    .eq('user_id', user.id);

                if (deleteError) {
                    return NextResponse.json(
                        { error: '투표 변경 중 오류가 발생했습니다.' },
                        { status: 500 }
                    );
                }
            }

            // 새 투표 추가
            const { error: insertError } = await supabase
                .from('activity_votes')
                .insert({
                    activity_id: activityId,
                    user_id: user.id,
                    vote_option: voteOption
                });

            if (insertError) {
                return NextResponse.json(
                    { error: '투표 중 오류가 발생했습니다.' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                message: '투표가 완료되었습니다.',
                voted: true,
                voteOption: voteOption
            });
        }

    } catch {
        return NextResponse.json(
            { error: '투표 처리 중 오류가 발생했습니다.' },
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

        // 사용자의 투표 상태 확인
        const { data: userVote } = await supabase
            .from('activity_votes')
            .select('vote_option')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

        // 투표 결과 조회
        const { data: voteResults, error: voteError } = await supabase
            .from('activity_votes')
            .select('vote_option')
            .eq('activity_id', activityId);

        if (voteError) {
            return NextResponse.json(
                { error: '투표 결과를 가져오는데 실패했습니다.' },
                { status: 500 }
            );
        }

        // 투표 결과 집계
        const voteCounts: { [key: string]: number } = {};
        voteResults?.forEach(vote => {
            voteCounts[vote.vote_option] = (voteCounts[vote.vote_option] || 0) + 1;
        });

        return NextResponse.json({
            userVote: userVote?.vote_option || null,
            voteResults: voteCounts,
            totalVotes: voteResults?.length || 0
        });

    } catch {
        return NextResponse.json(
            { error: '투표 상태 확인 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}