-- resource_downloads 트리거 재생성
-- 다운로드 수 자동 증가 트리거

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS update_resource_downloads_count_trigger ON resource_downloads;

-- 트리거 함수 재생성
CREATE OR REPLACE FUNCTION update_resource_downloads_count()
RETURNS TRIGGER AS $$
BEGIN
    -- resource_downloads 테이블에 INSERT될 때마다 해당 자료의 downloads_count 증가
    UPDATE resources SET downloads_count = downloads_count + 1 WHERE id = NEW.resource_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 재생성
CREATE TRIGGER update_resource_downloads_count_trigger
    AFTER INSERT ON resource_downloads
    FOR EACH ROW EXECUTE FUNCTION update_resource_downloads_count();

-- 트리거 테스트를 위한 코멘트
COMMENT ON FUNCTION update_resource_downloads_count() IS 'resource_downloads 테이블에 INSERT될 때 resources.downloads_count를 자동으로 증가시키는 트리거 함수';
COMMENT ON TRIGGER update_resource_downloads_count_trigger ON resource_downloads IS '다운로드 수 자동 증가 트리거';
