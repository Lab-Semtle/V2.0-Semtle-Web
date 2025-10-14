-- 자료 파일 테이블 생성 (여러 파일 지원)
CREATE TABLE IF NOT EXISTS resource_files (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    file_extension VARCHAR(10),
    original_filename TEXT NOT NULL,
    file_type VARCHAR(100),
    upload_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_resource_files_resource_id ON resource_files(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_files_upload_order ON resource_files(resource_id, upload_order);

-- RLS 정책 설정
ALTER TABLE resource_files ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "resource_files_select_policy" ON resource_files
    FOR SELECT USING (true);

-- 인증된 사용자만 삽입 가능
CREATE POLICY "resource_files_insert_policy" ON resource_files
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 작성자만 업데이트 가능
CREATE POLICY "resource_files_update_policy" ON resource_files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM resources 
            WHERE resources.id = resource_files.resource_id 
            AND resources.author_id = auth.uid()
        )
    );

-- 작성자만 삭제 가능
CREATE POLICY "resource_files_delete_policy" ON resource_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM resources 
            WHERE resources.id = resource_files.resource_id 
            AND resources.author_id = auth.uid()
        )
    );

-- 코멘트 추가
COMMENT ON TABLE resource_files IS '자료에 첨부된 파일들';
COMMENT ON COLUMN resource_files.resource_id IS '자료 ID';
COMMENT ON COLUMN resource_files.file_path IS '파일 경로';
COMMENT ON COLUMN resource_files.file_size IS '파일 크기 (바이트)';
COMMENT ON COLUMN resource_files.file_extension IS '파일 확장자';
COMMENT ON COLUMN resource_files.original_filename IS '원본 파일명';
COMMENT ON COLUMN resource_files.file_type IS '파일 MIME 타입';
COMMENT ON COLUMN resource_files.upload_order IS '업로드 순서';
