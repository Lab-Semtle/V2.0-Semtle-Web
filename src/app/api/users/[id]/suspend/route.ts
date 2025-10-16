import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabase();

    try {
        const { suspendUntil } = await request.json();
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

        // 관리자 권한 확인
        const { data: adminProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!adminProfile || !['admin', 'super_admin'].includes(adminProfile.role)) {
            return NextResponse.json(
                { error: '관리자 권한이 필요합니다.' },
                { status: 403 }
            );
        }

        // 사용자 정지 처리
        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                status: 'suspended',
                suspended_until: suspendUntil,
                suspended_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: '사용자가 성공적으로 정지되었습니다.',
            user: data
        });

    } catch (error) {
        console.error('사용자 정지 오류:', error);
        return NextResponse.json(
            { error: '사용자 정지 처리에 실패했습니다.' },
            { status: 500 }
        );
    }
}
