-- 자료 타입에 색상 컬럼 추가
ALTER TABLE resource_types ADD COLUMN color VARCHAR(7);

-- 기존 자료 타입들에 색상 업데이트
UPDATE resource_types SET color = '#3B82F6' WHERE name = '문서';
UPDATE resource_types SET color = '#10B981' WHERE name = '코드';
UPDATE resource_types SET color = '#EC4899' WHERE name = '이미지';
UPDATE resource_types SET color = '#EF4444' WHERE name = '동영상';
UPDATE resource_types SET color = '#8B5CF6' WHERE name = '프레젠테이션';
UPDATE resource_types SET color = '#F59E0B' WHERE name = '압축파일';
UPDATE resource_types SET color = '#6B7280' WHERE name = '기타';

-- 색상 컬럼을 NOT NULL로 설정 (기본값 포함)
ALTER TABLE resource_types ALTER COLUMN color SET NOT NULL;
ALTER TABLE resource_types ALTER COLUMN color SET DEFAULT '#6B7280';
