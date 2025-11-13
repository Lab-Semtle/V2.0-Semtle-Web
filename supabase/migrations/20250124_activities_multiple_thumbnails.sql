-- 활동 게시판에서 여러 대표 이미지를 지원하도록 thumbnail 컬럼 변경
-- TEXT에서 TEXT[]로 변경

-- 1. 임시 컬럼 추가
ALTER TABLE activities ADD COLUMN thumbnail_new TEXT[];

-- 2. 기존 데이터 마이그레이션 (단일 이미지를 배열로 변환)
UPDATE activities 
SET thumbnail_new = CASE 
    WHEN thumbnail IS NULL OR thumbnail = '' THEN NULL
    ELSE ARRAY[thumbnail]
END
WHERE thumbnail IS NOT NULL;

-- 3. 기존 컬럼 삭제
ALTER TABLE activities DROP COLUMN thumbnail;

-- 4. 새 컬럼 이름 변경
ALTER TABLE activities RENAME COLUMN thumbnail_new TO thumbnail;

-- 5. 기본값 설정
ALTER TABLE activities ALTER COLUMN thumbnail SET DEFAULT ARRAY[]::TEXT[];

