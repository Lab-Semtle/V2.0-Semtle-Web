import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 게시물 상태 변경 (draft, published, private)
export async function PATCH(request: NextRequest) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { postType, postId, status, userId } = await request.json();


        // 유효한 상태 값 확인
        if (!['draft', 'published', 'private'].includes(status)) {
            return NextResponse.json(
                { error: '유효하지 않은 상태입니다.' },
                { status: 400 }
            );
        }

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

        // 게시물 존재 및 권한 확인
        const { data: post, error: fetchError } = await supabase
            .from(tableName)
            .select('author_id')
            .eq('id', postId)
            .single();


        if (fetchError || !post) {
            return NextResponse.json(
                { error: '게시물을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        postAuthorId: post.author_id,
            requestUserId: userId,
                isMatch: post.author_id === userId
    });

    if (post.author_id !== userId) {
        return NextResponse.json(
            { error: '수정 권한이 없습니다.' },
            { status: 403 }
        );
    }

    // 상태 업데이트
    const updateData: any = { status };

    // published로 변경할 때만 published_at 설정
    if (status === 'published') {
        updateData.published_at = new Date().toISOString();
    } else {
        updateData.published_at = null;
    }

    const { error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', postId);

    if (updateError) {
        return NextResponse.json(
            { error: '상태 변경에 실패했습니다.' },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });

} catch (error) {
    return NextResponse.json(
        { error: '서버 오류가 발생했습니다.' },
        { status: 500 }
    );
}
}
