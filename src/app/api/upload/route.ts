import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Novel 에디터 전용 이미지 업로드 API
// 기존 /api/upload/image와는 별도로 Novel 에디터의 요구사항에 맞춘 엔드포인트
export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || 'image/png';

        // postType과 postId 헤더에서 가져오기
        const postType = request.headers.get('x-post-type') as 'activities' | 'projects' | 'resources' | null;
        const postIdHeader = request.headers.get('x-post-id');

        // 파일 데이터 가져오기
        const fileBuffer = await request.arrayBuffer();

        if (!fileBuffer || fileBuffer.byteLength === 0) {
            return NextResponse.json({ error: '파일 데이터가 없습니다.' }, { status: 400 });
        }

        // 이미지 타입 검증
        if (!contentType.includes('image/')) {
            return NextResponse.json({ error: '이미지 파일만 업로드 가능합니다.' }, { status: 400 });
        }

        // 파일 크기 검증 (20MB 제한)
        const fileSizeMB = fileBuffer.byteLength / 1024 / 1024;
        if (fileSizeMB > 20) {
            return NextResponse.json({ error: '파일 크기는 20MB 이하여야 합니다.' }, { status: 400 });
        }

        // 버킷 선택 (postType 기반, 기본값은 projects)
        let bucketName: 'activities' | 'projects' | 'resources' = 'projects';
        if (postType === 'activities') {
            bucketName = 'activities';
        } else if (postType === 'projects') {
            bucketName = 'projects';
        } else if (postType === 'resources') {
            bucketName = 'resources';
        }

        // 폴더 구조 생성: {postId}/editor/ (에디터 이미지)
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExt = contentType.split('/')[1] || 'png';

        let fileName: string;
        if (postIdHeader) {
            // 게시물별 폴더 구조: {postId}/editor/{filename}
            fileName = `${postIdHeader}/editor/${timestamp}_${randomStr}.${fileExt}`;
        } else {
            // postId가 없으면 임시 폴더 사용 (새 게시물 작성 중)
            const supabase = await createServerSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || 'anonymous';
            fileName = `temp/${userId}/editor/${timestamp}_${randomStr}.${fileExt}`;
        }

        // File 객체로 변환
        const file = new File([fileBuffer], fileName, { type: contentType });

        // Supabase Storage에 업로드
        const supabaseClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error: uploadError } = await supabaseClient.storage
            .from(bucketName)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: contentType
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 });
        }

        // 공개 URL 생성
        const { data: { publicUrl } } = supabaseClient.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        // Novel 에디터가 기대하는 형식으로 응답
        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

