import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabase();
    try {
        const resolvedParams = await params;
        const resourceId = resolvedParams.id;

        // 사용자 확인 (보안상 getUser 사용)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json(
                { error: '인증되지 않은 요청입니다.' },
                { status: 401 }
            );
        }

        // 자료 정보 조회 (작성자 확인용)
        const { data: resource, error: resourceError } = await supabase
            .from('resources')
            .select('id, author_id')
            .eq('id', resourceId)
            .maybeSingle();

        if (resourceError || !resource) {
            return NextResponse.json(
                { error: '자료를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 사용자 프로필 확인
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
        const isAuthor = resource.author_id === user.id;

        // 관리자 또는 작성자만 삭제 가능
        if (!isAdmin && !isAuthor) {
            return NextResponse.json(
                { error: '자료를 삭제할 권한이 없습니다.' },
                { status: 403 }
            );
        }

        // 자료 삭제
        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', resourceId);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: '자료가 성공적으로 삭제되었습니다.'
        });

    } catch {
        return NextResponse.json(
            { error: '자료 삭제에 실패했습니다.' },
            { status: 500 }
        );
    }
}

