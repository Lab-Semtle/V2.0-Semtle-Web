-- 자료실 카테고리 업데이트
DELETE FROM resource_categories;
ALTER SEQUENCE resource_categories_id_seq RESTART WITH 1;

INSERT INTO resource_categories (name, description, color, icon, sort_order, is_active) VALUES
('시험지', '기출문제 및 시험 자료', '#EF4444', 'file-text', 1, true),
('강의자료', '강의 슬라이드 및 교재', '#3B82F6', 'book-open', 2, true),
('코드에셋', '프로그래밍 코드 및 프로젝트', '#10B981', 'code', 3, true),
('기타', '기타 분류되지 않는 자료', '#6B7280', 'more-horizontal', 4, true);

-- 결과 확인
SELECT * FROM resource_categories ORDER BY sort_order;
