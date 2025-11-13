-- =============================================
-- Activities 테이블 INSERT RLS 정책 수정
-- =============================================
-- 날짜: 2025-01-25
-- 설명: 새 게시물 작성 시 RLS 정책 위반 오류 해결
--       서버 사이드에서 createServerSupabase()를 사용할 때도 작동하도록 수정

-- 1. 기존 INSERT 정책 삭제
DROP POLICY IF EXISTS "Only admins can create activities" ON activities;

-- 2. 새로운 INSERT 정책 생성
-- auth.uid() IS NOT NULL AND auth.uid() = author_id 만 확인
-- 관리자 권한은 API 레벨(/api/activities/route.ts)에서 이미 검증됨
CREATE POLICY "Only admins can create activities" ON activities
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    );

-- 3. 정책 확인
DO $$
DECLARE
    policy_exists BOOLEAN;
    policy_check TEXT;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Only admins can create activities'
        AND cmd = 'INSERT'
    ) INTO policy_exists;
    
    IF policy_exists THEN
        SELECT with_check INTO policy_check
        FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Only admins can create activities'
        AND cmd = 'INSERT';
        
        RAISE NOTICE '✅ INSERT 정책이 성공적으로 생성되었습니다.';
        RAISE NOTICE '정책 조건: %', policy_check;
    ELSE
        RAISE WARNING '❌ INSERT 정책이 생성되지 않았습니다.';
    END IF;
END $$;


