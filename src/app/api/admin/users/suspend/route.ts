import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 사용자 정지/해제
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        const { data: currentUser } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role)) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const { userId, action, reason, suspendedUntil } = await request.json();

        if (!userId || !action) {
            return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
        }

        // 대상 사용자 확인
        const { data: targetUser } = await supabase
            .from('user_profiles')
            .select('id, role, status')
            .eq('id', userId)
            .single();

        if (!targetUser) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        // super_admin은 정지할 수 없음
        if (targetUser.role === 'super_admin') {
            return NextResponse.json({ error: '최고 관리자는 정지할 수 없습니다.' }, { status: 403 });
        }

        let updateData: Record<string, unknown> = {};

        if (action === 'suspend') {
            updateData = {
                status: 'suspended',
                suspended_until: suspendedUntil || null,
                suspension_reason: reason || '관리자에 의한 정지'
            };
        } else if (action === 'unsuspend') {
            updateData = {
                status: 'active',
                suspended_until: null,
                suspension_reason: null
            };
        } else if (action === 'ban') {
            updateData = {
                status: 'banned',
                suspended_until: null,
                suspension_reason: reason || '관리자에 의한 영구 정지'
            };
        } else {
            return NextResponse.json({ error: '잘못된 액션입니다.' }, { status: 400 });
        }

        // 사용자 상태 업데이트
        const { data: updatedUser, error } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: '사용자 상태 업데이트에 실패했습니다.' }, { status: 500 });
        }

        // 알림 생성
        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'admin_action',
                title: action === 'suspend' ? '계정이 정지되었습니다' :
                    action === 'unsuspend' ? '계정 정지가 해제되었습니다' : '계정이 영구 정지되었습니다',
                message: updateData.suspension_reason || '관리자에 의한 조치',
                data: {
                    action,
                    reason: updateData.suspension_reason,
                    suspended_until: updateData.suspended_until
                }
            });

        return NextResponse.json({
            message: '사용자 상태가 성공적으로 업데이트되었습니다.',
            user: updatedUser
        });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
