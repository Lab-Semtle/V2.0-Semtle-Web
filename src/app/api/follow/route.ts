import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 팔로우/언팔로우
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { userId } = await request.json();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        if (user.id === userId) {
            return NextResponse.json({ error: '자신을 팔로우할 수 없습니다.' }, { status: 400 });
        }

        // 팔로우 상태 확인
        const { data: existingFollow } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', userId)
            .single();

        if (existingFollow) {
            // 언팔로우
            const { error: deleteError } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', userId);

            if (deleteError) {
                return NextResponse.json({ error: '언팔로우에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({
                message: '언팔로우되었습니다.',
                isFollowing: false
            });
        } else {
            // 팔로우
            const { error: insertError } = await supabase
                .from('follows')
                .insert({
                    follower_id: user.id,
                    following_id: userId
                });

            if (insertError) {
                return NextResponse.json({ error: '팔로우에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({
                message: '팔로우되었습니다.',
                isFollowing: true
            });
        }
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 팔로우 상태 확인
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 팔로우 상태 확인 및 카운트 계산
        const [followResult, followersResult, followingResult] = await Promise.all([
            supabase
                .from('follows')
                .select('id')
                .eq('follower_id', user.id)
                .eq('following_id', userId)
                .single(),
            // 해당 사용자의 팔로워 수
            supabase
                .from('follows')
                .select('id', { count: 'exact' })
                .eq('following_id', userId),
            // 해당 사용자의 팔로잉 수
            supabase
                .from('follows')
                .select('id', { count: 'exact' })
                .eq('follower_id', userId)
        ]);

        return NextResponse.json({
            isFollowing: !!followResult.data,
            followersCount: followersResult.count || 0,
            followingCount: followingResult.count || 0
        });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}





