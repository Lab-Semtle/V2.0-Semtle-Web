-- 프로젝트 타입에 색상 컬럼 추가
-- 생성일: 2025-01-15

-- project_types 테이블에 color 컬럼 추가
ALTER TABLE project_types ADD COLUMN color VARCHAR(7) DEFAULT '#3B82F6';

-- 기존 프로젝트 타입들에 색상 업데이트
UPDATE project_types SET color = '#3B82F6' WHERE name = '개인프로젝트';  -- 파란색
UPDATE project_types SET color = '#10B981' WHERE name = '팀프로젝트';     -- 초록색
UPDATE project_types SET color = '#F59E0B' WHERE name = '해커톤';        -- 주황색
UPDATE project_types SET color = '#EC4899' WHERE name = '공모전';       -- 핑크색
UPDATE project_types SET color = '#8B5CF6' WHERE name = '연구프로젝트';  -- 보라색
UPDATE project_types SET color = '#EF4444' WHERE name = '상업프로젝트';  -- 빨간색
UPDATE project_types SET color = '#6366F1' WHERE name = '오픈소스';     -- 인디고색

-- 색상 컬럼을 NOT NULL로 변경
ALTER TABLE project_types ALTER COLUMN color SET NOT NULL;
