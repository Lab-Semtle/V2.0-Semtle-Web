-- 회원가입 트리거 임시 비활성화
-- 수동 프로필 생성을 위해 트리거를 제거

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
