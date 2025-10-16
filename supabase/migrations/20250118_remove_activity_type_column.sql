-- activity_type_id 컬럼 제거
ALTER TABLE activities DROP COLUMN IF EXISTS activity_type_id;

-- activity_types 테이블 제거 (더 이상 사용되지 않음)
DROP TABLE IF EXISTS activity_types CASCADE;

-- 제거 완료 로그
DO $$
BEGIN
    RAISE NOTICE 'activity_type_id 컬럼과 activity_types 테이블이 성공적으로 제거되었습니다.';
    RAISE NOTICE '활동 타입 기능이 완전히 제거되었습니다.';
END $$;
