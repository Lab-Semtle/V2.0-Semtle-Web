import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서비스 역할 키를 사용한 Supabase 클라이언트 (RLS 우회)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;

        if (!file) {
            return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
        }

        // 파일 크기 제한 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: '파일 크기는 5MB를 초과할 수 없습니다.' }, { status: 400 });
        }

        // 파일 타입 검증
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: '지원되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 허용)' }, { status: 400 });
        }


        // 고유한 파일명 생성
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `profile-images/${fileName}`;

        // Supabase Storage에 파일 업로드
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            return NextResponse.json({
                error: '파일 업로드에 실패했습니다.',
                details: uploadError.message
            }, { status: 500 });
        }


        // 공개 URL 생성
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // 사용자 프로필에 이미지 URL 업데이트
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                profile_image: publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            return NextResponse.json({ error: '프로필 이미지 업데이트에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({
            message: '프로필 이미지가 업로드되었습니다.',
            imageUrl: publicUrl
        });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
