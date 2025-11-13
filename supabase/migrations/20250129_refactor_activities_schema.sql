-- =============================================
-- Activities 테이블 구조 개편 (빈 데이터 전제)
-- =============================================
-- 날짜: 2025-01-29
-- 설명: 
-- 1. activities 테이블을 출판 상태/포인터만 관리하도록 단순화
-- 2. activity_versions 테이블에서 상태 플래그 제거, 계보 추적 추가
-- 3. 버전 코드 시스템 도입
-- 4. 모든 데이터가 비어있다는 전제 하에 실행

-- =============================================
-- 0단계: ENUM 타입 준비
-- =============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_status') THEN
        CREATE TYPE activity_status AS ENUM ('draft', 'public', 'private');
    END IF;
END $$;

-- =============================================
-- 1단계: 기존 RLS 정책 삭제 (타입 변경 전 필수)
-- =============================================

-- activities 테이블의 기존 정책 모두 삭제
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN
        SELECT policyname FROM pg_policies WHERE tablename = 'activities'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.activities', pol_name);
    END LOOP;
END $$;

-- activity_versions 테이블의 기존 정책 모두 삭제
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN
        SELECT policyname FROM pg_policies WHERE tablename = 'activity_versions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.activity_versions', pol_name);
    END LOOP;
END $$;

-- =============================================
-- 2단계: activities 테이블 트리거 및 제약조건 정리
-- =============================================

-- updated_at 관련 트리거 먼저 삭제 (컬럼 제거 전에 필수)
-- 이전 마이그레이션(20250101_complete_system.sql)에서 생성된 트리거 삭제
DROP TRIGGER IF EXISTS update_activities_updated_at ON public.activities;

-- 추가로 다른 이름으로 등록된 updated_at 관련 트리거 찾아서 삭제
DO $$
DECLARE
    trig_name TEXT;
BEGIN
    -- activities 테이블에 연결된 모든 트리거 중 updated_at 관련 트리거만 찾아서 삭제
    FOR trig_name IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'activities'
        AND event_object_schema = 'public'
        AND trigger_name LIKE '%updated_at%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.activities', trig_name);
    END LOOP;
END $$;

-- =============================================
-- 3단계: activities 테이블 컬럼 정렬
-- =============================================

-- status: ENUM 강제
DO $$
BEGIN
    -- 기존 status 컬럼이 있고 ENUM이 아니면 변환
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'activities'
        AND column_name = 'status' 
        AND data_type <> 'USER-DEFINED'
    ) THEN
        -- DEFAULT 제약조건 먼저 제거
        ALTER TABLE public.activities
            ALTER COLUMN status DROP DEFAULT;
        
        -- VARCHAR 등으로 되어 있다면 ENUM으로 변경
        -- 기존 값 변환: 'published' -> 'public', 'restricted'/'private'/'hidden' -> 'private', 'draft' -> 'draft'
        ALTER TABLE public.activities
            ALTER COLUMN status TYPE activity_status
            USING CASE
                WHEN status = 'published' THEN 'public'::activity_status
                WHEN status IN ('restricted', 'private', 'hidden') THEN 'private'::activity_status
                WHEN status = 'draft' THEN 'draft'::activity_status
                ELSE 'draft'::activity_status
            END;
        
        -- DEFAULT 다시 설정
        ALTER TABLE public.activities
            ALTER COLUMN status SET DEFAULT 'draft'::activity_status;
    END IF;
    
    -- status 컬럼이 없으면 새로 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.activities
            ADD COLUMN status activity_status NOT NULL DEFAULT 'draft'::activity_status;
    END IF;
    
    -- NOT NULL 및 DEFAULT 강제 (이미 ENUM이면)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'activities'
        AND column_name = 'status'
        AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE public.activities
            ALTER COLUMN status SET NOT NULL,
            ALTER COLUMN status SET DEFAULT 'draft'::activity_status;
    END IF;
END $$;

-- 출판 포인터/타임스탬프/핀 여부 컬럼 추가
ALTER TABLE public.activities
    ADD COLUMN IF NOT EXISTS published_version_id BIGINT,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS republished_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;

-- 불필요한 컬럼 제거
ALTER TABLE public.activities
    DROP COLUMN IF EXISTS current_version_id,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- 카운터 컬럼을 캐시명으로 리네이밍
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'likes_count'
    ) THEN
        ALTER TABLE public.activities RENAME COLUMN likes_count TO likes_count_cached;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'bookmarks_count'
    ) THEN
        ALTER TABLE public.activities RENAME COLUMN bookmarks_count TO bookmarks_count_cached;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'comments_count'
    ) THEN
        ALTER TABLE public.activities RENAME COLUMN comments_count TO comments_count_cached;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'views'
    ) THEN
        ALTER TABLE public.activities RENAME COLUMN views TO views_count_cached;
    END IF;
