-- post-images 버킷 생성 및 정책 설정
-- 이 마이그레이션은 게시물 썸네일 이미지를 위한 Storage 버킷을 생성합니다.

-- 1. post-images 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'post-images',
    'post-images', 
    true,
    5242880, -- 5MB 제한
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. 모든 사용자가 이미지 업로드 가능 (인증된 사용자만)
CREATE POLICY "Allow authenticated users to upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

-- 3. 모든 사용자가 이미지 조회 가능 (공개 읽기)
CREATE POLICY "Allow public read access to post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- 4. 작성자만 자신의 이미지 삭제 가능
CREATE POLICY "Allow users to delete their own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. 작성자만 자신의 이미지 업데이트 가능
CREATE POLICY "Allow users to update their own post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);





