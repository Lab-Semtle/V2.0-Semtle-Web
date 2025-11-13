-- =============================================
-- Activities 테이블 리네임에 따른 트리거 함수 업데이트
-- =============================================
-- 날짜: 2025-01-30
-- 설명: comments_count -> comments_count_cached로 리네임된 것에 맞춰 트리거 함수 수정

-- update_activity_comments_count 함수 업데이트 (답글 제외, parent_id가 NULL인 댓글만 카운팅)
CREATE OR REPLACE FUNCTION update_activity_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT: parent_id가 NULL이고 is_deleted가 false인 댓글만 카운팅
    IF TG_OP = 'INSERT' AND NEW.is_deleted = false AND NEW.parent_id IS NULL THEN
        UPDATE activities SET comments_count_cached = comments_count_cached + 1 WHERE id = NEW.activity_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- parent_id가 NULL인 댓글만 처리
        IF OLD.parent_id IS NULL AND NEW.parent_id IS NULL THEN
            IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
                UPDATE activities SET comments_count_cached = comments_count_cached - 1 WHERE id = NEW.activity_id;
            ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
                UPDATE activities SET comments_count_cached = comments_count_cached + 1 WHERE id = NEW.activity_id;
            END IF;
        END IF;
    -- DELETE: parent_id가 NULL이고 is_deleted가 false인 댓글만 카운팅
    ELSIF TG_OP = 'DELETE' AND OLD.is_deleted = false AND OLD.parent_id IS NULL THEN
        UPDATE activities SET comments_count_cached = comments_count_cached - 1 WHERE id = OLD.activity_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- update_activity_likes_count 함수 업데이트
CREATE OR REPLACE FUNCTION update_activity_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE activities SET likes_count_cached = likes_count_cached + 1 WHERE id = NEW.activity_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE activities SET likes_count_cached = likes_count_cached - 1 WHERE id = OLD.activity_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- update_activity_bookmarks_count 함수 업데이트
CREATE OR REPLACE FUNCTION update_activity_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE activities SET bookmarks_count_cached = bookmarks_count_cached + 1 WHERE id = NEW.activity_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE activities SET bookmarks_count_cached = bookmarks_count_cached - 1 WHERE id = OLD.activity_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

