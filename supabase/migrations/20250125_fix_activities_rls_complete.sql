-- =============================================
-- Activities 테이블 RLS 정책 완전 수정
-- =============================================
-- 날짜: 2025-01-25
-- 설명: INSERT와 SELECT 정책 모두 수정하여 서버 사이드 인증과 호환되도록 함
--       새 게시물 생성 및 조회 문제 해결

-- =============================================
-- 1단계: 기존 INSERT 정책 삭제
-- =============================================
DROP POLICY IF EXISTS "Only admins can create activities" ON activities;
DROP POLICY IF EXISTS "Admins can create activities" ON activities;
DROP POLICY IF EXISTS "Authenticated admins can create activities" ON activities;

-- =============================================
-- 2단계: 새로운 INSERT 정책 생성
-- =============================================
-- auth.uid() IS NOT NULL AND auth.uid() = author_id 만 확인
-- 관리자 권한은 API 레벨(/api/activities/route.ts)에서 이미 검증됨
CREATE POLICY "Only admins can create activities" ON activities
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    );

-- =============================================
-- 3단계: UPDATE 정책 수정
-- =============================================
-- 기존 UPDATE 정책 삭제 (오래된 user_profiles 조인 방식)
DROP POLICY IF EXISTS "Only admins can update activities" ON activities;

-- 새로운 UPDATE 정책 생성 (서버 사이드 인증 호환)
-- 관리자 권한은 API 레벨에서 이미 검증됨
-- 작성자만 자신의 활동을 수정할 수 있음 (API에서 관리자 검증 완료)
CREATE POLICY "Only admins can update activities" ON activities
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    )
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    );

-- =============================================
-- 4단계: DELETE 정책 수정
-- =============================================
-- 기존 DELETE 정책 삭제 (오래된 user_profiles 조인 방식)
DROP POLICY IF EXISTS "Only admins can delete activities" ON activities;

-- 새로운 DELETE 정책 생성 (서버 사이드 인증 호환)
-- 관리자 권한은 API 레벨에서 이미 검증됨
-- 작성자만 자신의 활동을 삭제할 수 있음 (API에서 관리자 검증 완료)
CREATE POLICY "Only admins can delete activities" ON activities
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    );

-- =============================================
-- 5단계: SELECT 정책 확인 (변경 없음)
-- =============================================
-- SELECT 정책은 이미 올바르게 설정되어 있으므로 유지
-- - "Anyone can view published activities": published 상태의 활동 조회 가능
-- - "Authors can view their own private activities": 작성자가 자신의 private 활동 조회 가능

-- =============================================
-- 6단계: 최종 정책 확인
-- =============================================
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'INSERT' AND with_check LIKE '%auth.uid() IS NOT NULL%' 
             AND with_check LIKE '%auth.uid() = author_id%'
        THEN '✅ 올바른 INSERT 정책'
        WHEN cmd = 'UPDATE' AND qual LIKE '%auth.uid() IS NOT NULL%'
             AND qual LIKE '%auth.uid() = author_id%'
        THEN '✅ 올바른 UPDATE 정책'
        WHEN cmd = 'DELETE' AND qual LIKE '%auth.uid() IS NOT NULL%'
             AND qual LIKE '%auth.uid() = author_id%'
        THEN '✅ 올바른 DELETE 정책'
        WHEN cmd = 'SELECT' AND qual LIKE '%status%published%'
        THEN '✅ 올바른 SELECT 정책'
        WHEN cmd = 'SELECT' AND qual LIKE '%auth.uid() = author_id%'
             AND qual LIKE '%status%private%'
        THEN '✅ 올바른 SELECT 정책 (Private)'
        ELSE '⚠️ 확인 필요'
    END as status,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'activities'
ORDER BY cmd, policyname;

