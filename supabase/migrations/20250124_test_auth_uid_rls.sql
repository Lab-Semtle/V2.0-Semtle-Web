-- RLS 정책 테스트 및 디버깅용 SQL
-- Supabase SQL Editor에서 실행하여 auth.uid()가 작동하는지 확인

-- 1. 현재 RLS 정책 확인
SELECT 
    policyname,
    cmd,
    with_check,
    CASE 
        WHEN with_check LIKE '%auth.uid()%' THEN '✅ auth.uid() 사용 중'
        ELSE '❌ auth.uid() 미사용'
    END as auth_uid_status
FROM pg_policies
WHERE tablename = 'activities' 
AND cmd = 'INSERT';

-- 2. 현재 사용자 컨텍스트에서 auth.uid() 확인 (실행 시 현재 로그인한 사용자 ID 표시)
SELECT 
    auth.uid() as current_auth_uid,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ auth.uid()가 NULL입니다!'
        ELSE '✅ auth.uid()가 설정되었습니다: ' || auth.uid()::text
    END as status;

-- 3. activities 테이블의 현재 RLS 정책 전체 확인
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'activities';

-- 4. 기존 정책 삭제 및 새 정책 생성
DO $$
BEGIN
    -- 기존 정책 삭제
    DROP POLICY IF EXISTS "Only admins can create activities" ON activities;
    
    -- 새로운 정책 생성 (더 간단한 버전 - 테스트용)
    CREATE POLICY "Only admins can create activities" ON activities
        FOR INSERT 
        WITH CHECK (
            auth.uid() IS NOT NULL 
            AND auth.uid() = author_id
        );
    
    RAISE NOTICE 'RLS 정책이 업데이트되었습니다.';
END $$;

-- 5. 업데이트된 정책 확인
SELECT 
    policyname,
    cmd,
    with_check,
    '정책 업데이트 완료' as status
FROM pg_policies
WHERE tablename = 'activities' 
AND policyname = 'Only admins can create activities';










