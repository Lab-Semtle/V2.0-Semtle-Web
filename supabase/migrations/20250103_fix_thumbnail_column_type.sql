-- thumbnail 컬럼을 TEXT 타입으로 변경하는 마이그레이션
-- base64 이미지 데이터를 저장할 수 있도록 컬럼 크기 제한을 제거합니다.

-- 1. projects 테이블의 thumbnail 컬럼을 TEXT로 변경
ALTER TABLE projects ALTER COLUMN thumbnail TYPE TEXT;

-- 2. activities 테이블의 thumbnail 컬럼을 TEXT로 변경  
ALTER TABLE activities ALTER COLUMN thumbnail TYPE TEXT;

-- 3. resources 테이블의 thumbnail 컬럼을 TEXT로 변경
ALTER TABLE resources ALTER COLUMN thumbnail TYPE TEXT;





