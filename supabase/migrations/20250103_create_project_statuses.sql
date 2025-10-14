-- 프로젝트 상태 테이블 생성 (기존 project_status 컬럼과 연동)
CREATE TABLE IF NOT EXISTS project_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL DEFAULT 'bg-gray-100 text-gray-800',
    icon VARCHAR(50) NOT NULL DEFAULT 'AlertCircle',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 프로젝트 상태 데이터 삽입 (기존 project_status 값들과 매칭)
INSERT INTO project_statuses (name, display_name, color, icon, description, sort_order) VALUES
('recruiting', '모집중', 'bg-blue-100 text-blue-800', 'Users', '팀원을 모집하고 있는 상태', 1),
('active', '진행중', 'bg-green-100 text-green-800', 'CheckCircle', '프로젝트가 진행 중인 상태', 2),
('completed', '완료', 'bg-gray-100 text-gray-800', 'CheckCircle', '프로젝트가 완료된 상태', 3),
('cancelled', '취소됨', 'bg-red-100 text-red-800', 'XCircle', '프로젝트가 취소된 상태', 4)
ON CONFLICT (name) DO NOTHING;

-- projects 테이블에 외래키 제약조건 추가
ALTER TABLE projects 
ADD CONSTRAINT fk_projects_project_status 
FOREIGN KEY (project_status) REFERENCES project_statuses(name) ON DELETE SET NULL;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_project_statuses_name ON project_statuses (name);
CREATE INDEX IF NOT EXISTS idx_project_statuses_is_active ON project_statuses (is_active);

-- RLS 정책 설정
ALTER TABLE project_statuses ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Allow public read access to project statuses" ON project_statuses;
DROP POLICY IF EXISTS "Allow authenticated users to read all project_statuses" ON project_statuses;

CREATE POLICY "Allow public read access to project statuses"
ON project_statuses FOR SELECT
TO public
USING (is_active = true);

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Allow authenticated users to read all project statuses" ON project_statuses;

CREATE POLICY "Allow authenticated users to read all project statuses"
ON project_statuses FOR SELECT
TO authenticated
USING (true);
