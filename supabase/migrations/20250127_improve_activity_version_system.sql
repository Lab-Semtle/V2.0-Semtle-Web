-- =============================================
-- 활동 게시판 버전 관리 시스템 개선
-- =============================================
-- 날짜: 2025-01-27
-- 설명: 
-- 1. latest_version_id → current_version_id로 변경
-- 2. activity_versions에 버전 타입 및 플래그 추가
-- 3. current_participants 컬럼 제거 (집계 방식으로 변경)
-- 4. status 통합 (private, hidden → restricted)

-- =============================================
-- 1단계: latest_version_id → current_version_id 변경
-- =============================================
-- 컬럼이 존재하고 아직 이름이 변경되지 않았을 때만 변경
DO $$
BEGIN
    -- latest_version_id가 존재하고 current_version_id가 없을 때만 변경
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'latest_version_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'current_version_id'
    ) THEN
        ALTER TABLE public.activities 
            RENAME COLUMN latest_version_id TO current_version_id;
    END IF;
END $$;

-- =============================================
-- 2단계: activity_versions 테이블에 버전 관리 컬럼 추가
-- =============================================

-- version_type 컬럼 추가
ALTER TABLE public.activity_versions
    ADD COLUMN IF NOT EXISTS version_type VARCHAR(20) DEFAULT 'draft'
        CHECK (version_type IN ('draft', 'published', 'snapshot'));

-- version_label 컬럼 추가 (사용자 지정 버전 이름)
ALTER TABLE public.activity_versions
    ADD COLUMN IF NOT EXISTS version_label VARCHAR(100);

-- is_current 플래그 추가 (현재 편집 중인 버전)
ALTER TABLE public.activity_versions
    ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT false;

-- is_published 플래그 추가 (출판된 버전)
ALTER TABLE public.activity_versions
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- =============================================
-- 3단계: 기존 버전 데이터에 값 설정
-- =============================================

-- 기존 버전들의 version_type 및 플래그 설정
-- current_version_id 또는 latest_version_id 중 존재하는 것을 사용
DO $$
DECLARE
    has_current_version_id BOOLEAN;
BEGIN
    -- current_version_id 컬럼 존재 여부 확인
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'current_version_id'
    ) INTO has_current_version_id;

    IF has_current_version_id THEN
        -- current_version_id 사용
        UPDATE public.activity_versions av
        SET 
            version_type = CASE
                WHEN EXISTS (
                    SELECT 1 FROM public.activities a 
                    WHERE a.id = av.activity_id 
                    AND a.published_version_id = av.id
                ) THEN 'published'
                ELSE 'draft'
            END,
            is_current = CASE
                WHEN EXISTS (
                    SELECT 1 FROM public.activities a 
                    WHERE a.id = av.activity_id 
                    AND a.current_version_id = av.id
                ) THEN true
                ELSE false
            END,
            is_published = CASE
                WHEN EXISTS (
                    SELECT 1 FROM public.activities a 
                    WHERE a.id = av.activity_id 
                    AND a.published_version_id = av.id
                ) THEN true
                ELSE false
            END;
    ELSE
        -- latest_version_id 사용 (fallback)
        UPDATE public.activity_versions av
        SET 
            version_type = CASE
                WHEN EXISTS (
                    SELECT 1 FROM public.activities a 
                    WHERE a.id = av.activity_id 
                    AND a.published_version_id = av.id
                ) THEN 'published'
                ELSE 'draft'
            END,
            is_current = CASE
                WHEN EXISTS (
                    SELECT 1 FROM public.activities a 
                    WHERE a.id = av.activity_id 
                    AND (SELECT latest_version_id FROM public.activities WHERE id = av.activity_id) = av.id
                ) THEN true
                ELSE false
            END,
            is_published = CASE
                WHEN EXISTS (
                    SELECT 1 FROM public.activities a 
                    WHERE a.id = av.activity_id 
                    AND a.published_version_id = av.id
                ) THEN true
                ELSE false
            END;
    END IF;
END $$;

