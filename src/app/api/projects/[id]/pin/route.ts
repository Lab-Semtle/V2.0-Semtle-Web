import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 프로젝트 고정/해제
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const projectId = resolvedParams.id;

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();


        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        if (!isAdmin) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const { is_pinned } = await request.json();

        if (typeof is_pinned !== 'boolean') {
            return NextResponse.json({ error: 'is_pinned 값이 필요합니다.' }, { status: 400 });
        }


        // 프로젝트 고정 상태 업데이트
        const { error: updateError } = await supabase
            .from('projects')
            .update({ is_pinned })
            .eq('id', projectId);


        if (updateError) {
            return NextResponse.json({ error: '프로젝트 고정 상태를 변경하는데 실패했습니다.' }, { status: 500 });
        }

        const message = is_pinned ? '프로젝트가 고정되었습니다.' : '프로젝트 고정이 해제되었습니다.';
        return NextResponse.json({ message });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}