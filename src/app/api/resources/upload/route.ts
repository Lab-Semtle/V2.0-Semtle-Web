import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { FileUploadResponse } from '@/types/resource';

// 파일 업로드
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 });
        }

        // 파일 크기 제한 (100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: '파일 크기는 100MB를 초과할 수 없습니다.' }, { status: 400 });
        }

        // 허용된 파일 타입 확인
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
            'application/json',
            'application/javascript',
            'text/javascript',
            'text/css',
            'text/html',
            'text/xml',
            'application/xml',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: '지원하지 않는 파일 형식입니다.' }, { status: 400 });
        }

        // 파일 확장자 추출
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

        // 파일명 생성 (중복 방지)
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `${user.id}/${timestamp}-${randomId}.${fileExtension}`;

        // Supabase Storage에 파일 업로드
        const { error: uploadError } = await supabase.storage
            .from('resources')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 });
        }

        // 공개 URL 생성
        const { data: urlData } = supabase.storage
            .from('resources')
            .getPublicUrl(fileName);

        const response: FileUploadResponse = {
            url: urlData.publicUrl,
            path: fileName,
            size: file.size,
            type: file.type
        };

        return NextResponse.json(response);
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 파일 삭제
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();

        // 현재 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const { path } = await request.json();

        if (!path) {
            return NextResponse.json({ error: '파일 경로가 제공되지 않았습니다.' }, { status: 400 });
        }

        // 파일 소유자 확인 (경로에 사용자 ID가 포함되어야 함)
        if (!path.startsWith(`${user.id}/`)) {
            return NextResponse.json({ error: '파일을 삭제할 권한이 없습니다.' }, { status: 403 });
        }

        // 파일 삭제
        const { error: deleteError } = await supabase.storage
            .from('resources')
            .remove([path]);

        if (deleteError) {
            return NextResponse.json({ error: '파일 삭제에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '파일이 삭제되었습니다.' });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
