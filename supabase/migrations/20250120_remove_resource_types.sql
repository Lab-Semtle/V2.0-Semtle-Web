-- 자료실 타입 관련 테이블 및 컬럼 제거

-- 1. resources 테이블에서 resource_type_id 컬럼 제거
ALTER TABLE resources DROP COLUMN IF EXISTS resource_type_id;

-- 2. resource_types 테이블 삭제 (관련 데이터가 있다면 먼저 확인)
-- 주의: 이 작업은 되돌릴 수 없으므로 신중하게 실행하세요
DROP TABLE IF EXISTS resource_types CASCADE;

-- 3. 관련 인덱스가 있다면 제거 (자동으로 제거되지만 명시적으로 확인)
-- DROP INDEX IF EXISTS idx_resources_resource_type_id;

-- 4. 관련 제약조건이 있다면 제거 (CASCADE로 자동 제거되지만 확인용)
-- ALTER TABLE resources DROP CONSTRAINT IF EXISTS fk_resources_resource_type_id;

-- 결과 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'resources' 
AND table_schema = 'public'
ORDER BY ordinal_position;