-- =============================================
-- 4단계: 인덱스 추가 (성능 최적화)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_activity_versions_current 
    ON public.activity_versions(activity_id, is_current) 
    WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_activity_versions_published 
    ON public.activity_versions(activity_id, is_published) 
    WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_activity_versions_type 
    ON public.activity_versions(activity_id, version_type);

-- =============================================
-- 5단계: current_participants 컬럼 제거
-- =============================================
-- 참가자 수는 activity_participants 테이블에서 집계하므로 중복 컬럼 제거

ALTER TABLE public.activities
    DROP COLUMN IF EXISTS current_participants;

-- =============================================
-- 6단계: status 값 통합 (private, hidden → restricted)
-- =============================================

-- private와 hidden을 restricted로 통합
UPDATE public.activities
SET status = 'restricted'
WHERE status IN ('private', 'hidden');

-- =============================================
-- 7단계: 제약조건 추가
-- =============================================

-- activities 테이블의 status 제약조건 업데이트
-- (기존 CHECK 제약조건이 있다면 제거 후 재생성)
DO $$
BEGIN
    -- 기존 제약조건 제거 (있다면)
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'activities_status_check'
    ) THEN
        ALTER TABLE public.activities DROP CONSTRAINT activities_status_check;
    END IF;
    
    -- 새 제약조건 추가
    ALTER TABLE public.activities
        ADD CONSTRAINT activities_status_check 
        CHECK (status IN ('draft', 'published', 'restricted'));
END $$;

-- =============================================
-- 8단계: 트리거 업데이트 (current_version_id 자동 업데이트)
-- =============================================

-- 기존 트리거 확인 및 업데이트
DROP TRIGGER IF EXISTS update_activity_latest_version_trigger ON public.activity_versions;
DROP TRIGGER IF EXISTS update_activity_current_version_trigger ON public.activity_versions;

CREATE OR REPLACE FUNCTION public.update_activity_current_version()
RETURNS TRIGGER AS $$
BEGIN
    -- 새 버전이 생성되고 is_current = true로 설정되면
    IF NEW.is_current = true THEN
        -- 기존 current_version을 false로 변경
        UPDATE public.activity_versions
        SET is_current = false
        WHERE activity_id = NEW.activity_id
        AND id != NEW.id
        AND is_current = true;
        
        -- activities 테이블의 current_version_id 업데이트
        -- current_version_id 또는 latest_version_id 중 존재하는 컬럼 사용
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'activities' 
            AND column_name = 'current_version_id'
        ) THEN
            UPDATE public.activities
            SET current_version_id = NEW.id,
                updated_at = NOW()
            WHERE id = NEW.activity_id;
        ELSIF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'activities' 
            AND column_name = 'latest_version_id'
        ) THEN
            UPDATE public.activities
            SET latest_version_id = NEW.id,
                updated_at = NOW()
            WHERE id = NEW.activity_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (이미 존재하는 경우 재생성)
DROP TRIGGER IF EXISTS update_activity_current_version_trigger ON public.activity_versions;

CREATE TRIGGER update_activity_current_version_trigger
AFTER INSERT OR UPDATE ON public.activity_versions
FOR EACH ROW
WHEN (NEW.is_current = true)
EXECUTE FUNCTION public.update_activity_current_version();

-- =============================================
-- 9단계: 마이그레이션 완료 로그
-- =============================================
DO $$
DECLARE
    version_count INTEGER;
    current_version_count INTEGER;
    published_version_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO version_count FROM public.activity_versions;
    SELECT COUNT(*) INTO current_version_count FROM public.activity_versions WHERE is_current = true;
    SELECT COUNT(*) INTO published_version_count FROM public.activity_versions WHERE is_published = true;
    
    RAISE NOTICE '활동 게시판 버전 관리 시스템 개선 마이그레이션 완료';
    RAISE NOTICE '전체 버전 수: %', version_count;
    RAISE NOTICE '현재 편집 중인 버전 수: %', current_version_count;
    RAISE NOTICE '출판된 버전 수: %', published_version_count;
END $$;

