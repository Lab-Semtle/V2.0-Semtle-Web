-- activities 버킷 생성 및 정책 설정
-- 활동 게시판 썸네일 및 Novel 에디터 이미지용
-- 폴더 구조: {postId}/ (썸네일), {postId}/editor/ (에디터 이미지)

-- 1. activities 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'activities',
    'activities', 
    true,
    10485760, -- 10MB 제한
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Allow admins to upload activity images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to activity images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete activity images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to update activity images" ON storage.objects;

-- 2. 관리자만 이미지 업로드 가능 (활동 게시판은 관리자만 작성)
CREATE POLICY "Allow admins to upload activity images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'activities'
    AND EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- 3. 모든 사용자가 이미지 조회 가능 (공개 읽기)
CREATE POLICY "Allow public read access to activity images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'activities');

-- 4. 관리자만 이미지 삭제 가능 (활동 게시판은 관리자만 수정/삭제)
CREATE POLICY "Allow admins to delete activity images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'activities'
    AND EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- 5. 관리자만 이미지 업데이트 가능 (활동 게시판은 관리자만 수정)
CREATE POLICY "Allow admins to update activity images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'activities'
    AND EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

