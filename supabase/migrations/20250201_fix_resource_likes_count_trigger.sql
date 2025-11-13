-- =============================================
-- resource_likes_count 트리거 함수 수정
-- =============================================
-- 날짜: 2025-02-01
-- 설명: resources 테이블의 컬럼명이 likes_count에서 likes_count_cached로 변경되었으므로
--       트리거 함수도 업데이트

-- 자료실 게시판 좋아요 카운트 업데이트 함수 수정
CREATE OR REPLACE FUNCTION update_resource_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE resources SET likes_count_cached = likes_count_cached + 1 WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE resources SET likes_count_cached = GREATEST(likes_count_cached - 1, 0) WHERE id = OLD.resource_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

