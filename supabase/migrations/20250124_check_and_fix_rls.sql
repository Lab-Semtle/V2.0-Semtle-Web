-- RLS 정책 확인 및 수정 (즉시 실행)
-- Supabase SQL Editor에서 이 전체 스크립트를 실행하세요

-- ============================================
-- 1단계: 현재 정책 확인
-- ============================================
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check,
    CASE 
        WHEN cmd = 'INSERT' AND with_check LIKE '%auth.uid() IS NOT NULL%' AND with_check LIKE '%auth.uid() = author_id%'
        THEN '✅ 올바른 정책'
        WHEN cmd = 'INSERT' AND with_check LIKE '%EXISTS%user_profiles%'
        THEN '❌ 오래된 정책 - 수정 필요'
        ELSE '⚠️ 다른 정책'
    END as status
FROM pg_policies
WHERE tablename = 'activities'
ORDER BY cmd, policyname;

-- ============================================
-- 2단계: 모든 INSERT 정책 삭제
-- ============================================
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    -- 모든 activities INSERT 정책 찾기 및 삭제
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'activities' AND cmd = 'INSERT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON activities', policy_name);
        RAISE NOTICE '정책 삭제: %', policy_name;
    END LOOP;
    
    RAISE NOTICE '모든 INSERT 정책 삭제 완료';
END $$;

-- ============================================
-- 3단계: 새 정책 생성 (resources와 완전히 동일)
-- ============================================
CREATE POLICY "Only admins can create activities" ON activities
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    );

-- ============================================
-- 4단계: 생성 확인
-- ============================================
SELECT 
    policyname,
    cmd,
    with_check,
    CASE 
        WHEN with_check LIKE '%auth.uid() IS NOT NULL%' 
         AND with_check LIKE '%auth.uid() = author_id%'
        THEN '✅ 정책이 올바르게 생성되었습니다!'
        ELSE '❌ 정책 생성에 문제가 있습니다'
    END as 확인결과
FROM pg_policies
WHERE tablename = 'activities' 
AND policyname = 'Only admins can create activities';

-- ============================================
-- 5단계: activities 테이블의 모든 RLS 정책 최종 확인
-- ============================================
SELECT 
    cmd,
    policyname,
    with_check
FROM pg_policies
WHERE tablename = 'activities'
ORDER BY cmd, policyname;











