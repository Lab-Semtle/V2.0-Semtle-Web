-- 즉시 실행 가능한 activities RLS 정책 수정
-- 이 마이그레이션은 Supabase SQL Editor에서 직접 실행할 수 있습니다.

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Only admins can create activities" ON activities;

-- 2. 새로운 정책 생성 (resources와 동일한 패턴)
-- auth.uid() IS NOT NULL AND auth.uid() = author_id 만 확인
-- 관리자 권한은 API 레벨에서 이미 검증됨
CREATE POLICY "Only admins can create activities" ON activities
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    );

-- 3. 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'activities' AND policyname = 'Only admins can create activities';











