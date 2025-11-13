-- =============================================
-- resource_likes 테이블 RLS 정책 확인 및 재생성
-- =============================================
-- 날짜: 2025-02-01
-- 설명: resource_likes 테이블의 RLS 정책이 올바르게 설정되어 있는지 확인하고 재생성

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Anyone can view resource likes" ON public.resource_likes;
DROP POLICY IF EXISTS "Users can like resources" ON public.resource_likes;
DROP POLICY IF EXISTS "Users can unlike resources" ON public.resource_likes;

-- SELECT 정책: 모든 사용자가 좋아요 조회 가능
CREATE POLICY "Anyone can view resource likes" ON public.resource_likes
    FOR SELECT USING (true);

-- INSERT 정책: 인증된 사용자는 자신의 좋아요만 추가 가능
CREATE POLICY "Users can like resources" ON public.resource_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE 정책: 인증된 사용자는 자신의 좋아요만 삭제 가능
CREATE POLICY "Users can unlike resources" ON public.resource_likes
    FOR DELETE USING (auth.uid() = user_id);

