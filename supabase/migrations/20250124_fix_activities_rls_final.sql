-- 최종 RLS 정책 수정
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. 모든 activities INSERT 관련 정책 확인 및 삭제
DO $$
BEGIN
    -- 모든 activities INSERT 정책 삭제
    DROP POLICY IF EXISTS "Only admins can create activities" ON activities;
    DROP POLICY IF EXISTS "Admins can create activities" ON activities;
    DROP POLICY IF EXISTS "Authenticated admins can create activities" ON activities;
    
    RAISE NOTICE '기존 정책 삭제 완료';
END $$;

-- 2. resources와 완전히 동일한 패턴으로 정책 생성
CREATE POLICY "Only admins can create activities" ON activities
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    );

-- 3. 정책 확인
SELECT 
    policyname,
    cmd,
    with_check,
    CASE 
        WHEN with_check LIKE '%auth.uid() IS NOT NULL%' 
         AND with_check LIKE '%auth.uid() = author_id%'
        THEN '✅ 정책이 올바르게 설정되었습니다'
        ELSE '❌ 정책이 예상과 다릅니다'
    END as status
FROM pg_policies
WHERE tablename = 'activities' 
AND policyname = 'Only admins can create activities';

-- 4. activities 테이블의 모든 RLS 정책 확인
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'activities'
ORDER BY cmd, policyname;










