-- 활동 게시물 카테고리 재구성
-- 기존 카테고리 모두 삭제 후 새로운 카테고리 추가

-- 1. 기존 활동 카테고리 모두 삭제
DELETE FROM activity_categories;

-- 2. 시퀀스 리셋 (ID를 1부터 다시 시작)
ALTER SEQUENCE activity_categories_id_seq RESTART WITH 1;

-- 3. 새로운 활동 카테고리 추가
INSERT INTO activity_categories (name, description, color, icon, sort_order) VALUES
('공지사항', '학회 공지사항 및 안내', '#8B5CF6', 'megaphone', 1),
('이벤트', '학회 이벤트 및 특별 행사', '#EF4444', 'calendar', 2),
('행사', '정기 행사 및 모임', '#10B981', 'users', 3),
('세미나', '학술 세미나 및 발표회', '#F59E0B', 'presentation', 4),
('기타', '기타 활동 및 소식', '#6B7280', 'more-horizontal', 5);

-- 4. 변경사항 확인
SELECT * FROM activity_categories ORDER BY sort_order;
