-- 1. 기존 프로젝트 타입 데이터 모두 삭제
DELETE FROM project_types;

-- 2. ID 시퀀스 초기화 (선택 사항, 새 데이터 삽입 시 ID를 1부터 다시 시작)
ALTER SEQUENCE project_types_id_seq RESTART WITH 1;

-- 3. 새로운 프로젝트 타입 추가
INSERT INTO project_types (name, description, color, icon, sort_order) VALUES
('머신러닝', '머신러닝 및 딥러닝 프로젝트', '#F59E0B', 'brain', 1),
('컴퓨터비전', '컴퓨터 비전 및 이미지 처리 프로젝트', '#8B5CF6', 'eye', 2),
('자연어처리', '자연어 처리 및 텍스트 분석 프로젝트', '#10B981', 'message-square', 3),
('웹 개발', '웹 애플리케이션 및 프론트엔드/백엔드 개발', '#3B82F6', 'globe', 4),
('모바일 개발', '모바일 앱 개발 (iOS/Android)', '#EF4444', 'smartphone', 5),
('임베디드', '임베디드 시스템 및 IoT 개발', '#6B7280', 'cpu', 6),
('게임 개발', '게임 개발 및 게임 엔진', '#F97316', 'gamepad2', 7),
('데이터', '데이터 분석 및 데이터 시각화', '#06B6D4', 'bar-chart', 8),
('기타', '기타 기술 분야', '#9CA3AF', 'more-horizontal', 9);

-- 4. 변경사항 확인
SELECT * FROM project_types ORDER BY sort_order;
