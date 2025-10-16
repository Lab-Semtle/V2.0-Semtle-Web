import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 현재 사용자가 슈퍼 관리자인지 확인
        const { data: currentProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !currentProfile || currentProfile.role !== 'super_admin') {
            return NextResponse.json({ error: '슈퍼 관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const { action } = await request.json(); // 'grant' 또는 'revoke'

        if (!action || !['grant', 'revoke'].includes(action)) {
            return NextResponse.json({ error: '잘못된 액션입니다.' }, { status: 400 });
        }

        // 대상 사용자 정보 조회
        const { data: targetProfile, error: targetError } = await supabase
            .from('user_profiles')
            .select('role, nickname')
            .eq('id', params.id)
            .single();

        if (targetError || !targetProfile) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 본인에게는 권한 변경 불가
        if (params.id === user.id) {
            return NextResponse.json({ error: '본인의 권한은 변경할 수 없습니다.' }, { status: 400 });
        }

        const newRole = action === 'grant' ? 'super_admin' : 'admin';

        // 권한 업데이트
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ role: newRole })
            .eq('id', params.id);

        if (updateError) {
            return NextResponse.json({ error: '권한 변경에 실패했습니다.' }, { status: 500 });
        }

        const message = action === 'grant'
            ? `${targetProfile.nickname}님에게 슈퍼 관리자 권한을 부여했습니다.`
            : `${targetProfile.nickname}님의 슈퍼 관리자 권한을 해제했습니다.`;

        return NextResponse.json({
            message,
            newRole
        });

    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}