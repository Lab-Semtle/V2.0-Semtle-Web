-- resource_downloads 테이블 RLS 정책 수정
-- 모든 사용자가 다운로드 기록을 추가할 수 있도록 허용

-- 기존 정책 삭제
DROP POLICY IF EXISTS "resource_downloads_select_policy" ON resource_downloads;
DROP POLICY IF EXISTS "resource_downloads_insert_policy" ON resource_downloads;
DROP POLICY IF EXISTS "resource_downloads_update_policy" ON resource_downloads;
DROP POLICY IF EXISTS "resource_downloads_delete_policy" ON resource_downloads;

-- 새로운 정책 생성
-- 모든 사용자가 다운로드 기록을 조회할 수 있음
CREATE POLICY "resource_downloads_select_policy" ON resource_downloads
    FOR SELECT USING (true);

-- 모든 사용자가 다운로드 기록을 추가할 수 있음 (로그인하지 않은 사용자도 포함)
CREATE POLICY "resource_downloads_insert_policy" ON resource_downloads
    FOR INSERT WITH CHECK (true);

-- 작성자만 자신의 다운로드 기록을 수정할 수 있음
CREATE POLICY "resource_downloads_update_policy" ON resource_downloads
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM resources 
            WHERE resources.id = resource_downloads.resource_id 
            AND resources.author_id = auth.uid()
        )
    );

-- 작성자만 자신의 다운로드 기록을 삭제할 수 있음
CREATE POLICY "resource_downloads_delete_policy" ON resource_downloads
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM resources 
            WHERE resources.id = resource_downloads.resource_id 
            AND resources.author_id = auth.uid()
        )
    );
