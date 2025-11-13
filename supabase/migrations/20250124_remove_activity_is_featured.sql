-- 활동 게시판에서 is_featured 컬럼 삭제
-- 더 이상 사용되지 않는 추천 기능 제거

ALTER TABLE activities
DROP COLUMN IF EXISTS is_featured;










