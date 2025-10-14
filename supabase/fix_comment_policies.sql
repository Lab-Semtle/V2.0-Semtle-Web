-- 댓글 RLS 정책 수정
-- 관리자도 댓글을 수정/삭제할 수 있도록 정책 업데이트

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can update their project comments" ON project_comments;
DROP POLICY IF EXISTS "Users can delete their project comments" ON project_comments;

-- 새로운 정책 생성 (더 간단한 방식)
CREATE POLICY "Users can update their project comments" ON project_comments
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- 관리자용 별도 정책
CREATE POLICY "Admins can update any project comments" ON project_comments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can delete their project comments" ON project_comments
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- 관리자용 DELETE 정책
CREATE POLICY "Admins can delete any project comments" ON project_comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 자료실 댓글 정책도 동일하게 수정
DROP POLICY IF EXISTS "Users can update their resource comments" ON resource_comments;
DROP POLICY IF EXISTS "Users can delete their resource comments" ON resource_comments;

CREATE POLICY "Users can update their resource comments" ON resource_comments
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can delete their resource comments" ON resource_comments
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 활동 댓글 정책도 동일하게 수정
DROP POLICY IF EXISTS "Users can update their activity comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can delete their activity comments" ON activity_comments;

CREATE POLICY "Users can update their activity comments" ON activity_comments
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can delete their activity comments" ON activity_comments
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );
