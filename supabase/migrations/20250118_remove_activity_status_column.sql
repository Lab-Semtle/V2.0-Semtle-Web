-- =============================================
-- 활동 상태 컬럼 제거 마이그레이션
-- =============================================
-- 날짜: 2025-01-18
-- 설명: activities 테이블에서 사용하지 않는 activity_status 컬럼을 제거합니다.
--       활동 상태는 이제 start_date와 end_date를 기준으로 자동 계산됩니다.

-- activity_status 컬럼 제거
ALTER TABLE activities DROP COLUMN IF EXISTS activity_status;

-- 제거 완료 로그
DO $$
BEGIN
    RAISE NOTICE 'activity_status 컬럼이 성공적으로 제거되었습니다.';
    RAISE NOTICE '활동 상태는 이제 start_date와 end_date를 기준으로 자동 계산됩니다.';
END $$;
