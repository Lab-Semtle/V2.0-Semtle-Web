-- =============================================
-- 댓글 좋아요 카운팅 트리거 생성
-- =============================================
-- 날짜: 2025-01-30
-- 설명: 댓글 좋아요 추가/삭제 시 activity_comments.likes_count 자동 업데이트

-- 활동 게시판 댓글 좋아요 카운트 업데이트 함수
CREATE OR REPLACE FUNCTION update_activity_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE activity_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE activity_comments 
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.comment_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 프로젝트 게시판 댓글 좋아요 카운트 업데이트 함수
CREATE OR REPLACE FUNCTION update_project_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE project_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE project_comments 
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.comment_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 자료실 게시판 댓글 좋아요 카운트 업데이트 함수
CREATE OR REPLACE FUNCTION update_resource_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE resource_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE resource_comments 
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.comment_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 활동 게시판 댓글 좋아요 트리거
DROP TRIGGER IF EXISTS update_activity_comment_likes_count_trigger ON activity_comment_likes;
CREATE TRIGGER update_activity_comment_likes_count_trigger
    AFTER INSERT OR DELETE ON activity_comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_activity_comment_likes_count();

-- 프로젝트 게시판 댓글 좋아요 트리거
DROP TRIGGER IF EXISTS update_project_comment_likes_count_trigger ON project_comment_likes;
CREATE TRIGGER update_project_comment_likes_count_trigger
    AFTER INSERT OR DELETE ON project_comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_project_comment_likes_count();

-- 자료실 게시판 댓글 좋아요 트리거
DROP TRIGGER IF EXISTS update_resource_comment_likes_count_trigger ON resource_comment_likes;
CREATE TRIGGER update_resource_comment_likes_count_trigger
    AFTER INSERT OR DELETE ON resource_comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_resource_comment_likes_count();

