-- 게시물 상태 확장: private 상태 추가
-- 기존: draft, published
-- 추가: private (발행된 게시물을 비공개로 전환)

-- projects 테이블의 status 컬럼에 private 값 추가를 위한 마이그레이션
-- 실제로는 VARCHAR(20)이므로 제약조건 없이 바로 사용 가능

-- RLS 정책 추가: 작성자는 자신의 private 게시물을 조회할 수 있도록 허용
DROP POLICY IF EXISTS "Authors can view their own private projects" ON projects;

CREATE POLICY "Authors can view their own private projects" ON projects
    FOR SELECT USING (auth.uid() = author_id AND status = 'private');

-- activities 테이블에도 동일한 정책 추가
DROP POLICY IF EXISTS "Authors can view their own private activities" ON activities;

CREATE POLICY "Authors can view their own private activities" ON activities
    FOR SELECT USING (auth.uid() = author_id AND status = 'private');

-- resources 테이블에도 동일한 정책 추가
DROP POLICY IF EXISTS "Authors can view their own private resources" ON resources;

CREATE POLICY "Authors can view their own private resources" ON resources
    FOR SELECT USING (auth.uid() = author_id AND status = 'private');





