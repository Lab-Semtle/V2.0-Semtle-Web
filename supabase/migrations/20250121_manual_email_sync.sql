-- 이메일 인증 상태 수동 동기화
-- 현재 인증된 사용자들의 email_verified를 true로 업데이트

UPDATE public.user_profiles 
SET email_verified = TRUE 
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL
);
