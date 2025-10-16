import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabase();
    try {
        const { status } = await request.json();
        const resolvedParams = await params;
        const resourceId = resolvedParams.id;

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

        // 자료 상태 업데이트
        const { data, error: updateError } = await supabase
            .from('resources')
            .update({ status })
            .eq('id', resourceId)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            message: '자료 상태가 성공적으로 변경되었습니다.',
            resource: data
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '자료 상태 변경에 실패했습니다.';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

