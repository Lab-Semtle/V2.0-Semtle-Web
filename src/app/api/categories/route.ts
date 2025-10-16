import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 카테고리 및 타입 데이터 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { searchParams } = new URL(request.url);
        const boardType = searchParams.get('board_type') || 'projects';

        let categoriesResult, typesResult;

        if (boardType === 'projects') {
            // 프로젝트 카테고리와 타입 조회
            [categoriesResult, typesResult] = await Promise.all([
                supabase
                    .from('project_categories')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order'),
                supabase
                    .from('project_types')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order')
            ]);
        } else if (boardType === 'activities') {
            // 활동 카테고리와 타입 조회
            [categoriesResult, typesResult] = await Promise.all([
                supabase
                    .from('activity_categories')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order'),
                supabase
                    .from('activity_types')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order')
            ]);
        } else if (boardType === 'resources') {
            // 자료실은 카테고리만 조회 (타입 없음)
            categoriesResult = await supabase
                .from('resource_categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order');

            // 자료실은 타입이 없으므로 빈 배열로 설정
            typesResult = { data: [], error: null };
        } else {
            return NextResponse.json({ error: '유효하지 않은 게시판 타입입니다.' }, { status: 400 });
        }

        if (categoriesResult.error) {
            return NextResponse.json({ error: '카테고리를 불러올 수 없습니다.' }, { status: 500 });
        }

        if (typesResult.error) {
            return NextResponse.json({ error: '타입을 불러올 수 없습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            categories: categoriesResult.data || [],
            types: typesResult.data || []
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

