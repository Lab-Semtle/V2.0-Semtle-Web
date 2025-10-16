import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabase();

    try {
        const { status } = await request.json();
        const resolvedParams = await params;
        const inquiryId = resolvedParams.id;

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

        // 상태 유효성 검사
        const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: '유효하지 않은 상태입니다.' },
                { status: 400 }
            );
        }

        // 문의 상태 업데이트
        const updateData: Record<string, unknown> = {
            status,
            updated_at: new Date().toISOString()
        };

        // resolved 상태로 변경 시 resolved_at 설정
        if (status === 'resolved') {
            updateData.resolved_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('contact_inquiries')
            .update(updateData)
            .eq('id', inquiryId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: '문의 상태가 성공적으로 변경되었습니다.',
            inquiry: data
        });

    } catch {
        return NextResponse.json(
            { error: '문의 상태 변경에 실패했습니다.' },
            { status: 500 }
        );
    }
}
