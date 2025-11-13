-- =============================================
-- Activities 테이블에서 내용 관련 컬럼 완전 제거
-- =============================================
-- 날짜: 2025-01-25
-- 설명: activities 테이블에서 게시물 내용 관련 컬럼들을 완전히 제거
--       주의: 이 마이그레이션은 20250125_refactor_activities_structure.sql 이후에 실행해야 함
--       기존 데이터가 모두 activity_versions로 마이그레이션된 후에만 실행 가능

-- 1. 게시물 내용 관련 컬럼 제거
ALTER TABLE public.activities 
    DROP COLUMN IF EXISTS title,
    DROP COLUMN IF EXISTS subtitle,
    DROP COLUMN IF EXISTS content,
    DROP COLUMN IF EXISTS thumbnail,
    DROP COLUMN IF EXISTS category_id,
    DROP COLUMN IF EXISTS location,
    DROP COLUMN IF EXISTS start_date,
    DROP COLUMN IF EXISTS end_date,
    DROP COLUMN IF EXISTS max_participants,
    DROP COLUMN IF EXISTS participation_fee,
    DROP COLUMN IF EXISTS contact_info,
    DROP COLUMN IF EXISTS tags,
    DROP COLUMN IF EXISTS has_voting,
    DROP COLUMN IF EXISTS vote_options,
    DROP COLUMN IF EXISTS vote_deadline;

-- 2. 제거 완료 로그
DO $$
BEGIN
    RAISE NOTICE 'activities 테이블에서 게시물 내용 관련 컬럼들이 성공적으로 제거되었습니다.';
    RAISE NOTICE '이제 모든 게시물 내용은 activity_versions 테이블에서만 관리됩니다.';
END $$;


