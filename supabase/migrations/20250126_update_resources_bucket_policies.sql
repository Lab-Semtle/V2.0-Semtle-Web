-- resources 버킷 정책 업데이트
-- 폴더 구조: {postId}/editor/ (에디터 이미지)
-- 권한: 누구나 작성, 본인 또는 관리자만 수정/삭제

-- 기존 정책 확인 및 삭제 (있다면)
DROP POLICY IF EXISTS "Allow users to delete their own resource images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own resource images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload resource images" ON storage.objects;

-- 1. 누구나 이미지 업로드 가능 (자료실 게시판은 누구나 작성)
CREATE POLICY "Allow authenticated users to upload resource images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- 2. 본인 또는 관리자만 이미지 삭제 가능
CREATE POLICY "Allow owners or admins to delete resource images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'resources'
    AND (
        -- 관리자인 경우
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
        OR
        -- 본인이 작성한 게시물인 경우
        -- 폴더 구조: {postId}/editor/
        -- 첫 번째 폴더가 postId
        EXISTS (
            SELECT 1 FROM public.resources
            WHERE id::text = (storage.foldername(name))[1]
            AND author_id = auth.uid()
        )
    )
);

-- 3. 본인 또는 관리자만 이미지 업데이트 가능
CREATE POLICY "Allow owners or admins to update resource images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resources'
    AND (
        -- 관리자인 경우
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
        OR
        -- 본인이 작성한 게시물인 경우
        EXISTS (
            SELECT 1 FROM public.resources
            WHERE id::text = (storage.foldername(name))[1]
            AND author_id = auth.uid()
        )
    )
);