END $$;

-- =============================================
-- 4단계: activity_versions 테이블 정렬
-- =============================================

-- 필수 컬럼 추가
ALTER TABLE public.activity_versions
    ADD COLUMN IF NOT EXISTS activity_id BIGINT,
    ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS version_number INTEGER,
    ADD COLUMN IF NOT EXISTS version_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS parent_version_id BIGINT,
    ADD COLUMN IF NOT EXISTS version_label VARCHAR(100);

-- 콘텐츠 필드 추가
ALTER TABLE public.activity_versions
    ADD COLUMN IF NOT EXISTS title VARCHAR(200),
    ADD COLUMN IF NOT EXISTS subtitle TEXT,
    ADD COLUMN IF NOT EXISTS content JSONB,
    ADD COLUMN IF NOT EXISTS thumbnail TEXT[],
    ADD COLUMN IF NOT EXISTS category_id INTEGER,
    ADD COLUMN IF NOT EXISTS location VARCHAR(200),
    ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS max_participants INTEGER,
    ADD COLUMN IF NOT EXISTS participation_fee INTEGER DEFAULT 0,  -- INTEGER로 유지 (기존 스키마 확인)
    ADD COLUMN IF NOT EXISTS contact_info VARCHAR(200),
    ADD COLUMN IF NOT EXISTS tags TEXT[],
    ADD COLUMN IF NOT EXISTS has_voting BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS vote_options JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS vote_deadline TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 불필요한 플래그 제거 (트리거 먼저 삭제 필요)
-- is_current 컬럼을 사용하는 트리거 먼저 삭제
DROP TRIGGER IF EXISTS update_activity_current_version_trigger ON public.activity_versions;
DROP TRIGGER IF EXISTS update_activity_latest_version_trigger ON public.activity_versions;

-- 트리거 함수도 삭제
DROP FUNCTION IF EXISTS public.update_activity_current_version();
DROP FUNCTION IF EXISTS public.update_activity_latest_version();

-- 이제 컬럼 삭제 가능
ALTER TABLE public.activity_versions
    DROP COLUMN IF EXISTS is_published,
    DROP COLUMN IF EXISTS is_current,
    DROP COLUMN IF EXISTS version_type;

-- NOT NULL 제약 (빈 데이터 전제이므로 바로 강제 가능)
ALTER TABLE public.activity_versions
    ALTER COLUMN version_number SET NOT NULL,
    ALTER COLUMN version_code SET NOT NULL,
    ALTER COLUMN activity_id SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

-- UNIQUE 제약조건
ALTER TABLE public.activity_versions
    DROP CONSTRAINT IF EXISTS activity_versions_activity_code_unique,
    ADD CONSTRAINT activity_versions_activity_code_unique
        UNIQUE (activity_id, version_code);

ALTER TABLE public.activity_versions
    DROP CONSTRAINT IF EXISTS activity_versions_activity_number_unique,
    ADD CONSTRAINT activity_versions_activity_number_unique
        UNIQUE (activity_id, version_number);

-- =============================================
-- 5단계: FK 제약조건 설정
-- =============================================

-- activities.published_version_id → activity_versions.id (RESTRICT)
DO $$
DECLARE
    fkname text;
BEGIN
    -- 기존 FK 제약조건 찾기
    SELECT c.conname INTO fkname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'activities'
    JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
    WHERE c.contype = 'f'
    AND pg_get_constraintdef(c.oid) LIKE '%published_version_id%';
    
    IF fkname IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.activities DROP CONSTRAINT %I', fkname);
    END IF;
END $$;

ALTER TABLE public.activities
    ADD CONSTRAINT activities_published_version_fkey
    FOREIGN KEY (published_version_id)
    REFERENCES public.activity_versions(id)
    ON DELETE RESTRICT;

-- activity_versions.activity_id → activities.id (CASCADE)
DO $$
DECLARE
    fkname text;
BEGIN
    SELECT c.conname INTO fkname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'activity_versions'
    JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
    WHERE c.contype = 'f'
    AND pg_get_constraintdef(c.oid) LIKE '%activity_id%'
    AND pg_get_constraintdef(c.oid) NOT LIKE '%parent_version_id%';
    
    IF fkname IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.activity_versions DROP CONSTRAINT %I', fkname);
    END IF;
END $$;

ALTER TABLE public.activity_versions
    ADD CONSTRAINT activity_versions_activity_id_fkey
    FOREIGN KEY (activity_id)
    REFERENCES public.activities(id)
    ON DELETE CASCADE;

-- activity_versions.parent_version_id → activity_versions.id (SET NULL)
DO $$
DECLARE
    fkname text;
