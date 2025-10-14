-- =============================================
-- Avatars Storage Bucket 생성 및 권한 설정
-- =============================================

-- avatars 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'avatars', 
    'avatars', 
    true, 
    5242880, -- 5MB 제한
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view avatars" ON storage.objects;

-- 공개 읽기 권한 (모든 사용자가 아바타 이미지를 볼 수 있음)
CREATE POLICY "Public Access" ON storage.objects 
    FOR SELECT USING (bucket_id = 'avatars');

-- 인증된 사용자만 아바타 업로드 가능
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects 
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = 'profile-images'
    );

-- 사용자는 자신의 아바타만 업데이트 가능
CREATE POLICY "Users can update own avatars" ON storage.objects 
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = 'profile-images'
        AND (storage.filename(name)) LIKE auth.uid()::text || '-%'
    );

-- 사용자는 자신의 아바타만 삭제 가능
CREATE POLICY "Users can delete own avatars" ON storage.objects 
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = 'profile-images'
        AND (storage.filename(name)) LIKE auth.uid()::text || '-%'
    );

-- 버킷 정보 확인
SELECT * FROM storage.buckets WHERE id = 'avatars';






