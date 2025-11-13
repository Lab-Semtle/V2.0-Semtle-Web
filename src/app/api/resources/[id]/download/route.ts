import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabase();
        const resolvedParams = await params;
        const resourceId = parseInt(resolvedParams.id);

        if (isNaN(resourceId)) {
            return NextResponse.json({ error: '유효하지 않은 자료 ID입니다.' }, { status: 400 });
        }

        // 사용자 인증 확인 (선택적 - 로그인하지 않은 사용자도 다운로드 가능)
        const { data: { user } } = await supabase.auth.getUser();

        // 쿼리 파라미터에서 파일 URL 확인
        const { searchParams } = new URL(request.url);
        const fileUrl = searchParams.get('file');

        let filePath: string;
        let fileName: string;
        let fileType: string;

        if (fileUrl) {
            // 특정 파일 다운로드 (여러 파일 중 하나)
            // URL에서 실제 파일 경로만 추출
            const urlParts = fileUrl.split('/');
            const bucketIndex = urlParts.findIndex(part => part === 'resources');
            if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
                filePath = urlParts.slice(bucketIndex + 1).join('/');
            } else {
                filePath = fileUrl;
            }
            fileName = filePath.split('/').pop() || `file_${Date.now()}`;
            fileType = 'application/octet-stream';
        } else {
            // 첫 번째 파일 다운로드 (resource_files 테이블에서)
            const { data: firstFile, error: fileError } = await supabase
                .from('resource_files')
                .select('*')
                .eq('resource_id', resourceId)
                .order('upload_order')
                .limit(1)
                .single();

            if (fileError || !firstFile) {
                return NextResponse.json({ error: '다운로드할 파일이 없습니다.' }, { status: 404 });
            }

            filePath = firstFile.file_path;
            fileName = firstFile.original_filename || `resource_${resourceId}`;
            fileType = firstFile.file_type || 'application/octet-stream';
        }

        // Supabase Storage에서 파일 다운로드
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('resources')
            .download(filePath);

        if (downloadError || !fileData) {
            return NextResponse.json({ error: '파일 다운로드에 실패했습니다.' }, { status: 500 });
        }

        // 다운로드 기록 추가 및 다운로드 수 증가 (비동기 처리)
        try {
            // 1시간 이내 동일 유저의 다운로드 기록이 있는지 확인
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            
            let shouldInsertDownload = false;
            
            if (user?.id) {
                // 로그인한 유저의 경우: 1시간 이내 다운로드 기록 확인
                const { data: recentDownloads } = await supabase
                    .from('resource_downloads')
                    .select('id')
                    .eq('resource_id', resourceId)
                    .eq('user_id', user.id)
                    .gte('downloaded_at', oneHourAgo);
                
                shouldInsertDownload = !recentDownloads || recentDownloads.length === 0;
            } else {
                // 비로그인 유저의 경우: IP 주소와 user_agent로 확인
                const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
                const { data: recentDownloads } = await supabase
                    .from('resource_downloads')
                    .select('id')
                    .eq('resource_id', resourceId)
                    .eq('ip_address', ipAddress)
                    .gte('downloaded_at', oneHourAgo);
                
                shouldInsertDownload = !recentDownloads || recentDownloads.length === 0;
            }
            
            // 1시간 이내 다운로드 기록이 없을 때만 추가
            if (shouldInsertDownload) {
                const downloadRecord = {
                    resource_id: resourceId,
                    user_id: user?.id || null,
                    downloaded_at: new Date().toISOString(),
                    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
                    user_agent: request.headers.get('user-agent') || 'unknown'
                };
                
                // 다운로드 기록 추가 (트리거가 있으면 자동으로 카운트 증가)
                const { error: insertError } = await supabase
                    .from('resource_downloads')
                    .insert(downloadRecord);

                if (insertError) {
                    console.error('다운로드 기록 추가 오류:', insertError);
                    // 트리거가 작동하지 않을 경우 수동으로 카운트 증가
                    const { data: resourceData } = await supabase
                        .from('resources')
                        .select('downloads_count')
                        .eq('id', resourceId)
                        .single();

                    if (resourceData) {
                        const newCount = (resourceData.downloads_count || 0) + 1;
                        await supabase
                            .from('resources')
                            .update({ downloads_count: newCount })
                            .eq('id', resourceId);
                    }
                }
            }
        } catch (error) {
            console.error('다운로드 카운트 업데이트 오류:', error);
        }

        // 파일을 ArrayBuffer로 변환
        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 응답 헤더 설정 (Safari 호환성 개선)
        const headers = new Headers();
        headers.set('Content-Type', fileType);

        // Safari 호환성을 위한 파일명 처리
        const safeFileName = fileName.replace(/[^\x20-\x7E]/g, ''); // ASCII 문자만 유지
        headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeFileName)}`);
        headers.set('Content-Length', buffer.length.toString());

        // CORS 헤더 추가
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET');
        headers.set('Access-Control-Allow-Headers', 'Content-Type');

        return new NextResponse(buffer, {
            status: 200,
            headers
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}