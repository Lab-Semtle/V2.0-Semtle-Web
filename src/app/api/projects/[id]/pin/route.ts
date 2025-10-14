import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 프로젝트 고정/해제
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log('프로젝트 고정 API 시작');
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const projectId = resolvedParams.id;

        // 현재 사용자 확인
        console.log('프로젝트 고정 API - 사용자 확인 시작');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('프로젝트 고정 API - 사용자 결과:', { user: !!user, authError });

        if (authError || !user) {
            console.log('프로젝트 고정 API - 인증 실패:', authError);
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        console.log('프로젝트 고정 API - 권한 확인 시작:', user.id);
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log('프로젝트 고정 API - 프로필 결과:', { userProfile, profileError });

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        if (!isAdmin) {
            console.log('프로젝트 고정 API - 관리자 권한 없음:', userProfile?.role);
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const { is_pinned } = await request.json();

        if (typeof is_pinned !== 'boolean') {
            return NextResponse.json({ error: 'is_pinned 값이 필요합니다.' }, { status: 400 });
        }

        console.log('프로젝트 고정 API - 프로젝트 고정 상태 변경 시작:', { projectId, is_pinned });

        // 프로젝트 고정 상태 업데이트
        const { error: updateError } = await supabase
            .from('projects')
            .update({ is_pinned })
            .eq('id', projectId);

        console.log('프로젝트 고정 API - 업데이트 결과:', { updateError });

        if (updateError) {
            console.error('프로젝트 고정 상태 업데이트 오류:', updateError);
            return NextResponse.json({ error: '프로젝트 고정 상태를 변경하는데 실패했습니다.' }, { status: 500 });
        }

        const message = is_pinned ? '프로젝트가 고정되었습니다.' : '프로젝트 고정이 해제되었습니다.';
        console.log('프로젝트 고정 API - 성공:', message);

        return NextResponse.json({ message });

    } catch (error) {
        console.error('프로젝트 고정 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}