-- resource_comments 테이블 외래키 관계 수정
-- user_profiles 테이블과의 관계를 올바르게 설정

-- 기존 외래키 제약조건 확인 및 수정
-- 먼저 기존 제약조건이 있는지 확인하고 삭제
DO $$ 
BEGIN
    -- 기존 외래키 제약조건 삭제 (있다면)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'resource_comments_user_id_fkey' 
        AND table_name = 'resource_comments'
    ) THEN
        ALTER TABLE resource_comments DROP CONSTRAINT resource_comments_user_id_fkey;
    END IF;
    
    -- 혹시 다른 이름으로 된 제약조건도 삭제
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'resource_comments_author_id_fkey' 
        AND table_name = 'resource_comments'
    ) THEN
        ALTER TABLE resource_comments DROP CONSTRAINT resource_comments_author_id_fkey;
    END IF;
END $$;

-- 새로운 외래키 제약조건 추가 (user_id 컬럼 사용)
ALTER TABLE resource_comments 
ADD CONSTRAINT resource_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 코멘트 추가
COMMENT ON CONSTRAINT resource_comments_user_id_fkey ON resource_comments IS '댓글 작성자와 auth.users 테이블의 관계';

-- RLS 정책도 확인하고 수정
DROP POLICY IF EXISTS "resource_comments_select_policy" ON resource_comments;
DROP POLICY IF EXISTS "resource_comments_insert_policy" ON resource_comments;
DROP POLICY IF EXISTS "resource_comments_update_policy" ON resource_comments;
DROP POLICY IF EXISTS "resource_comments_delete_policy" ON resource_comments;

-- 새로운 RLS 정책 생성
CREATE POLICY "resource_comments_select_policy" ON resource_comments
    FOR SELECT USING (true);

CREATE POLICY "resource_comments_insert_policy" ON resource_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "resource_comments_update_policy" ON resource_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "resource_comments_delete_policy" ON resource_comments
    FOR DELETE USING (user_id = auth.uid());
