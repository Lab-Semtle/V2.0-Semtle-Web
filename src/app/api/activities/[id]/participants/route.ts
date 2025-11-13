import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(
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

        // 활동 정보 조회 (새 스키마: activities 테이블에는 메타데이터만 있음)
        const { data: activity, error: activityError } = await supabase
            .from('activities')
            .select('id, author_id, published_version_id')
            .eq('id', activityId)
            .maybeSingle();

        if (activityError) {
            console.error('활동 조회 오류:', { activityId, error: activityError, userId: user.id });
            return NextResponse.json(
                { error: '활동 조회 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        if (!activity) {
            console.error('활동을 찾을 수 없음:', { activityId, activityIdType: typeof activityId, userId: user.id });
            return NextResponse.json(
                { error: '활동을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 활동 버전에서 max_participants 조회 (새 스키마: published_version_id 사용)
        let maxParticipants: number | null = null;

        if (activity.published_version_id) {
            const { data: activityVersion } = await supabase
                .from('activity_versions')
                .select('max_participants')
                .eq('id', activity.published_version_id)
                .maybeSingle();

            maxParticipants = activityVersion?.max_participants || null;
        }

        // 현재 참가자 수 집계
        const { count: currentParticipantsCount } = await supabase
            .from('activity_participants')
            .select('*', { count: 'exact', head: true })
            .eq('activity_id', activityId)
            .eq('status', 'registered');

        const currentParticipants = currentParticipantsCount || 0;

        // 이미 참가했는지 확인
        const { data: existingParticipant } = await supabase
            .from('activity_participants')
            .select('id')
            .eq('activity_id', activityId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (existingParticipant) {
            // 참가 취소
            const { error: deleteError } = await supabase
                .from('activity_participants')
                .delete()
                .eq('activity_id', activityId)
                .eq('user_id', user.id);

            if (deleteError) {
                console.error('참가 취소 오류:', {
                    activityId,
                    userId: user.id,
                    error: deleteError,
                    errorCode: deleteError.code,
                    errorMessage: deleteError.message
                });
                return NextResponse.json(
                    { error: '참가 취소 중 오류가 발생했습니다.', details: deleteError.message },
                    { status: 500 }
                );
            }

            // 취소 후 참가자 수 재집계
            const { count: newCount } = await supabase
                .from('activity_participants')
                .select('*', { count: 'exact', head: true })
                .eq('activity_id', activityId)
                .eq('status', 'registered');

            return NextResponse.json({
                message: '참가가 취소되었습니다.',
                participated: false,
                current_participants: newCount || 0
            });
        } else {
            // 최대 참가자 수 확인
            if (maxParticipants && currentParticipants >= maxParticipants) {
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
                console.error('참가 등록 오류:', {
                    activityId,
                    userId: user.id,
                    error: insertError,
                    errorCode: insertError.code,
                    errorMessage: insertError.message
                });
                return NextResponse.json(
                    { error: '참가 등록 중 오류가 발생했습니다.', details: insertError.message },
                    { status: 500 }
                );
            }

            // 등록 후 참가자 수 재집계
            const { count: newCount } = await supabase
                .from('activity_participants')
                .select('*', { count: 'exact', head: true })
                .eq('activity_id', activityId)
                .eq('status', 'registered');

            // 활동 작성자에게 알림 (선택사항)
            if (activity.author_id !== user.id) {
                // TODO: 알림 시스템 구현
            }

            return NextResponse.json({
                message: '참가가 완료되었습니다.',
                participated: true,
                current_participants: newCount || 0
            });
        }

    } catch (error) {
        console.error('참가 처리 중 오류:', error);
        console.error('참가 처리 오류 상세:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            error
        });
        return NextResponse.json(
            {
                error: '참가 처리 중 오류가 발생했습니다.',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
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

        // 쿼리 파라미터로 참가 상태 확인인지 참가자 목록 조회인지 구분
        // 기본값: 참가자 목록 조회 (기존 동작 유지)
        // ?status=true: 참가 상태 확인 (새로운 기능)
        const url = new URL(request.url);
        const statusOnly = url.searchParams.get('status') === 'true';

        if (statusOnly) {
            // 참가 상태 확인 (일반 사용자)
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
        } else {
            // 참가자 목록 조회 (작성자/관리자 전용)
            const { data: activity, error: activityError } = await supabase
                .from('activities')
                .select('id, author_id')
                .eq('id', activityId)
                .maybeSingle();

            if (activityError || !activity) {
                return NextResponse.json(
                    { error: '활동을 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }

            // 관리자 권한 확인 (작성자이거나 관리자)
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_admin')
                .eq('user_id', user.id)
                .maybeSingle();

            const isAdmin = profile?.is_admin || false;
            const isAuthor = activity.author_id === user.id;

            if (!isAdmin && !isAuthor) {
                return NextResponse.json(
                    { error: '권한이 없습니다.' },
                    { status: 403 }
                );
            }

            // 참가자 목록 조회
            const { data: participants, error: participantsError } = await supabase
                .from('activity_participants')
                .select(`
                    id,
                    user_id,
                    status,
                    joined_at,
                    notes
                `)
                .eq('activity_id', activityId)
                .order('joined_at', { ascending: false });

            if (participantsError) {
                return NextResponse.json(
                    { error: '참가자 목록을 가져오는데 실패했습니다.' },
                    { status: 500 }
                );
            }

            // 참가자별로 사용자 프로필 정보를 별도로 조회
            const participantsWithProfiles = await Promise.all(
                (participants || []).map(async (participant) => {
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('id, nickname, name, profile_image, student_id, major, grade')
                        .eq('id', participant.user_id)
                        .maybeSingle();

                    return {
                        ...participant,
                        user_profiles: profile || null
                    };
                })
            );

            return NextResponse.json({
                participants: participantsWithProfiles || []
            });
        }

    } catch (error) {
        console.error('참가 상태 확인 중 오류:', error);
        return NextResponse.json(
            { error: '참가 상태 확인 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
