import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 게시물 북마크 토글
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log('북마크 POST 요청 받음');
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const postId = parseInt(resolvedParams.id);
        console.log('북마크 POST - postId:', postId);

        if (isNaN(postId)) {
            return NextResponse.json({ error: '잘못된 게시물 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인 (서버에서 세션 기반 인증)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        console.log('북마크 API - 사용자 인증 성공:', user.id);

        // 프로젝트 존재 확인
        const { data: project } = await supabase
            .from('projects')
            .select('id')
            .eq('id', postId)
            .single();

        if (!project) {
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 프로젝트 북마크 처리
        // 기존 북마크 확인
        const { data: existingBookmark } = await supabase
            .from('project_bookmarks')
            .select('id')
            .eq('project_id', postId)
            .eq('user_id', user.id)
            .single();

        if (existingBookmark) {
            // 북마크 취소
            const { error: deleteError } = await supabase
                .from('project_bookmarks')
                .delete()
                .eq('project_id', postId)
                .eq('user_id', user.id);

            if (deleteError) {
                console.error('북마크 삭제 오류:', deleteError);
                return NextResponse.json({ error: '북마크 취소에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({
                isBookmarked: false,
                message: '북마크가 취소되었습니다.'
            });
        } else {
            // 북마크 추가
            const { error: insertError } = await supabase
                .from('project_bookmarks')
                .insert({
                    project_id: postId,
                    user_id: user.id
                });

            if (insertError) {
                console.error('북마크 추가 오류:', insertError);
                return NextResponse.json({ error: '북마크 추가에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({
                isBookmarked: true,
                message: '북마크가 추가되었습니다.'
            });
        }
    } catch (error) {
        console.error('북마크 POST API 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 게시물 북마크 상태 확인
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const postId = parseInt(resolvedParams.id);

        if (isNaN(postId)) {
            return NextResponse.json({ error: '잘못된 게시물 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ isBookmarked: false });
        }

        // 프로젝트 존재 확인
        const { data: project } = await supabase
            .from('projects')
            .select('id')
            .eq('id', postId)
            .single();

        if (!project) {
            return NextResponse.json({ isBookmarked: false });
        }

        // 프로젝트 북마크 상태 확인
        const { data: bookmark } = await supabase
            .from('project_bookmarks')
            .select('id')
            .eq('project_id', postId)
            .eq('user_id', user.id)
            .single();

        return NextResponse.json({ isBookmarked: !!bookmark });
    } catch (error) {
        console.error('북마크 GET API 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
