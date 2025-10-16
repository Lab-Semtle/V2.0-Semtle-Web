import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabase();

    try {
        const { role } = await request.json();
        const resolvedParams = await params;
        const userId = resolvedParams.id;

        // 사용자 확인 (보안상 getUser 사용)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json(
                { error: '인증되지 않은 요청입니다.' },
                { status: 401 }
            );
        }

        // 슈퍼 관리자 권한 확인
        const { data: adminProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return NextResponse.json(
                { error: '슈퍼 관리자 권한이 필요합니다.' },
                { status: 403 }
            );
        }

        // 사용자 권한 업데이트
        const { data, error } = await supabase
            .from('user_profiles')
            .update({ role })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: '사용자 권한이 성공적으로 변경되었습니다.',
            user: data
        });

    } catch (error) {
        console.error('사용자 권한 변경 오류:', error);
        return NextResponse.json(
            { error: '사용자 권한 변경에 실패했습니다.' },
            { status: 500 }
        );
    }
}
