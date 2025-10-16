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

        // 다운로드 기록 추가 (비동기)
        const downloadRecord = {
            resource_id: resourceId,
            user_id: user?.id || null,
            downloaded_at: new Date().toISOString(),
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown'
        };

        // 다운로드 기록 추가 (비동기 처리)
        supabase
            .from('resource_downloads')
            .insert(downloadRecord);

        // 다운로드 수 증가 (비동기 처리)
        supabase
            .from('resources')
            .select('downloads_count')
            .eq('id', resourceId)
            .single()
            .then(({ data: resourceData, error: selectError }) => {
                if (!selectError && resourceData) {
                    const newCount = (resourceData.downloads_count || 0) + 1;
                    supabase
                        .from('resources')
                        .update({ downloads_count: newCount })
                        .eq('id', resourceId);
                }
            });

        // 파일을 ArrayBuffer로 변환
        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 응답 헤더 설정
        const headers = new Headers();
        headers.set('Content-Type', fileType);
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        headers.set('Content-Length', buffer.length.toString());

        return new NextResponse(buffer, {
            status: 200,
            headers
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}