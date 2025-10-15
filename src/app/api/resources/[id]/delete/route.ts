import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const supabase = await createServerSupabase();
    try {
        const resourceId = await Promise.resolve(params.id);

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

        // 자료 삭제
        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', resourceId);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: '자료가 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        console.error('자료 삭제 오류:', error);
        return NextResponse.json(
            { error: '자료 삭제에 실패했습니다.' },
            { status: 500 }
        );
    }
}

