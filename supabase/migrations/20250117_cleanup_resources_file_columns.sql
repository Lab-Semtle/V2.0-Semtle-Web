-- resources 테이블 파일 관련 컬럼 정리 및 새로운 구조로 전환
-- 기존 파일 관련 컬럼들을 제거하고 resource_files 테이블 사용

-- 1. 기존 파일 관련 컬럼들 제거 (이미 추가된 컬럼들도 포함)
ALTER TABLE resources DROP COLUMN IF EXISTS file_url;
ALTER TABLE resources DROP COLUMN IF EXISTS file_size;
ALTER TABLE resources DROP COLUMN IF EXISTS file_extension;
ALTER TABLE resources DROP COLUMN IF EXISTS original_filename;
ALTER TABLE resources DROP COLUMN IF EXISTS file_path;
ALTER TABLE resources DROP COLUMN IF EXISTS file_type;

-- 2. 기존 데이터를 resource_files 테이블로 마이그레이션 (있는 경우)
-- 주의: 이 부분은 기존 데이터가 있을 때만 실행하세요
-- INSERT INTO resource_files (resource_id, file_path, file_size, file_extension, original_filename, file_type, upload_order)
-- SELECT 
--     id as resource_id,
--     file_path,
--     file_size,
--     file_extension,
--     original_filename,
--     file_type,
--     1 as upload_order
-- FROM resources 
-- WHERE file_path IS NOT NULL AND file_path != '';

-- 3. 코멘트 업데이트
COMMENT ON TABLE resources IS '자료실 게시물 (파일은 resource_files 테이블에서 관리)';
COMMENT ON TABLE resource_files IS '자료에 첨부된 파일들 (여러 파일 지원)';

-- 4. 기존 파일 관련 컬럼 코멘트 제거 (이미 제거된 컬럼들)
-- COMMENT ON COLUMN resources.file_path IS '업로드된 파일의 경로';
-- COMMENT ON COLUMN resources.file_size IS '파일 크기 (바이트)';
-- COMMENT ON COLUMN resources.file_extension IS '파일 확장자';
-- COMMENT ON COLUMN resources.original_filename IS '원본 파일명';
-- COMMENT ON COLUMN resources.file_type IS '파일 MIME 타입';
