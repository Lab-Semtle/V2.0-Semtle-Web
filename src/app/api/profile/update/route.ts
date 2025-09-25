import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 프로필 정보 업데이트
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { name, nickname, bio, profile_image } = await request.json();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 프로필 업데이트
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                name,
                nickname,
                bio,
                profile_image,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('프로필 업데이트 오류:', updateError);
            return NextResponse.json({ error: '프로필 업데이트에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '프로필이 업데이트되었습니다.' });
    } catch (error) {
        console.error('프로필 업데이트 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
