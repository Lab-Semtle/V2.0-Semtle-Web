import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 관리자용 사용자 목록 조회
export async function GET() {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        if (!isAdmin) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        // 사용자 목록 조회
        const { data: users, error: usersError } = await supabase
            .from('user_profiles')
            .select(`
                id,
                student_id,
                nickname,
                name,
                email,
                role,
                status,
                email_verified,
                created_at,
                last_login
            `)
            .order('created_at', { ascending: false });

        if (usersError) {
            return NextResponse.json({ error: '사용자 목록을 조회하는데 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            users: users || []
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 사용자 역할 변경
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        if (!isAdmin) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const { userId, newRole } = await request.json();

        if (!userId || !newRole) {
            return NextResponse.json({ error: '사용자 ID와 새 역할이 필요합니다.' }, { status: 400 });
        }

        // 사용자 역할 업데이트
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (updateError) {
            return NextResponse.json({ error: '사용자 역할을 변경하는데 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '사용자 역할이 성공적으로 변경되었습니다.' });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}