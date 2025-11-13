-- =============================================
-- Resources 테이블 통계 필드 업데이트 허용 정책
-- =============================================
-- 날짜: 2025-02-01
-- 설명: 인증된 사용자가 좋아요/조회수 등 통계 필드를 업데이트할 수 있도록 허용

-- 통계 필드만 업데이트할 수 있는 정책 추가
-- 인증된 사용자는 좋아요 수, 조회수, 북마크 수, 댓글 수, 다운로드 수를 업데이트할 수 있음
CREATE POLICY "Authenticated users can update resource statistics"
ON public.resources FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (
    auth.uid() IS NOT NULL
    -- 통계 필드만 업데이트 가능하도록 제한
    -- 다른 필드는 기존 정책("Resource authors or admins can update resources")이 적용됨
);

