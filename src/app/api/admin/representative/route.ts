import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createServerSupabase();

        // 대표 관리자 정보 조회 (컬럼이 없을 경우를 대비해 try-catch 사용)
        try {
            const { data: representative, error } = await supabase
                .from('user_profiles')
                .select('id, nickname, name, email, profile_image')
                .eq('is_representative_admin', true)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
                console.error('대표 관리자 조회 오류:', error);
                // 컬럼이 없는 경우 null 반환
                return NextResponse.json({ representative: null });
            }

            return NextResponse.json({ representative });
        } catch (columnError) {
            console.log('is_representative_admin 컬럼이 아직 추가되지 않음');
            return NextResponse.json({ representative: null });
        }

    } catch (error) {
        console.error('GET /api/admin/representative 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('=== POST /api/admin/representative 시작 ===');
        const supabase = await createServerSupabase();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.log('인증 오류:', authError);
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        console.log('인증된 사용자 ID:', user.id);

        // 현재 사용자가 관리자 권한이 있는지 확인
        const { data: currentProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log('현재 사용자 프로필:', currentProfile);
        console.log('프로필 오류:', profileError);

        if (profileError || !currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'super_admin')) {
            console.log('관리자 권한 없음');
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const { userId } = await request.json();
        console.log('요청된 userId:', userId);

        // 기존 대표 관리자 해제
        console.log('기존 대표 관리자 해제 시작');
        const { error: unsetError } = await supabase
            .from('user_profiles')
            .update({ is_representative_admin: false })
            .eq('is_representative_admin', true);

        console.log('기존 대표 관리자 해제 결과:', unsetError);

        if (unsetError) {
            console.log('기존 대표 관리자 해제 오류:', unsetError);
            return NextResponse.json({ error: '기존 대표 관리자 해제에 실패했습니다.' }, { status: 500 });
        }

        // userId가 null이거나 빈 문자열이면 대표 관리자 해제만 수행
        if (!userId) {
            console.log('대표 관리자 해제만 수행');
            return NextResponse.json({
                message: '대표 관리자가 해제되었습니다.'
            });
        }

        // 대상 사용자가 관리자 권한이 있는지 확인
        console.log('대상 사용자 확인 시작:', userId);
        const { data: targetProfile, error: targetError } = await supabase
            .from('user_profiles')
            .select('id, role, nickname, name, email')
            .eq('id', userId)
            .single();

        console.log('대상 사용자 프로필:', targetProfile);
        console.log('대상 사용자 오류:', targetError);

        if (targetError || !targetProfile) {
            console.log('대상 사용자 찾기 오류:', targetError);
            return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (targetProfile.role !== 'admin' && targetProfile.role !== 'super_admin') {
            console.log('대상 사용자 권한 부족:', targetProfile.role);
            return NextResponse.json({ error: '관리자 권한이 있는 사용자만 대표 관리자로 설정할 수 있습니다.' }, { status: 400 });
        }

        // 새로운 대표 관리자 설정
        console.log('새로운 대표 관리자 설정 시작 - userId:', userId);
        const { error: setError } = await supabase
            .from('user_profiles')
            .update({ is_representative_admin: true })
            .eq('id', userId);

        console.log('새로운 대표 관리자 설정 결과:', setError);

        if (setError) {
            console.log('새로운 대표 관리자 설정 오류:', setError);
            return NextResponse.json({ error: '대표 관리자 설정에 실패했습니다.' }, { status: 500 });
        }

        // 실제로 업데이트되었는지 확인
        console.log('업데이트 확인 시작');
        const { data: updatedUser, error: verifyError } = await supabase
            .from('user_profiles')
            .select('id, nickname, is_representative_admin')
            .eq('id', userId)
            .single();

        console.log('업데이트 확인 결과:', updatedUser);
        console.log('업데이트 확인 오류:', verifyError);

        if (verifyError || !updatedUser) {
            console.log('업데이트 확인 실패');
            return NextResponse.json({ error: '업데이트 확인에 실패했습니다.' }, { status: 500 });
        }

        if (!updatedUser.is_representative_admin) {
            console.log('업데이트가 실제로 반영되지 않음!');
            return NextResponse.json({ error: '데이터베이스 업데이트가 반영되지 않았습니다.' }, { status: 500 });
        }

        console.log('업데이트 성공 확인됨!');

        console.log('=== POST /api/admin/representative 성공 완료 ===');

        return NextResponse.json({
            message: `${targetProfile.nickname}님을 표시 관리자로 설정했습니다.`,
            representative: {
                id: targetProfile.id,
                nickname: targetProfile.nickname,
                name: targetProfile.name,
                email: targetProfile.email
            }
        });

    } catch (error) {
        console.log('POST /api/admin/representative 전체 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}