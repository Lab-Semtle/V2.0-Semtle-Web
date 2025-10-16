import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(
    _request: NextRequest,
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

        // 활동 작성자 또는 관리자인지 확인
        const { data: activity, error: activityError } = await supabase
            .from('activities')
            .select('id, author_id')
            .eq('id', activityId)
            .single();

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
            .single();

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

    } catch {
        return NextResponse.json(
            { error: '참가자 목록 조회 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
