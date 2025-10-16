import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const { data: links, error } = await supabase
            .from('footer_links')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) {
            return NextResponse.json({ error: 'Footer 링크를 불러올 수 없습니다.' }, { status: 500 });
        }

        return NextResponse.json({ links });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, url, icon, color, sort_order } = await request.json();

        if (!name || !url || !icon) {
            return NextResponse.json({ error: '필수 필드를 모두 입력해주세요.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('footer_links')
            .insert([{ name, url, icon, color, sort_order }])
            .select();

        if (error) {
            return NextResponse.json({ error: 'Footer 링크 생성에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Footer 링크가 성공적으로 생성되었습니다.', data }, { status: 201 });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, name, url, icon, color, sort_order, is_active } = await request.json();

        if (!id) {
            return NextResponse.json({ error: '링크 ID가 필요합니다.' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (url !== undefined) updateData.url = url;
        if (icon !== undefined) updateData.icon = icon;
        if (color !== undefined) updateData.color = color;
        if (sort_order !== undefined) updateData.sort_order = sort_order;
        if (is_active !== undefined) updateData.is_active = is_active;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('footer_links')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json({ error: 'Footer 링크 업데이트에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Footer 링크가 성공적으로 업데이트되었습니다.', data });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: '링크 ID가 필요합니다.' }, { status: 400 });
        }

        const { error } = await supabase
            .from('footer_links')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: 'Footer 링크 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Footer 링크가 성공적으로 삭제되었습니다.' });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

