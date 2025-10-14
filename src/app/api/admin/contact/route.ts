import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // 문의 목록 조회 쿼리 구성
        let query = supabase
            .from('contact_inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        // 상태 필터 적용
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        // 페이지네이션 적용
        query = query.range(offset, offset + limit - 1);

        const { data: inquiries, error } = await query;

        if (error) {
            return NextResponse.json(
                { error: '문의 목록을 불러올 수 없습니다.' },
                { status: 500 }
            );
        }

        // 전체 개수 조회
        let countQuery = supabase
            .from('contact_inquiries')
            .select('*', { count: 'exact', head: true });

        if (status && status !== 'all') {
            countQuery = countQuery.eq('status', status);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
        }

        return NextResponse.json({
            inquiries: inquiries || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status, adminNotes } = await request.json();

        if (!id || !status) {
            return NextResponse.json(
                { error: '필수 필드가 누락되었습니다.' },
                { status: 400 }
            );
        }

        const updateData: any = {
            status,
            updated_at: new Date().toISOString()
        };

        if (adminNotes !== undefined) {
            updateData.admin_notes = adminNotes;
        }

        if (status === 'resolved' || status === 'closed') {
            updateData.resolved_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('contact_inquiries')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: '문의 상태 업데이트에 실패했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: '문의 상태가 성공적으로 업데이트되었습니다.',
            data
        });

    } catch (error) {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: '문의 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('contact_inquiries')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json(
                { error: '문의 삭제에 실패했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: '문의가 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

