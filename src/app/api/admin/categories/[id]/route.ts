import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 카테고리 생성
export async function POST(request: NextRequest) {
    try {
        const { name, description, color, icon, sort_order, is_active, table_name } = await request.json();

        if (!name || !table_name) {
            return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from(table_name)
            .insert([{
                name,
                description: description || null,
                color: color || '#3B82F6',
                icon: icon || null,
                sort_order: sort_order || 0,
                is_active: is_active !== undefined ? is_active : true
            }])
            .select();

        if (error) {
            return NextResponse.json({ error: '카테고리 생성에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '카테고리가 성공적으로 생성되었습니다.', data }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 카테고리 수정
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const { name, description, color, icon, sort_order, is_active, table_name } = await request.json();

        if (!id || !name || !table_name) {
            return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from(table_name)
            .update({
                name,
                description: description || null,
                color: color || '#3B82F6',
                icon: icon || null,
                sort_order: sort_order || 0,
                is_active: is_active !== undefined ? is_active : true
            })
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json({ error: '카테고리 수정에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '카테고리가 성공적으로 수정되었습니다.', data });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 카테고리 삭제
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const table_name = searchParams.get('table_name');

        if (!id || !table_name) {
            return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
        }

        const { error } = await supabase
            .from(table_name)
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: '카테고리 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '카테고리가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

