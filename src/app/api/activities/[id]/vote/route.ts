import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ActivityVoteData } from '@/types/activity';

// 활동 투표
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

        const voteData: ActivityVoteData = await request.json();
        const { vote_option } = voteData;

        if (!vote_option) {
            return NextResponse.json({ error: '투표 옵션을 선택해주세요.' }, { status: 400 });
        }

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

        // 투표 가능한 활동인지 확인
        if (!activity.has_voting || !activity.vote_options || activity.vote_options.length === 0) {
            return NextResponse.json({ error: '투표가 가능한 활동이 아닙니다.' }, { status: 400 });
        }

        // 투표 마감일 확인
        if (activity.vote_deadline && new Date(activity.vote_deadline) < new Date()) {
            return NextResponse.json({ error: '투표가 마감되었습니다.' }, { status: 400 });
        }

        // 투표 옵션 유효성 확인
        const validOptions = activity.vote_options.map((option: unknown) =>
            typeof option === 'object' && option !== null && 'text' in option
                ? (option as { text: string }).text
                : String(option)
        );
        if (!validOptions.includes(vote_option)) {
            return NextResponse.json({ error: '유효하지 않은 투표 옵션입니다.' }, { status: 400 });
        }

        // 기존 투표 확인
        const { data: existingVote } = await supabase
            .from('activity_votes')
            .select('id, vote_option')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .single();

        if (existingVote) {
            // 이미 투표한 경우
            if (existingVote.vote_option === vote_option) {
                return NextResponse.json({ error: '이미 같은 옵션에 투표했습니다.' }, { status: 400 });
            }

            // 다른 옵션으로 변경
            if (!activity.allow_multiple_votes) {
                // 단일 투표만 허용하는 경우 기존 투표 삭제 후 새 투표
                const { error: deleteError } = await supabase
                    .from('activity_votes')
                    .delete()
                    .eq('activity_id', activityId)
                    .eq('user_id', user.id);

                if (deleteError) {
                    console.error('기존 투표 삭제 오류:', deleteError);
                    return NextResponse.json({ error: '투표 변경에 실패했습니다.' }, { status: 500 });
                }
            }
        }

        // 새 투표 추가
        const { error: insertError } = await supabase
            .from('activity_votes')
            .insert({
                activity_id: activityId,
                user_id: user.id,
                vote_option
            });

        if (insertError) {
            console.error('투표 추가 오류:', insertError);
            return NextResponse.json({ error: '투표에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            voted: true,
            message: '투표가 완료되었습니다.',
            vote_option
        });
    } catch (error) {
        console.error('투표 처리 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 투표 결과 조회
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

        // 활동 정보 확인
        const { data: activity } = await supabase
            .from('activity_posts')
            .select('*')
            .eq('post_id', activityId)
            .single();

        if (!activity || !activity.has_voting) {
            return NextResponse.json({ error: '투표 활동이 아닙니다.' }, { status: 404 });
        }

        // 투표 결과 조회
        const { data: votes } = await supabase
            .from('activity_votes')
            .select('vote_option')
            .eq('activity_id', activityId);

        // 투표 집계
        const voteCounts: Record<string, number> = {};
        (votes || []).forEach(vote => {
            voteCounts[vote.vote_option] = (voteCounts[vote.vote_option] || 0) + 1;
        });

        // 투표 옵션별 결과 생성
        const voteResults = (activity.vote_options || []).map((option: unknown) => {
            const optionText = typeof option === 'object' && option !== null && 'text' in option
                ? (option as { text: string }).text
                : String(option);
            return {
                option: optionText,
                votes: voteCounts[optionText] || 0
            };
        });

        const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

        return NextResponse.json({
            vote_results: voteResults,
            total_votes: totalVotes,
            vote_deadline: activity.vote_deadline,
            allow_multiple_votes: activity.allow_multiple_votes
        });
    } catch (error) {
        console.error('투표 결과 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
