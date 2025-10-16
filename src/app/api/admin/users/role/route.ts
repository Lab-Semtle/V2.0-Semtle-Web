import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 사용자 역할 변경 (관리자 전용)
export async function PUT(request: NextRequest) {
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

        const { userId, newRole } = await request.json();

        if (!userId || !newRole) {
            return NextResponse.json({ error: '사용자 ID와 새로운 역할이 필요합니다.' }, { status: 400 });
        }

        // 유효한 역할인지 확인
        const validRoles = ['member', 'admin', 'super_admin'];
        if (!validRoles.includes(newRole)) {
            return NextResponse.json({ error: '유효하지 않은 역할입니다.' }, { status: 400 });
        }

        // 대상 사용자 확인
        const { data: targetUser } = await supabase
            .from('user_profiles')
            .select('id, role, email, name')
            .eq('id', userId)
            .single();

        if (!targetUser) {
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        // super_admin은 super_admin만 변경 가능
        if (targetUser.role === 'super_admin' && currentUser.role !== 'super_admin') {
            return NextResponse.json({ error: '최고 관리자 역할은 최고 관리자만 변경할 수 있습니다.' }, { status: 403 });
        }

        // 사용자 역할 업데이트
        const { data: updatedUser, error } = await supabase
            .from('user_profiles')
            .update({
                role: newRole,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: '사용자 역할 업데이트에 실패했습니다.' }, { status: 500 });
        }

        // 알림 생성
        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'admin_action',
                title: '계정 역할이 변경되었습니다',
                message: `귀하의 계정 역할이 ${getRoleDisplayName(newRole)}로 변경되었습니다.`,
                data: {
                    action: 'role_change',
                    old_role: targetUser.role,
                    new_role: newRole,
                    changed_by: user.id
                }
            });

        return NextResponse.json({
            success: true,
            message: '사용자 역할이 성공적으로 변경되었습니다.',
            data: {
                user: updatedUser,
                old_role: targetUser.role,
                new_role: newRole
            }
        });

    } catch {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 역할 표시명 반환
function getRoleDisplayName(role: string): string {
    switch (role) {
        case 'member': return '일반 회원';
        case 'admin': return '관리자';
        case 'super_admin': return '대표 관리자';
        default: return role;
    }
}

