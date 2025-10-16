import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 게시물 조회수 증가 (중복 방지 강화)
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { postType, postId } = await request.json();


        // 테이블명 결정
        const tableName = postType === 'project' ? 'projects' :
            postType === 'activity' ? 'activities' :
                postType === 'resource' ? 'resources' : null;

        if (!tableName) {
            return NextResponse.json(
                { error: '유효하지 않은 게시물 타입입니다.' },
                { status: 400 }
            );
        }

        // 게시물 존재 확인
        const { data: post, error: fetchError } = await supabase
            .from(tableName)
            .select('id, views')
            .eq('id', postId)
            .single();

        if (fetchError || !post) {
            return NextResponse.json(
                { error: '게시물을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 조회수 증가 (원자적 연산)
        const { data: updatedPost, error: updateError } = await supabase
            .from(tableName)
            .update({ views: (post.views || 0) + 1 })
            .eq('id', postId)
            .select('views')
            .single();

        if (updateError) {
            return NextResponse.json(
                { error: '조회수 업데이트에 실패했습니다.' },
                { status: 500 }
            );
        }


        return NextResponse.json({
            message: '조회수가 증가되었습니다.',
            views: updatedPost.views
        });

    } catch {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
