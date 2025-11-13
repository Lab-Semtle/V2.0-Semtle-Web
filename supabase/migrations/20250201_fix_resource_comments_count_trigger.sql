-- =============================================
-- resource_comments_count 트리거 함수 수정
-- =============================================
-- 날짜: 2025-02-01
-- 설명: resources 테이블의 컬럼명이 comments_count에서 comments_count_cached로 변경되었으므로
--       트리거 함수도 업데이트

-- 자료실 게시판 댓글 카운트 업데이트 함수 수정 (답글 제외, parent_id가 NULL인 댓글만 카운팅)
CREATE OR REPLACE FUNCTION update_resource_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT: parent_id가 NULL이고 is_deleted가 false인 댓글만 카운팅
    IF TG_OP = 'INSERT' AND NEW.is_deleted = false AND NEW.parent_id IS NULL THEN
        UPDATE resources SET comments_count_cached = comments_count_cached + 1 WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- parent_id가 NULL인 댓글만 처리
        IF OLD.parent_id IS NULL AND NEW.parent_id IS NULL THEN
            IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
                UPDATE resources SET comments_count_cached = comments_count_cached - 1 WHERE id = NEW.resource_id;
            ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
                UPDATE resources SET comments_count_cached = comments_count_cached + 1 WHERE id = NEW.resource_id;
            END IF;
        END IF;
    -- DELETE: parent_id가 NULL이고 is_deleted가 false인 댓글만 카운팅
    ELSIF TG_OP = 'DELETE' AND OLD.is_deleted = false AND OLD.parent_id IS NULL THEN
        UPDATE resources SET comments_count_cached = GREATEST(comments_count_cached - 1, 0) WHERE id = OLD.resource_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

