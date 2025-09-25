import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// 자료 다운로드
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const resourceId = parseInt(resolvedParams.id);

        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '잘못된 자료 ID입니다.' }, { status: 400 });
        }

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 자료 정보 확인
        const { data: resource } = await supabase
            .from('resource_posts')
            .select(`
        *,
        post:posts!resource_posts_post_id_fkey(
          id,
          title,
          status
        )
      `)
            .eq('post_id', resourceId)
            .single();

        if (!resource || resource.post.status !== 'published') {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }


        if (!resource.file_url) {
            return NextResponse.json({ error: '파일이 존재하지 않습니다.' }, { status: 404 });
        }

        // 다운로드 기록 생성
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        const { error: downloadError } = await supabase
            .from('resource_downloads')
            .insert({
                resource_id: resourceId,
                user_id: user.id,
                ip_address: clientIP,
                user_agent: userAgent
            });

        if (downloadError) {
            console.error('다운로드 기록 생성 오류:', downloadError);
            // 다운로드 기록 실패해도 다운로드는 허용
        }

        // 다운로드 수 증가 및 마지막 다운로드 시간 업데이트
        await supabase
            .from('resource_posts')
            .update({
                downloads_count: resource.downloads_count + 1,
                last_downloaded: new Date().toISOString()
            })
            .eq('post_id', resourceId);

        // 알림 생성 (자료 작성자에게)
        if (resource.post.author_id !== user.id) {
            await supabase
                .from('notifications')
                .insert({
                    user_id: resource.post.author_id,
                    type: 'resource_download',
                    title: '자료 다운로드',
                    message: `"${resource.post.title}" 자료가 다운로드되었습니다.`,
                    data: {
                        resource_id: resourceId,
                        downloader_id: user.id
                    }
                });
        }

        return NextResponse.json({
            download_url: resource.file_url,
            file_name: resource.original_filename || resource.post.title,
            file_size: resource.file_size,
            message: '다운로드가 시작됩니다.'
        });
    } catch (error) {
        console.error('자료 다운로드 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 다운로드 통계 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const resourceId = parseInt(resolvedParams.id);

        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '잘못된 자료 ID입니다.' }, { status: 400 });
        }

        // 자료 정보 조회
        const { data: resource } = await supabase
            .from('resource_posts')
            .select('downloads_count, last_downloaded')
            .eq('post_id', resourceId)
            .single();

        if (!resource) {
            return NextResponse.json({ error: '자료를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 최근 다운로드 기록 조회
        const { data: recentDownloads } = await supabase
            .from('resource_downloads')
            .select(`
        downloaded_at,
        user:user_profiles!resource_downloads_user_id_fkey(
          nickname
        )
      `)
            .eq('resource_id', resourceId)
            .order('downloaded_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            downloads_count: resource.downloads_count,
            last_downloaded: resource.last_downloaded,
            recent_downloads: recentDownloads || []
        });
    } catch (error) {
        console.error('다운로드 통계 조회 중 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
