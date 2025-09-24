import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 프로젝트 신청자 목록 조회 (프로젝트 작성자만)
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
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 프로젝트 작성자 확인
        const { data: project } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', projectId)
            .eq('board_type', 'projects')
            .single();

        if (!project || project.author_id !== user.id) {
            return NextResponse.json({ error: '프로젝트 작성자만 신청자 목록을 볼 수 있습니다.' }, { status: 403 });
        }

        // 신청자 목록 조회
        const { data: applications, error } = await supabase
            .from('project_applications')
            .select(`
        *,
        applicant:user_profiles!project_applications_applicant_id_fkey(
          id,
          nickname,
          name,
          profile_image,
          major,
          grade,
          github_url,
          portfolio_url
        )
      `)
            .eq('project_id', projectId)
            .order('applied_at', { ascending: false });

        if (error) {
            console.error('신청자 목록 조회 오류:', error);
            return NextResponse.json({ error: '신청자 목록을 불러올 수 없습니다.' }, { status: 500 });
        }

        return NextResponse.json({ applications: applications || [] });
    } catch (error) {
        console.error('신청자 목록 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
