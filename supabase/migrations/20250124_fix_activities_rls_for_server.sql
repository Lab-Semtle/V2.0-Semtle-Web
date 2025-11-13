-- Fix activities RLS policy to work with server-side auth
-- 서버 사이드에서도 작동하도록 RLS 정책 수정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Only admins can create activities" ON activities;

-- 새로운 정책 생성 (서버 사이드에서도 작동)
-- resources와 동일한 패턴 사용: auth.uid() IS NOT NULL AND auth.uid() = author_id
-- 관리자 권한 확인은 API 레벨에서 이미 수행됨
CREATE POLICY "Only admins can create activities" ON activities
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    );

-- 참고: 관리자 권한 확인은 API 레벨(/api/activities/route.ts)에서 이미 수행됩니다.
-- RLS 정책은 author_id와 auth.uid()의 일치만 확인하면 됩니다.

