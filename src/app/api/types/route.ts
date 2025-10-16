import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 타입 데이터 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { searchParams } = new URL(request.url);
        const boardType = searchParams.get('board_type') || 'projects';

        let typesResult;

        if (boardType === 'projects') {
            // 프로젝트 타입 조회
            typesResult = await supabase
                .from('project_types')
                .select('*')
                .eq('is_active', true)
                .order('sort_order');
        } else if (boardType === 'activities') {
            // 활동 타입 조회
            typesResult = await supabase
                .from('activity_types')
                .select('*')
                .eq('is_active', true)
                .order('sort_order');
        } else if (boardType === 'resources') {
            // 자료실 타입 조회
            typesResult = await supabase
                .from('resource_types')
                .select('*')
                .eq('is_active', true)
                .order('sort_order');
        } else {
            return NextResponse.json({ error: '유효하지 않은 게시판 타입입니다.' }, { status: 400 });
        }

        if (typesResult.error) {
            return NextResponse.json({ error: '타입을 불러올 수 없습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            types: typesResult.data || []
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
