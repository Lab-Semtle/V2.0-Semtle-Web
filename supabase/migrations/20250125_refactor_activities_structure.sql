-- =============================================
-- Activities 테이블 구조 개선 마이그레이션
-- =============================================
-- 날짜: 2025-01-25
-- 설명: activities 테이블에서 게시물 내용 관련 컬럼들을 제거하고,
--       activity_versions 테이블에만 저장하도록 구조 개선
--       기존 데이터는 버전 테이블로 마이그레이션

-- 1. 기존 데이터를 activity_versions로 마이그레이션 (아직 버전이 없는 경우)
--    published_version_id나 latest_version_id가 없는 활동에 대해 첫 버전 생성
INSERT INTO public.activity_versions (
    activity_id,
    content,
    title,
    subtitle,
    thumbnail,
    category_id,
    location,
    start_date,
    end_date,
    max_participants,
    participation_fee,
    contact_info,
    tags,
    has_voting,
    vote_options,
    vote_deadline,
    version_number,
    created_at,
    updated_at
)
SELECT 
    id as activity_id,
    content,
    title,
    subtitle,
    thumbnail,
    category_id,
    location,
    start_date,
    end_date,
    max_participants,
    participation_fee,
    contact_info,
    tags,
    has_voting,
    vote_options,
    vote_deadline,
    1 as version_number,
    created_at,
    updated_at
FROM public.activities
WHERE id NOT IN (
    -- 이미 버전이 있는 활동 제외
    SELECT DISTINCT activity_id FROM public.activity_versions
)
AND (
    -- published_version_id가 없거나
    published_version_id IS NULL
    OR
    -- latest_version_id가 없는 경우
    latest_version_id IS NULL
);

-- 2. 마이그레이션된 버전으로 published_version_id와 latest_version_id 업데이트
UPDATE public.activities a
SET 
    published_version_id = (
        SELECT id FROM public.activity_versions av
        WHERE av.activity_id = a.id
        ORDER BY av.version_number ASC
        LIMIT 1
    ),
    latest_version_id = (
        SELECT id FROM public.activity_versions av
        WHERE av.activity_id = a.id
        ORDER BY av.version_number DESC
        LIMIT 1
    )
WHERE (published_version_id IS NULL OR latest_version_id IS NULL)
AND EXISTS (
    SELECT 1 FROM public.activity_versions av
    WHERE av.activity_id = a.id
);

-- 3. status가 'published'인 경우 published_version_id 설정
UPDATE public.activities a
SET published_version_id = a.latest_version_id
WHERE a.status = 'published'
AND a.published_version_id IS NULL
AND a.latest_version_id IS NOT NULL;

-- 4. activities 테이블에서 게시물 내용 관련 컬럼들을 NULL 허용으로 변경
--    (기존 데이터는 유지하되, 새 데이터는 NULL로 저장)
ALTER TABLE public.activities 
    ALTER COLUMN title DROP NOT NULL,
    ALTER COLUMN subtitle DROP NOT NULL,
    ALTER COLUMN content DROP NOT NULL;

-- 5. 컬럼에 NULL 기본값 설정 (선택적)
--    실제로는 이 컬럼들을 사용하지 않지만, 기존 데이터와의 호환성을 위해 유지
--    새로운 코드에서는 이 컬럼들을 사용하지 않고 버전 테이블에서만 조회

-- 참고: 완전히 컬럼을 삭제하지 않는 이유:
-- 1. 기존 데이터와의 호환성 유지
-- 2. 다른 시스템이나 스크립트에서 참조할 수 있음
-- 3. 점진적 마이그레이션 가능
-- 
-- 완전히 제거하고 싶다면 별도 마이그레이션으로 진행 가능:
-- ALTER TABLE activities DROP COLUMN title;
-- ALTER TABLE activities DROP COLUMN subtitle;
-- ALTER TABLE activities DROP COLUMN content;
-- ... 등등

-- 6. 마이그레이션 완료 로그
DO $$
DECLARE
    migrated_count INTEGER;
    version_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count
    FROM public.activities
    WHERE published_version_id IS NOT NULL OR latest_version_id IS NOT NULL;
    
    SELECT COUNT(*) INTO version_count
    FROM public.activity_versions;
    
    RAISE NOTICE '활동 테이블 구조 개선 마이그레이션 완료';
    RAISE NOTICE '마이그레이션된 활동 수: %', migrated_count;
    RAISE NOTICE '전체 버전 수: %', version_count;
END $$;


