import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 활동 상태 변경 (공개/비공개/임시저장)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const activityId = parseInt(resolvedParams.id);

        if (isNaN(activityId)) {
            return NextResponse.json({ error: '유효하지 않은 활동 ID입니다.' }, { status: 400 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        let { status } = body;

        // 새 스키마: 'published'는 'public'으로 매핑
        if (status === 'published') {
            status = 'public';
        }

        // 새 스키마: 'draft', 'public', 'private'만 허용
        if (!status || !['draft', 'public', 'private'].includes(status)) {
            return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 });
        }

        // 활동 권한 확인
        const { data: activity } = await supabase
            .from('activities')
            .select('id, author_id')
            .eq('id', activityId)
            .single();

        if (!activity) {
            return NextResponse.json({ error: '활동을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 관리자 권한 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        const isAuthor = activity.author_id === user.id;

        // 관리자 또는 작성자만 상태 변경 가능
        if (!isAdmin && !isAuthor) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        // 새 스키마: activities 테이블에는 updated_at 컬럼이 없음
        // status만 업데이트 (published_version_id는 변경하지 않음)
        // draft로 변경 시에만 published_version_id를 NULL로 설정하는 것은 CHECK 제약조건 위반 가능성 있으므로 주의
        const updateData: Record<string, unknown> = {
            status
        };

        // draft로 변경하려면 published_version_id를 NULL로 설정해야 하지만,
        // 현재 published_version_id가 있는 경우 draft로 변경하는 것은 의미가 없음
        // 따라서 'public'과 'private'만 허용
        if (status === 'draft') {
            // draft로 변경하려고 하는데 published_version_id가 있는 경우 오류
            const { data: currentActivity } = await supabase
                .from('activities')
                .select('published_version_id')
                .eq('id', activityId)
                .single();

            if (currentActivity?.published_version_id) {
                return NextResponse.json({ 
                    error: '출판된 게시물은 draft 상태로 변경할 수 없습니다. 비공개로 전환하세요.' 
                }, { status: 400 });
            }
        }

        const { error: updateError } = await supabase
            .from('activities')
            .update(updateData)
            .eq('id', activityId);

        if (updateError) {
            console.error('Status update error:', updateError);
            return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
        }

        const statusMessages: Record<string, string> = {
            public: '공개',
            private: '비공개',
            draft: '임시저장'
        };

        return NextResponse.json({
            success: true,
            message: `상태가 ${statusMessages[status] || status}로 변경되었습니다.`
        });
    } catch (error) {
        console.error('Status update error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}