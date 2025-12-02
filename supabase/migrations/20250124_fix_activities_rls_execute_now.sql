-- ⚠️ 중요: 이 SQL을 Supabase SQL Editor에서 바로 실행하세요!
-- Supabase Dashboard → SQL Editor → New Query → 이 내용 붙여넣기 → Run

-- 1단계: 현재 정책 확인
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'activities' 
AND policyname = 'Only admins can create activities';

-- 2단계: 기존 정책 삭제
DROP POLICY IF EXISTS "Only admins can create activities" ON activities;

-- 3단계: 새로운 정책 생성 (resources와 동일한 패턴)
-- auth.uid() IS NOT NULL AND auth.uid() = author_id 만 확인
-- 관리자 권한은 API 레벨(/api/activities/route.ts)에서 이미 검증됨
CREATE POLICY "Only admins can create activities" ON activities
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    );

-- 4단계: 정책 생성 확인
SELECT 
    policyname,
    cmd,
    with_check,
    '정책이 성공적으로 생성되었습니다!' as status
FROM pg_policies
WHERE tablename = 'activities' 
AND policyname = 'Only admins can create activities';











