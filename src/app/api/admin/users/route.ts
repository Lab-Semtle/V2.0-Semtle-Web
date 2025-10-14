import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 관리자용 사용자 목록 조회
export async function GET(request: NextRequest) {
    try {
        console.log('관리자 사용자 API 시작');
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        console.log('관리자 사용자 API - 사용자 확인 시작');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('관리자 사용자 API - 사용자 결과:', { user: !!user, authError });

        if (authError || !user) {
            console.log('관리자 사용자 API - 인증 실패:', authError);
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        console.log('관리자 사용자 API - 권한 확인 시작:', user.id);
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log('관리자 사용자 API - 프로필 결과:', { userProfile, profileError });

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        if (!isAdmin) {
            console.log('관리자 사용자 API - 관리자 권한 없음:', userProfile?.role);
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        console.log('관리자 사용자 API - 사용자 목록 조회 시작');

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

        console.log('관리자 사용자 API - 사용자 목록 조회 결과:', {
            usersCount: users?.length || 0,
            usersError,
            sampleUser: users?.[0] ? {
                id: users[0].id,
                nickname: users[0].nickname,
                role: users[0].role
            } : null
        });

        if (usersError) {
            console.error('사용자 목록 조회 오류:', usersError);
            return NextResponse.json({ error: '사용자 목록을 조회하는데 실패했습니다.' }, { status: 500 });
        }

        console.log('관리자 사용자 API - 최종 결과:', {
            totalUsers: users?.length || 0,
            users: users?.map(u => ({ id: u.id, nickname: u.nickname, role: u.role })) || []
        });

        return NextResponse.json({
            users: users || []
        });

    } catch (error) {
        console.error('관리자 사용자 조회 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 사용자 역할 변경
export async function PATCH(request: NextRequest) {
    try {
        console.log('관리자 사용자 역할 변경 API 시작');
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
            console.error('사용자 역할 업데이트 오류:', updateError);
            return NextResponse.json({ error: '사용자 역할을 변경하는데 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '사용자 역할이 성공적으로 변경되었습니다.' });

    } catch (error) {
        console.error('관리자 사용자 역할 변경 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}