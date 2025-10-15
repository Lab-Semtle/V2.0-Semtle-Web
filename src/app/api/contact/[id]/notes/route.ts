import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const supabase = await createServerSupabase();

    try {
        const { notes } = await request.json();
        const inquiryId = await Promise.resolve(params.id);

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

        // 노트 업데이트
        const { data, error } = await supabase
            .from('contact_inquiries')
            .update({
                admin_notes: notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', inquiryId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: '관리자 노트가 성공적으로 저장되었습니다.',
            inquiry: data
        });

    } catch (error) {
        console.error('관리자 노트 저장 오류:', error);
        return NextResponse.json(
            { error: '관리자 노트 저장에 실패했습니다.' },
            { status: 500 }
        );
    }
}