BEGIN
    SELECT c.conname INTO fkname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'activity_versions'
    JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
    WHERE c.contype = 'f'
    AND pg_get_constraintdef(c.oid) LIKE '%parent_version_id%';
    
    IF fkname IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.activity_versions DROP CONSTRAINT %I', fkname);
    END IF;
END $$;

ALTER TABLE public.activity_versions
    ADD CONSTRAINT activity_versions_parent_version_fkey
    FOREIGN KEY (parent_version_id)
    REFERENCES public.activity_versions(id)
    ON DELETE SET NULL;

-- =============================================
-- 6단계: 상태 ↔ 포인터 정합성 CHECK 제약조건
-- =============================================

-- 기존 CHECK 제약조건 모두 삭제 (이전 마이그레이션에서 생성된 것들 포함)
-- 특히 activities_status_check 제약조건은 이전 마이그레이션에서 생성되었을 수 있음
ALTER TABLE public.activities
    DROP CONSTRAINT IF EXISTS activities_status_check,
    DROP CONSTRAINT IF EXISTS activities_status_version_check;

-- 모든 CHECK 제약조건 찾아서 삭제 (안전하게)
DO $$
DECLARE
    con_name TEXT;
BEGIN
    -- activities 테이블의 모든 CHECK 제약조건 찾아서 삭제
    FOR con_name IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'activities'
        AND constraint_type = 'CHECK'
    LOOP
        EXECUTE format('ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS %I', con_name);
        RAISE NOTICE '삭제된 CHECK 제약조건: %', con_name;
    END LOOP;
END $$;

-- 새로운 CHECK 제약조건 생성
ALTER TABLE public.activities
    ADD CONSTRAINT activities_status_version_check
    CHECK (
        (status = 'draft' AND published_version_id IS NULL) OR
        (status IN ('public', 'private') AND published_version_id IS NOT NULL)
    );

-- =============================================
-- 7단계: 인덱스 생성
-- =============================================

-- activities 테이블 인덱스
-- 공개 정렬용
CREATE INDEX IF NOT EXISTS idx_activities_status_published_at
    ON public.activities(status, published_at DESC);

-- 핀된 글 전용 파셜 인덱스
DROP INDEX IF EXISTS idx_activities_pinned_published_at;
CREATE INDEX IF NOT EXISTS idx_activities_published_at_pinned_true
    ON public.activities(published_at DESC)
    WHERE is_pinned = true;

-- 출판 포인터 조인 최적화
CREATE INDEX IF NOT EXISTS idx_activities_published_version_id
    ON public.activities(published_version_id)
    WHERE published_version_id IS NOT NULL;

-- activity_versions 테이블 인덱스
-- 버전 최신 정렬
CREATE INDEX IF NOT EXISTS idx_activity_versions_activity_number
    ON public.activity_versions(activity_id, version_number DESC);

-- 계보 탐색용
CREATE INDEX IF NOT EXISTS idx_activity_versions_parent
    ON public.activity_versions(parent_version_id)
    WHERE parent_version_id IS NOT NULL;

-- version_code 검색용 (UNIQUE 제약이 인덱스를 포함하지만 별도 인덱스도 유용)
CREATE INDEX IF NOT EXISTS idx_activity_versions_activity_code
    ON public.activity_versions(activity_id, version_code);

-- 기존 불필요한 인덱스 제거
DROP INDEX IF EXISTS idx_activity_versions_current;
DROP INDEX IF EXISTS idx_activity_versions_published;
DROP INDEX IF EXISTS idx_activity_versions_type;

-- =============================================
-- 8단계: 트리거 함수 생성
-- =============================================

-- published_at은 최초 출판 시만 설정, republished_at은 재출판 시마다 갱신
CREATE OR REPLACE FUNCTION public.set_publish_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- 최초 출판: draft -> public/private
    IF NEW.status IN ('public', 'private')
       AND (OLD.status IS DISTINCT FROM NEW.status)
       AND (OLD.status IS NULL OR OLD.status = 'draft')
       AND NEW.published_at IS NULL THEN
        NEW.published_at := NOW();
        NEW.republished_at := NOW();
    -- 재출판: published_version_id 변경 시
    ELSIF NEW.published_version_id IS DISTINCT FROM OLD.published_version_id
          AND NEW.published_version_id IS NOT NULL THEN
        NEW.republished_at := NOW();
        -- published_at은 변경하지 않음 (불변)
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- UPDATE 트리거
DROP TRIGGER IF EXISTS trg_activities_publish_ts_upd ON public.activities;
CREATE TRIGGER trg_activities_publish_ts_upd
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.set_publish_timestamps();

-- INSERT 트리거
CREATE OR REPLACE FUNCTION public.set_publish_timestamps_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('public', 'private') AND NEW.published_at IS NULL THEN
        NEW.published_at := NOW();
        NEW.republished_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activities_publish_ts_ins ON public.activities;
