-- 1. 기존 프로젝트 카테고리 데이터 모두 삭제
DELETE FROM project_categories;

-- 2. ID 시퀀스 초기화 (선택 사항, 새 데이터 삽입 시 ID를 1부터 다시 시작)
ALTER SEQUENCE project_categories_id_seq RESTART WITH 1;

-- 3. 새로운 프로젝트 카테고리 추가
INSERT INTO project_categories (name, description, color, icon, sort_order) VALUES
('경진대회 및 공모전', '각종 경진대회 및 공모전 참가 프로젝트', '#EF4444', 'trophy', 1),
('해커톤', '해커톤 참가 및 진행 프로젝트', '#10B981', 'code', 2),
('사이드 프로젝트', '개인 또는 팀 사이드 프로젝트', '#3B82F6', 'layers', 3),
('연구', '학술 연구 및 논문 프로젝트', '#8B5CF6', 'microscope', 4),
('기타', '기타 프로젝트 및 활동', '#6B7280', 'more-horizontal', 5);

-- 4. 변경사항 확인
SELECT * FROM project_categories ORDER BY sort_order;
