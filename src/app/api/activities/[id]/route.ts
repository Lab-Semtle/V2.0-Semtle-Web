import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 활동 상세 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const activityId = parseInt(resolvedParams.id);

        if (isNaN(activityId)) {
            return NextResponse.json({ error: '잘못된 활동 ID입니다.' }, { status: 400 });
        }

        // 활동 상세 조회 (새로운 분리된 구조)
        const { data: activity, error } = await supabase
            .from('activities')
            .select(`
        *,
        category:board_categories(*),
        author:user_profiles!activities_author_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          role
        )
      `)
            .eq('id', activityId)
            .eq('status', 'published')
            .single();

        if (error) {
            console.error('활동 조회 오류:', error);
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 조회수 증가
        await supabase
            .from('activities')
            .update({ views: activity.views + 1 })
            .eq('id', activityId);

        return NextResponse.json({ activity });
    } catch (error) {
        console.error('활동 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 활동 수정 (관리자 전용)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const activityId = parseInt(resolvedParams.id);

        if (isNaN(activityId)) {
            return NextResponse.json({ error: '잘못된 활동 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
            return NextResponse.json({ error: '활동 수정 권한이 없습니다.' }, { status: 403 });
        }

        const updateData = await request.json();
        const {
            title,
            subtitle,
            content,
            thumbnail,
            category_id,
            activity_type_id,
            status,
            tags,
            location,
            start_date,
            end_date,
            max_participants,
            participation_fee,
            contact_info,
            has_voting,
            vote_options,
            vote_deadline
        } = updateData;

        // 활동 수정
        const { data: updatedActivity, error: updateError } = await supabase
            .from('activities')
            .update({
                title,
                subtitle,
                content,
                thumbnail,
                category_id,
                activity_type_id,
                status,
                tags,
                location,
                start_date,
                end_date,
                max_participants,
                participation_fee,
                contact_info,
                has_voting,
                vote_options,
                vote_deadline,
                updated_at: new Date().toISOString(),
                published_at: status === 'published' ? new Date().toISOString() : null
            })
            .eq('id', activityId)
            .select()
            .single();

        if (updateError) {
            console.error('활동 수정 오류:', updateError);
            return NextResponse.json({ error: '활동 수정에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ activity: updatedActivity });
    } catch (error) {
        console.error('활동 수정 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 활동 삭제 (관리자 전용)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const activityId = parseInt(resolvedParams.id);

        if (isNaN(activityId)) {
            return NextResponse.json({ error: '잘못된 활동 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 관리자 권한 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
            return NextResponse.json({ error: '활동 삭제 권한이 없습니다.' }, { status: 403 });
        }

        // 활동 삭제
        const { error: deleteError } = await supabase
            .from('activities')
            .delete()
            .eq('id', activityId);

        if (deleteError) {
            console.error('활동 삭제 오류:', deleteError);
            return NextResponse.json({ error: '활동 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '활동이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('활동 삭제 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

