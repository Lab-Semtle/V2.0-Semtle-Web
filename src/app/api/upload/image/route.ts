import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;

        if (!file || !userId) {
            return NextResponse.json({ error: '파일과 사용자 ID가 필요합니다.' }, { status: 400 });
        }

        // postType 헤더 확인 (없으면 기본값 'projects')
        const postType = request.headers.get('x-post-type') as 'activities' | 'projects' | null || 'projects';
        const postId = request.headers.get('x-post-id');
        
        // 버킷 선택
        const bucketName = postType === 'activities' ? 'activities' : 'projects';
        
        // 파일명 생성 (폴더 구조: {postId}/ 또는 {userId}/)
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        
        let fileName: string;
        if (postId) {
            // 게시물별 폴더: {postId}/{filename} (썸네일)
            fileName = `${postId}/${timestamp}.${fileExt}`;
        } else {
            // postId가 없으면 userId 사용 (임시 저장)
            fileName = `${userId}/${timestamp}.${fileExt}`;
        }

        // Supabase Storage에 업로드
        const { error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 });
        }

        // 공개 URL 생성
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        return NextResponse.json({
            success: true,
            url: publicUrl,
            fileName: fileName
        });

    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
