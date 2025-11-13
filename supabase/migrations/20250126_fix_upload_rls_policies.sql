-- Novel 에디터 이미지 업로드를 위한 RLS 정책 보완
-- projects 버킷의 editor/ 폴더 구조 지원
-- 기존 정책과 충돌하지 않도록 추가 정책만 생성

-- 1. editor/ 폴더 구조 지원: 인증된 사용자가 editor/ 폴더에 업로드 가능
-- SERVICE_ROLE_KEY를 사용하므로 실제로는 RLS를 우회하지만, 정책 보완
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload editor images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'projects' 
    AND (storage.foldername(name))[1] = 'editor'
);

-- 2. editor/ 폴더 구조 지원: 사용자가 자신의 editor/{userId}/ 이미지 삭제 가능
CREATE POLICY IF NOT EXISTS "Allow users to delete their own editor images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'projects' 
    AND (storage.foldername(name))[1] = 'editor'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 3. editor/ 폴더 구조 지원: 사용자가 자신의 editor/{userId}/ 이미지 업데이트 가능
CREATE POLICY IF NOT EXISTS "Allow users to update their own editor images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'projects' 
    AND (storage.foldername(name))[1] = 'editor'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

