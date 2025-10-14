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
                return NextResponse.json({ error: '좋아요 취소에 실패했습니다.' }, { status: 500 });
            }

            // 실제 DB에서 좋아요 수를 계산해서 가져오기
            const { data: likeCountData } = await supabase
                .from('project_likes')
                .select('id', { count: 'exact' })
                .eq('project_id', projectId);

            const actualLikesCount = likeCountData?.length || 0;

            // projects 테이블의 likes_count를 실제 값으로 업데이트
            const { error: updateError } = await supabase
                .from('projects')
                .update({
                    likes_count: actualLikesCount
                })
                .eq('id', projectId);

            if (updateError) {
                console.error('좋아요 수 업데이트 오류:', updateError);
            } else {
                console.log('좋아요 수 업데이트 성공 (취소):', { projectId, actualLikesCount });
            }

            // 실제 DB 값으로 응답
            console.log('최종 좋아요 수 (취소):', { projectId, likes_count: actualLikesCount });

            return NextResponse.json({
                liked: false,
                likes_count: actualLikesCount,
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
                console.error('좋아요 추가 오류:', insertError);
                return NextResponse.json({ error: '좋아요 추가에 실패했습니다.' }, { status: 500 });
            }

            console.log('좋아요 추가 성공:', { projectId, userId: user.id });

            // 실제 DB에서 좋아요 수를 계산해서 가져오기
            const { data: likeCountData } = await supabase
                .from('project_likes')
                .select('id', { count: 'exact' })
                .eq('project_id', projectId);

            const actualLikesCount = likeCountData?.length || 0;

            // projects 테이블의 likes_count를 실제 값으로 업데이트
            const { error: updateError } = await supabase
                .from('projects')
                .update({
                    likes_count: actualLikesCount
                })
                .eq('id', projectId);

            if (updateError) {
                console.error('좋아요 수 업데이트 오류:', updateError);
            } else {
                console.log('좋아요 수 업데이트 성공:', { projectId, actualLikesCount });
            }

            // 알림 생성 (작성자에게)
            const { data: projectData } = await supabase
                .from('projects')
                .select('author_id, title')
                .eq('id', projectId)
                .single();

            if (projectData && projectData.author_id !== user.id) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: projectData.author_id,
                        type: 'like',
                        title: '새로운 좋아요',
                        message: `"${projectData.title}" 프로젝트에 좋아요를 받았습니다.`,
                        data: {
                            project_id: projectId,
                            liker_id: user.id
                        }
                    });
            }

            // 실제 DB 값으로 응답
            console.log('최종 좋아요 수:', { projectId, likes_count: actualLikesCount });

            return NextResponse.json({
                liked: true,
                likes_count: actualLikesCount,
                message: '좋아요가 추가되었습니다.'
            });
        }
    } catch (error) {
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
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

