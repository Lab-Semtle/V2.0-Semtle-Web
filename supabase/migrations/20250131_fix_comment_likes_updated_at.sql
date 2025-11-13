-- =============================================
-- 댓글 좋아요 시 updated_at이 변경되지 않도록 수정
-- =============================================
-- 날짜: 2025-01-31
-- 설명: 좋아요 트리거가 댓글 테이블을 업데이트할 때 updated_at이 변경되지 않도록 수정
--       BEFORE UPDATE 트리거를 수정하여 likes_count만 변경된 경우에는 updated_at을 업데이트하지 않음

-- updated_at 트리거 함수 수정: content가 변경되지 않았으면 updated_at을 업데이트하지 않음
CREATE OR REPLACE FUNCTION update_activity_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- content가 실제로 변경되었을 때만 updated_at 업데이트
    -- likes_count만 변경된 경우(좋아요)에는 updated_at을 변경하지 않음
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        NEW.updated_at = NOW();
    ELSE
        -- content가 변경되지 않았으면 updated_at 유지
        NEW.updated_at = OLD.updated_at;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_project_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- content가 실제로 변경되었을 때만 updated_at 업데이트
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        NEW.updated_at = NOW();
    ELSE
        NEW.updated_at = OLD.updated_at;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_resource_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- content가 실제로 변경되었을 때만 updated_at 업데이트
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        NEW.updated_at = NOW();
    ELSE
        NEW.updated_at = OLD.updated_at;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 재생성
DROP TRIGGER IF EXISTS update_activity_comments_updated_at ON activity_comments;
CREATE TRIGGER update_activity_comments_updated_at
    BEFORE UPDATE ON activity_comments
    FOR EACH ROW EXECUTE FUNCTION update_activity_comments_updated_at();

DROP TRIGGER IF EXISTS update_project_comments_updated_at ON project_comments;
CREATE TRIGGER update_project_comments_updated_at
    BEFORE UPDATE ON project_comments
    FOR EACH ROW EXECUTE FUNCTION update_project_comments_updated_at();

DROP TRIGGER IF EXISTS update_resource_comments_updated_at ON resource_comments;
CREATE TRIGGER update_resource_comments_updated_at
    BEFORE UPDATE ON resource_comments
    FOR EACH ROW EXECUTE FUNCTION update_resource_comments_updated_at();

