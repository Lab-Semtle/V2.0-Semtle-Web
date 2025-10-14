import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        // 대표관리자 정보 조회 (super_admin 중 첫 번째)
        const { data: representativeAdmin, error } = await supabase
            .from('user_profiles')
            .select('id, name, nickname, email, role')
            .eq('role', 'super_admin')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (error) {
            return NextResponse.json(
                { error: '대표관리자 정보를 불러올 수 없습니다.' },
                { status: 500 }
            );
        }

        if (!representativeAdmin) {
            return NextResponse.json(
                { error: '대표관리자(super_admin)가 설정되지 않았습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            representativeAdmin: {
                id: representativeAdmin.id,
                name: representativeAdmin.name,
                nickname: representativeAdmin.nickname,
                email: representativeAdmin.email,
                role: representativeAdmin.role
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
