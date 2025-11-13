-- projects 버킷 정책 업데이트
-- 폴더 구조: {postId}/ (썸네일), {postId}/editor/ (에디터 이미지)
-- 권한: 누구나 작성, 본인 또는 관리자만 수정/삭제

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Allow users to delete their own project images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own project images" ON storage.objects;

-- 2. 누구나 이미지 업로드 가능 (프로젝트 게시판은 누구나 작성)
DROP POLICY IF EXISTS "Allow authenticated users to upload project images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'projects');

-- 4. 본인 또는 관리자만 이미지 삭제 가능
CREATE POLICY "Allow owners or admins to delete project images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'projects'
    AND (
        -- 관리자인 경우
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
        OR
        -- 본인이 작성한 게시물인 경우
        -- 폴더 구조: {postId}/ 또는 {postId}/editor/
        -- 첫 번째 폴더가 postId
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id::text = (storage.foldername(name))[1]
            AND author_id = auth.uid()
        )
    )
);

-- 5. 본인 또는 관리자만 이미지 업데이트 가능
CREATE POLICY "Allow owners or admins to update project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'projects'
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
            SELECT 1 FROM public.projects
            WHERE id::text = (storage.foldername(name))[1]
            AND author_id = auth.uid()
        )
    )
);

