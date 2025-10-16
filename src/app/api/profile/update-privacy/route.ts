import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: NextRequest) {
    try {
        const { userId, privacy } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
        }

        if (!privacy) {
            return NextResponse.json({ error: '개인정보 설정이 필요합니다.' }, { status: 400 });
        }

        // 개인정보 설정 업데이트
        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                profile_public: privacy.profileVisibility === 'public',
                email_public: privacy.email_public,
                student_id_public: privacy.student_id_public,
                major_grade_public: privacy.major_grade_public,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select();

        if (error) {
            return NextResponse.json({ error: '개인정보 설정 업데이트에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            message: '개인정보 설정이 성공적으로 업데이트되었습니다.',
            data
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
