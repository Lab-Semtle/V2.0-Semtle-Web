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

        // 파일명 생성 (타임스탬프 + 원본 파일명)
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${timestamp}.${fileExt}`;

        // Supabase Storage에 업로드
        const { data, error } = await supabase.storage
            .from('projects')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 });
        }

        // 공개 URL 생성
        const { data: { publicUrl } } = supabase.storage
            .from('projects')
            .getPublicUrl(fileName);

        return NextResponse.json({
            success: true,
            url: publicUrl,
            fileName: fileName
        });

    } catch (error) {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
