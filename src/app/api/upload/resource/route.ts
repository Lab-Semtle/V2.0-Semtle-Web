import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        console.log('파일 업로드 API 시작');
        const supabase = await createServerSupabase();

        // 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.log('인증 오류:', authError);
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        console.log('사용자 인증 성공:', user.id);
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.log('파일이 없음');
            return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
        }

        console.log('파일 정보:', { name: file.name, size: file.size, type: file.type });

        // 파일 크기 제한 (100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: '파일 크기는 100MB를 초과할 수 없습니다.' }, { status: 400 });
        }

        // 파일명 정리 (Supabase Storage 호환)
        const cleanFileName = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_') // 한글과 특수문자를 언더스코어로 변경
            .replace(/_{2,}/g, '_') // 연속된 언더스코어를 하나로
            .replace(/^_|_$/g, ''); // 시작과 끝의 언더스코어 제거

        const timestamp = Date.now();
        const fileName = `${user.id}/${timestamp}_${cleanFileName}`;

        console.log('정리된 파일명:', fileName);

        // Supabase Storage에 업로드 (버킷이 없으면 자동 생성)
        console.log('Storage 업로드 시작:', fileName);
        const { data, error } = await supabase.storage
            .from('resources')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 });
        }

        console.log('Storage 업로드 성공:', data);

        // 공개 URL 생성
        const { data: urlData } = supabase.storage
            .from('resources')
            .getPublicUrl(data.path);

        console.log('공개 URL 생성:', urlData.publicUrl);

        const response = {
            success: true,
            url: urlData.publicUrl,
            path: data.path,
            fileName: cleanFileName,
            size: file.size,
            type: file.type
        };

        console.log('응답 데이터:', response);
        return NextResponse.json(response);

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
