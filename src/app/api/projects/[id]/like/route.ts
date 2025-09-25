import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 프로젝트 게시물 좋아요 토글
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const projectId = parseInt(resolvedParams.id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '잘못된 프로젝트 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 기존 좋아요 확인
        const { data: existingLike } = await supabase
            .from('project_likes')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .single();

        if (existingLike) {
            // 좋아요 취소
            const { error: deleteError } = await supabase
                .from('project_likes')
                .delete()
                .eq('project_id', projectId)
                .eq('user_id', user.id);

            if (deleteError) {
                console.error('프로젝트 좋아요 취소 오류:', deleteError);
                return NextResponse.json({ error: '좋아요 취소에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({
                liked: false,
                message: '좋아요가 취소되었습니다.'
            });
        } else {
            // 좋아요 추가
            const { error: insertError } = await supabase
                .from('project_likes')
                .insert({
                    project_id: projectId,
                    user_id: user.id
                });

            if (insertError) {
                console.error('프로젝트 좋아요 추가 오류:', insertError);
                return NextResponse.json({ error: '좋아요 추가에 실패했습니다.' }, { status: 500 });
            }

            // 알림 생성 (작성자에게)
            const { data: project } = await supabase
                .from('project_posts')
                .select('post_id')
                .eq('post_id', projectId)
                .single();

            if (project) {
                const { data: post } = await supabase
                    .from('posts')
                    .select('author_id, title')
                    .eq('id', project.post_id)
                    .single();

                if (post && post.author_id !== user.id) {
                    await supabase
                        .from('notifications')
                        .insert({
                            user_id: post.author_id,
                            type: 'like',
                            title: '새로운 좋아요',
                            message: `"${post.title}" 프로젝트에 좋아요를 받았습니다.`,
                            data: {
                                post_id: project.post_id,
                                liker_id: user.id
                            }
                        });
                }
            }

            return NextResponse.json({
                liked: true,
                message: '좋아요가 추가되었습니다.'
            });
        }
    } catch (error) {
        console.error('프로젝트 좋아요 토글 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 프로젝트 게시물 좋아요 상태 확인
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const projectId = parseInt(resolvedParams.id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: '잘못된 프로젝트 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ liked: false });
        }

        // 좋아요 상태 확인
        const { data: like } = await supabase
            .from('project_likes')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .single();

        return NextResponse.json({ liked: !!like });
    } catch (error) {
        console.error('프로젝트 좋아요 상태 확인 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

