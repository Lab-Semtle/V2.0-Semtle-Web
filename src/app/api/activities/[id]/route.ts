import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 특정 활동 조회
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createServerSupabase();

    try {
        const activityId = await Promise.resolve(params.id);

        // 활동 조회
        const { data: activity, error } = await supabase
            .from('activities')
            .select(`
                *,
                category:activity_categories(id, name, color, icon),
                activity_type:activity_types(id, name, description, icon)
            `)
            .eq('id', activityId)
            .single();

        if (!error && activity && activity.author_id) {
            // 작성자 정보를 별도로 조회
            const { data: author } = await supabase
                .from('user_profiles')
                .select('id, nickname, name, profile_image')
                .eq('id', activity.author_id)
                .single();
            
            activity.author = author;
        }

        if (error) {
            console.error('활동 조회 오류:', error);
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 조회수 증가
        await supabase
            .from('activities')
            .update({ views: (activity.views || 0) + 1 })
            .eq('id', activityId);

        return NextResponse.json({ activity });
    } catch (error) {
        console.error('활동 조회 서버 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 활동 수정
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createServerSupabase();

    try {
        const activityId = await Promise.resolve(params.id);
        const body = await request.json();

        // 사용자 확인 (보안상 getUser 사용)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json(
                { error: '인증되지 않은 요청입니다.' },
                { status: 401 }
            );
        }

        // 관리자 권한 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
            return NextResponse.json(
                { error: '활동 게시물은 관리자만 수정할 수 있습니다.' },
                { status: 403 }
            );
        }

        // 기존 활동 조회
        const { data: existingActivity } = await supabase
            .from('activities')
            .select('status')
            .eq('id', activityId)
            .single();

        // published_at 처리 (draft -> published 전환 시에만 설정)
        const updateData: any = {
            ...body,
            updated_at: new Date().toISOString()
        };

        if (body.status === 'published' && existingActivity?.status === 'draft') {
            updateData.published_at = new Date().toISOString();
        }

        // 활동 수정
        const { data: activity, error: updateError } = await supabase
            .from('activities')
            .update(updateData)
            .eq('id', activityId)
            .select()
            .single();

        if (updateError) {
            console.error('활동 수정 오류:', updateError);
            throw updateError;
        }

        return NextResponse.json({
            message: '활동이 성공적으로 수정되었습니다.',
            activity
        });

    } catch (error) {
        console.error('활동 수정 서버 오류:', error);
        return NextResponse.json(
            { error: '활동 수정에 실패했습니다.' },
            { status: 500 }
        );
    }
}
