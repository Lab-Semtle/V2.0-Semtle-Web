import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabase();
    try {
        const resolvedParams = await params;
        const activityId = resolvedParams.id;

        // 사용자 확인 (보안상 getUser 사용)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json(
                { error: '인증되지 않은 요청입니다.' },
                { status: 401 }
            );
        }

        // 사용자 프로필 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
            return NextResponse.json(
                { error: '관리자 권한이 필요합니다.' },
                { status: 403 }
            );
        }

        // 활동 삭제
        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', activityId);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: '활동이 성공적으로 삭제되었습니다.'
        });

    } catch {
        return NextResponse.json(
            { error: '활동 삭제에 실패했습니다.' },
            { status: 500 }
        );
    }
}

