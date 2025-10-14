-- resources 테이블에 파일 관련 컬럼 추가
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_extension VARCHAR(10);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS original_filename TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);

-- 컬럼에 코멘트 추가
COMMENT ON COLUMN resources.file_path IS '업로드된 파일의 경로';
COMMENT ON COLUMN resources.file_size IS '파일 크기 (바이트)';
COMMENT ON COLUMN resources.file_extension IS '파일 확장자';
COMMENT ON COLUMN resources.original_filename IS '원본 파일명';
COMMENT ON COLUMN resources.file_type IS '파일 MIME 타입';
