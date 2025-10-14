import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const body = await request.json();
        const { userId, motivation, relevantExperience, availableTime, portfolioUrl, githubUrl, additionalInfo } = body;

        if (!userId) {
            return NextResponse.json({ error: '사용자 인증이 필요합니다.' }, { status: 401 });
        }

        if (!motivation?.trim()) {
            return NextResponse.json({ error: '지원 동기를 입력해주세요.' }, { status: 400 });
        }

        // 프로젝트 존재 확인
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, title, author_id, project_status, team_size, current_members')
            .eq('id', id)
            .single();

        if (projectError || !project) {
            return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 자신의 프로젝트에 신청하는지 확인
        if (project.author_id === userId) {
            return NextResponse.json({ error: '자신의 프로젝트에는 신청할 수 없습니다.' }, { status: 400 });
        }

        // 모집중인 프로젝트인지 확인
        if (project.project_status !== 'recruiting') {
            return NextResponse.json({ error: '모집이 마감된 프로젝트입니다.' }, { status: 400 });
        }

        // 이미 신청했는지 확인
        const { data: existingApplication } = await supabase
            .from('project_applications')
            .select('id')
            .eq('project_id', id)
            .eq('applicant_id', userId)
            .single();

        if (existingApplication) {
            return NextResponse.json({ error: '이미 신청한 프로젝트입니다.' }, { status: 400 });
        }

        // 신청서 생성
        const { data: application, error: applicationError } = await supabase
            .from('project_applications')
            .insert({
                project_id: parseInt(id),
                applicant_id: userId,
                motivation: motivation.trim(),
                relevant_experience: relevantExperience?.trim() || null,
                available_time: availableTime?.trim() || null,
                portfolio_url: portfolioUrl?.trim() || null,
                github_url: githubUrl?.trim() || null,
                additional_info: additionalInfo?.trim() || null,
                status: 'pending'
            })
            .select()
            .single();

        if (applicationError) {
            return NextResponse.json({ error: '신청서 제출에 실패했습니다.' }, { status: 500 });
        }

        // 프로젝트 작성자에게 알림 생성
        await supabase
            .from('notifications')
            .insert({
                user_id: project.author_id,
                type: 'application',
                title: '새로운 프로젝트 신청',
                message: `프로젝트 "${project.title || '제목 없음'}"에 새로운 신청이 있습니다.`,
                data: {
                    project_id: parseInt(id),
                    application_id: application.id,
                    applicant_id: userId
                }
            });

        return NextResponse.json({
            success: true,
            message: '프로젝트 신청이 완료되었습니다.',
            application
        });

    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: '사용자 인증이 필요합니다.' }, { status: 401 });
        }

        // 사용자의 신청 상태 확인
        const { data: application, error } = await supabase
            .from('project_applications')
            .select('id, status, applied_at')
            .eq('project_id', id)
            .eq('applicant_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116은 "not found" 에러
            return NextResponse.json({ error: '신청 상태를 확인할 수 없습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            hasApplied: !!application,
            application: application || null
        });

    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}