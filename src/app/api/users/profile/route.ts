import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { UserProfileUpdate } from '@/types/user';

// 사용자 프로필 조회
export async function GET() {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 프로필 조회
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            return NextResponse.json({ error: '프로필을 불러올 수 없습니다.' }, { status: 500 });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 사용자 프로필 업데이트
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const updates: UserProfileUpdate = await request.json();

        // 닉네임 중복 확인 (닉네임이 변경되는 경우)
        if (updates.nickname) {
            const { data: existingUser } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('nickname', updates.nickname)
                .neq('id', user.id)
                .single();

            if (existingUser) {
                return NextResponse.json({ error: '이미 사용 중인 닉네임입니다.' }, { status: 400 });
            }
        }

        // 프로필 업데이트
        const { data: updatedProfile, error } = await supabase
            .from('user_profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: '프로필 업데이트에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ profile: updatedProfile });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