CREATE TRIGGER trg_activities_publish_ts_ins
    BEFORE INSERT ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.set_publish_timestamps_on_insert();

-- =============================================
-- 9단계: 기본값 설정 확인
-- =============================================

-- activities 테이블 기본값
ALTER TABLE public.activities
    ALTER COLUMN status SET DEFAULT 'draft',
    ALTER COLUMN is_pinned SET DEFAULT false;

-- activity_versions 테이블 기본값
ALTER TABLE public.activity_versions
    ALTER COLUMN has_voting SET DEFAULT false,
    ALTER COLUMN vote_options SET DEFAULT '[]',
    ALTER COLUMN participation_fee SET DEFAULT 0,
    ALTER COLUMN tags SET DEFAULT '{}',
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

-- =============================================
-- 10단계: RLS 정책 설정 (타입 변경 후)
-- =============================================

-- RLS 활성화 확인
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_versions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Activities 테이블 RLS 정책 (새로 생성)
-- =============================================

-- SELECT 정책: 
-- - status='public': 모든 사용자 조회 가능
-- - status='private': 관리자/권한자만 조회 가능
-- - status='draft': 작성자/관리자만 조회 가능
CREATE POLICY "Public activities are visible to all, private/draft to admins or authors"
ON public.activities FOR SELECT
USING (
    -- 공개 게시물은 모두 조회 가능
    status = 'public'
    OR
    -- 비공개 게시물은 관리자만 조회 가능
    (status = 'private' AND EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    ))
    OR
    -- 초안 게시물은 작성자 또는 관리자만 조회 가능
    (status = 'draft' AND (
        auth.uid() IS NOT NULL 
        AND (
            author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role IN ('admin', 'super_admin')
            )
        )
    ))
);

-- INSERT 정책: 관리자만 작성 가능
CREATE POLICY "Only admins can create activities"
ON public.activities FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- UPDATE 정책: 모든 관리자가 모든 게시물 수정 가능
CREATE POLICY "All admins can update any activity"
ON public.activities FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- DELETE 정책: 모든 관리자가 모든 게시물 삭제 가능
CREATE POLICY "All admins can delete any activity"
ON public.activities FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- =============================================
-- Activity Versions 테이블 RLS 정책 (새로 생성)
-- =============================================

-- SELECT 정책:
-- - 출판된 활동(status='public')의 버전: 모든 사용자 조회 가능
-- - 비공개 활동(status='private')의 버전: 관리자만 조회 가능
-- - 초안 활동(status='draft')의 버전: 작성자/관리자만 조회 가능
CREATE POLICY "Versions visible based on parent activity status and admin access"
ON public.activity_versions FOR SELECT
USING (
    -- 관리자는 모든 버전 조회 가능
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
    OR
    -- 공개 활동의 버전은 모두 조회 가능
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND activities.status = 'public'
    )
    OR
    -- 비공개 활동의 버전은 관리자만 조회 가능 (위에서 이미 체크됨)
    -- 초안 활동의 버전은 작성자 또는 관리자만 조회 가능
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND (
            activities.status = 'private'
            OR (
                activities.status = 'draft'
                AND activities.author_id = auth.uid()
            )
        )
    )
    OR
    -- 작성자가 직접 작성한 버전은 조회 가능
    (author_id IS NOT NULL AND author_id = auth.uid())
);

-- INSERT 정책: 관리자만 버전 생성 가능
CREATE POLICY "Only admins can create versions"
ON public.activity_versions FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- UPDATE 정책: 모든 관리자가 모든 버전 수정 가능
CREATE POLICY "All admins can update any version"
ON public.activity_versions FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- DELETE 정책: 모든 관리자가 버전 삭제 가능 (단, published_version_id로 설정된 버전은 제외)
CREATE POLICY "All admins can delete versions except published ones"
ON public.activity_versions FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
    -- 출판 중인 버전은 삭제 불가 (RESTRICT FK로도 보호됨)
    AND NOT EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.published_version_id = activity_versions.id
    )
);

-- =============================================
-- 11단계: RLS 정책 확인
-- =============================================

DO $$
DECLARE
    activities_policies_count INTEGER;
    versions_policies_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO activities_policies_count
    FROM pg_policies
    WHERE tablename = 'activities';
    
    SELECT COUNT(*) INTO versions_policies_count
    FROM pg_policies
    WHERE tablename = 'activity_versions';
    
    RAISE NOTICE 'RLS 정책 설정 완료';
    RAISE NOTICE 'activities 테이블 정책 수: %', activities_policies_count;
    RAISE NOTICE 'activity_versions 테이블 정책 수: %', versions_policies_count;
END $$;
