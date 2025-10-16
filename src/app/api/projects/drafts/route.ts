import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 사용자의 임시저장된 프로젝트 목록 조회
export async function GET() {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 사용자의 임시저장된 프로젝트 조회
        const { data: drafts, error } = await supabase
            .from('projects')
            .select(`
                *,
                category:project_categories(*),
                project_type:project_types(*),
                author:user_profiles!projects_author_id_fkey(
                    id,
                    nickname,
                    name,
                    profile_image,
                    role
                )
            `)
            .eq('author_id', user.id)
            .eq('status', 'draft')
            .order('updated_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: '임시저장된 프로젝트를 불러올 수 없습니다.' }, { status: 500 });
        }

        return NextResponse.json({ drafts: drafts || [] });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}





