-- 사용하지 않는 bookmarks 테이블 삭제
-- 현재 시스템에서는 각 게시물 타입별로 별도의 북마크 테이블을 사용:
-- - project_bookmarks (프로젝트 북마크)
-- - resource_bookmarks (자료실 북마크)  
-- - activity_bookmarks (활동 북마크)

-- bookmarks 테이블 삭제
DROP TABLE IF EXISTS public.bookmarks;

-- 관련 인덱스도 함께 삭제 (있다면)
DROP INDEX IF EXISTS idx_bookmarks_user_id;
DROP INDEX IF EXISTS idx_bookmarks_post_id;
DROP INDEX IF EXISTS idx_bookmarks_post_type;
DROP INDEX IF EXISTS idx_bookmarks_user_post;

