-- user_profiles 테이블의 RLS 정책을 완전히 복구
-- 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role bypass" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

-- 기존 정책들 완전 복구
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
    FOR SELECT USING (true);

-- 서비스 역할 키를 사용하는 경우 RLS 우회
CREATE POLICY "Service role bypass" ON public.user_profiles
    FOR ALL USING (current_setting('role') = 'service_role');

-- 일반 사용자 정책 (서비스 역할이 아닌 경우에만 적용)
CREATE POLICY "Users can manage own profile" ON public.user_profiles
    FOR ALL USING (
        current_setting('role') != 'service_role' AND
        auth.uid() = id
    );
