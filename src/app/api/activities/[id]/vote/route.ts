import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const { voteOption } = await request.json();
        const supabase = await createServerSupabase();

        // activityId를 숫자로 변환
        const activityId = parseInt(idParam);
        if (isNaN(activityId)) {
            return NextResponse.json(
                { error: '유효하지 않은 활동 ID입니다.' },
                { status: 400 }
            );
        }

        // 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 활동 정보 조회 (새 스키마: activities 테이블에는 메타데이터만 있고, 내용은 activity_versions에 있음)
        const { data: activity, error: activityError } = await supabase
            .from('activities')
            .select('id, published_version_id')
            .eq('id', activityId)
            .maybeSingle();

        if (activityError) {
            console.error('활동 조회 오류:', activityError);
            return NextResponse.json(
                { error: '활동 조회 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        if (!activity) {
            console.error('활동을 찾을 수 없음:', { activityId, userId: user.id });
            return NextResponse.json(
                { error: '활동을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 출판된 버전 정보 조회 (투표 관련 정보는 버전에 있음)
        if (!activity.published_version_id) {
            return NextResponse.json(
                { error: '출판된 버전이 없습니다. 먼저 활동을 출판해주세요.' },
                { status: 400 }
            );
        }

        const { data: versionInfo, error: versionError } = await supabase
            .from('activity_versions')
            .select('id, has_voting, vote_deadline, vote_options')
            .eq('id', activity.published_version_id)
            .maybeSingle();

        if (versionError) {
            console.error('버전 조회 오류:', versionError);
            return NextResponse.json(
                { error: '버전 조회 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        if (!versionInfo) {
            console.error('버전을 찾을 수 없음:', { publishedVersionId: activity.published_version_id, activityId });
            return NextResponse.json(
                { error: '출판된 버전을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 투표 기능이 활성화되어 있는지 확인
        if (!versionInfo.has_voting) {
            return NextResponse.json(
                { error: '이 활동은 투표 기능이 비활성화되어 있습니다.' },
                { status: 400 }
            );
        }

        // 투표 마감일 확인
        if (versionInfo.vote_deadline) {
            const deadline = new Date(versionInfo.vote_deadline);
            const now = new Date();
            if (now > deadline) {
                return NextResponse.json(
                    { error: '투표 마감일이 지났습니다.' },
                    { status: 400 }
                );
            }
        }

        // 투표 옵션이 유효한지 확인
        const voteOptions = versionInfo.vote_options as Array<{ text: string }>;
        if (!voteOptions || !Array.isArray(voteOptions)) {
            return NextResponse.json(
                { error: '투표 옵션이 설정되지 않았습니다.' },
                { status: 400 }
            );
        }

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
        const { id: idParam } = await params;
        const supabase = await createServerSupabase();

        // activityId를 숫자로 변환
        const activityId = parseInt(idParam);
        if (isNaN(activityId)) {
            return NextResponse.json(
                { error: '유효하지 않은 활동 ID입니다.' },
                { status: 400 }
            );
        }

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