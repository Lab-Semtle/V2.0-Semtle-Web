-- 임시저장된 프로젝트 조회를 위한 RLS 정책 추가
-- 작성자는 자신의 draft 프로젝트를 조회할 수 있도록 허용

-- 기존 정책이 있는지 확인하고 삭제
DROP POLICY IF EXISTS "Authors can view their own draft projects" ON projects;

-- 새로운 정책 생성
CREATE POLICY "Authors can view their own draft projects" ON projects
    FOR SELECT USING (auth.uid() = author_id AND status = 'draft');

-- 정책이 제대로 생성되었는지 확인
-- 이 정책으로 인해 작성자는 자신의 draft 프로젝트를 조회할 수 있게 됩니다.





