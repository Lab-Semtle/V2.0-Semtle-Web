-- =============================================
-- Resources 테이블 구조 개편 (빈 데이터 전제)
-- =============================================
-- 날짜: 2025-01-31
-- 설명: 
-- 1. resources 테이블을 출판 상태/포인터만 관리하도록 단순화
-- 2. resource_versions 테이블에서 상태 플래그 제거, 계보 추적 추가
-- 3. 버전 코드 시스템 도입
-- 4. 모든 데이터가 비어있다는 전제 하에 실행

-- =============================================
-- 0단계: ENUM 타입 준비
-- =============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_status') THEN
        CREATE TYPE resource_status AS ENUM ('draft', 'public', 'private');
    END IF;
END $$;

-- =============================================
-- 1단계: 기존 RLS 정책 삭제 (타입 변경 전 필수)
-- =============================================

-- resources 테이블의 기존 정책 모두 삭제
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN
        SELECT policyname FROM pg_policies WHERE tablename = 'resources'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.resources', pol_name);
    END LOOP;
END $$;

-- resource_versions 테이블의 기존 정책 모두 삭제
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN
        SELECT policyname FROM pg_policies WHERE tablename = 'resource_versions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.resource_versions', pol_name);
    END LOOP;
END $$;

-- =============================================
-- 2단계: resources 테이블 트리거 및 제약조건 정리
-- =============================================

-- updated_at 관련 트리거 먼저 삭제 (컬럼 제거 전에 필수)
DROP TRIGGER IF EXISTS update_resources_updated_at ON public.resources;

-- 추가로 다른 이름으로 등록된 updated_at 관련 트리거 찾아서 삭제
DO $$
DECLARE
    trig_name TEXT;
BEGIN
    FOR trig_name IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'resources'
        AND event_object_schema = 'public'
        AND trigger_name LIKE '%updated_at%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.resources', trig_name);
    END LOOP;
END $$;

-- resource_versions 관련 트리거 삭제
DROP TRIGGER IF EXISTS update_resource_latest_version ON public.resource_versions;
DROP FUNCTION IF EXISTS public.update_resource_latest_version();

-- =============================================
-- 3단계: resources 테이블 컬럼 정리
-- =============================================

-- status: ENUM 강제
DO $$
BEGIN
    -- 기존 status 컬럼이 있고 ENUM이 아니면 변환
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resources'
        AND column_name = 'status' 
        AND data_type <> 'USER-DEFINED'
    ) THEN
        -- DEFAULT 제약조건 먼저 제거
        ALTER TABLE public.resources
            ALTER COLUMN status DROP DEFAULT;
        
        -- VARCHAR 등으로 되어 있다면 ENUM으로 변경
        -- 기존 값 변환: 'published' -> 'public', 'restricted'/'private'/'hidden' -> 'private', 'draft' -> 'draft'
        ALTER TABLE public.resources
            ALTER COLUMN status TYPE resource_status
            USING CASE
                WHEN status = 'published' THEN 'public'::resource_status
                WHEN status IN ('restricted', 'private', 'hidden') THEN 'private'::resource_status
                WHEN status = 'draft' THEN 'draft'::resource_status
                ELSE 'draft'::resource_status
            END;
        
        -- DEFAULT 다시 설정
        ALTER TABLE public.resources
            ALTER COLUMN status SET DEFAULT 'draft'::resource_status;
    END IF;
    
    -- status 컬럼이 없으면 새로 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resources' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.resources
            ADD COLUMN status resource_status NOT NULL DEFAULT 'draft'::resource_status;
    END IF;
    
    -- NOT NULL 및 DEFAULT 강제 (이미 ENUM이면)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resources'
        AND column_name = 'status'
        AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE public.resources
            ALTER COLUMN status SET NOT NULL,
            ALTER COLUMN status SET DEFAULT 'draft'::resource_status;
    END IF;
END $$;

-- 출판 포인터/타임스탬프/핀 여부 컬럼 추가
ALTER TABLE public.resources
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS republished_at TIMESTAMPTZ;

-- published_version_id는 이미 존재할 수 있으므로 확인 후 처리
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resources' 
        AND column_name = 'published_version_id'
    ) THEN
        ALTER TABLE public.resources
            ADD COLUMN published_version_id BIGINT;
    END IF;
END $$;

-- latest_version_id 제거 (활동 게시판 구조와 일치)
ALTER TABLE public.resources
    DROP COLUMN IF EXISTS latest_version_id;

-- 불필요한 컬럼 제거 (콘텐츠는 resource_versions로 이동)
ALTER TABLE public.resources
    DROP COLUMN IF EXISTS title,
    DROP COLUMN IF EXISTS subtitle,
    DROP COLUMN IF EXISTS content,
    DROP COLUMN IF EXISTS thumbnail,
    DROP COLUMN IF EXISTS category_id,
    DROP COLUMN IF EXISTS resource_type_id,
    DROP COLUMN IF EXISTS file_url,
    DROP COLUMN IF EXISTS file_size,
    DROP COLUMN IF EXISTS file_extension,
    DROP COLUMN IF EXISTS original_filename,
    DROP COLUMN IF EXISTS year,
    DROP COLUMN IF EXISTS semester,
    DROP COLUMN IF EXISTS subject,
    DROP COLUMN IF EXISTS professor,
    DROP COLUMN IF EXISTS difficulty_level,
    DROP COLUMN IF EXISTS rating,
    DROP COLUMN IF EXISTS rating_count,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- visibility 컬럼 제거 (status로 통합)
ALTER TABLE public.resources
    DROP COLUMN IF EXISTS visibility;

-- 카운터 컬럼을 캐시명으로 리네이밍
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resources' 
        AND column_name = 'views'
    ) THEN
        ALTER TABLE public.resources RENAME COLUMN views TO views_count_cached;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resources' 
        AND column_name = 'likes_count'
    ) THEN
        ALTER TABLE public.resources RENAME COLUMN likes_count TO likes_count_cached;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resources' 
        AND column_name = 'bookmarks_count'
    ) THEN
        ALTER TABLE public.resources RENAME COLUMN bookmarks_count TO bookmarks_count_cached;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resources' 
        AND column_name = 'comments_count'
    ) THEN
        ALTER TABLE public.resources RENAME COLUMN comments_count TO comments_count_cached;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resources' 
        AND column_name = 'downloads_count'
    ) THEN
        ALTER TABLE public.resources RENAME COLUMN downloads_count TO downloads_count_cached;
    END IF;
END $$;

-- =============================================
-- 4단계: resource_versions 테이블 정렬
-- =============================================

-- 필수 컬럼 추가
ALTER TABLE public.resource_versions
    ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS version_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS parent_version_id BIGINT,
    ADD COLUMN IF NOT EXISTS version_label VARCHAR(100);

-- version_number가 없으면 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resource_versions' 
        AND column_name = 'version_number'
    ) THEN
        ALTER TABLE public.resource_versions
            ADD COLUMN version_number INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;

-- 콘텐츠 필드 추가
ALTER TABLE public.resource_versions
    ADD COLUMN IF NOT EXISTS title VARCHAR(200),
    ADD COLUMN IF NOT EXISTS subtitle TEXT,
    ADD COLUMN IF NOT EXISTS thumbnail TEXT[],
    ADD COLUMN IF NOT EXISTS category_id INTEGER,
    ADD COLUMN IF NOT EXISTS resource_type_id INTEGER,
    ADD COLUMN IF NOT EXISTS file_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS file_size BIGINT,
    ADD COLUMN IF NOT EXISTS file_extension VARCHAR(10),
    ADD COLUMN IF NOT EXISTS original_filename VARCHAR(200),
    ADD COLUMN IF NOT EXISTS year INTEGER,
    ADD COLUMN IF NOT EXISTS semester VARCHAR(20),
    ADD COLUMN IF NOT EXISTS subject VARCHAR(100),
    ADD COLUMN IF NOT EXISTS professor VARCHAR(100),
    ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20),
    ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tags TEXT[];

-- created_at, updated_at 추가 (없으면)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resource_versions' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.resource_versions
            ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'resource_versions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.resource_versions
            ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- NOT NULL 제약 (빈 데이터 전제이므로 바로 강제 가능)
ALTER TABLE public.resource_versions
    ALTER COLUMN version_number SET NOT NULL,
    ALTER COLUMN version_code SET NOT NULL,
    ALTER COLUMN resource_id SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

-- UNIQUE 제약조건
ALTER TABLE public.resource_versions
    DROP CONSTRAINT IF EXISTS resource_versions_resource_code_unique,
    ADD CONSTRAINT resource_versions_resource_code_unique
        UNIQUE (resource_id, version_code);

ALTER TABLE public.resource_versions
    DROP CONSTRAINT IF EXISTS resource_versions_resource_number_unique,
    ADD CONSTRAINT resource_versions_resource_number_unique
        UNIQUE (resource_id, version_number);

-- =============================================
-- 5단계: FK 제약조건 설정
-- =============================================

-- resources.published_version_id → resource_versions.id (RESTRICT)
DO $$
DECLARE
    fkname text;
BEGIN
    -- 기존 FK 제약조건 찾기
    SELECT c.conname INTO fkname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'resources'
    JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
    WHERE c.contype = 'f'
    AND pg_get_constraintdef(c.oid) LIKE '%published_version_id%';
    
    IF fkname IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.resources DROP CONSTRAINT %I', fkname);
    END IF;
END $$;

ALTER TABLE public.resources
    ADD CONSTRAINT resources_published_version_fkey
    FOREIGN KEY (published_version_id)
    REFERENCES public.resource_versions(id)
    ON DELETE RESTRICT;

-- resource_versions.resource_id → resources.id (CASCADE)
DO $$
DECLARE
    fkname text;
BEGIN
    SELECT c.conname INTO fkname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'resource_versions'
    JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
    WHERE c.contype = 'f'
    AND pg_get_constraintdef(c.oid) LIKE '%resource_id%'
    AND pg_get_constraintdef(c.oid) NOT LIKE '%parent_version_id%';
    
    IF fkname IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.resource_versions DROP CONSTRAINT %I', fkname);
    END IF;
END $$;

ALTER TABLE public.resource_versions
    ADD CONSTRAINT resource_versions_resource_id_fkey
    FOREIGN KEY (resource_id)
    REFERENCES public.resources(id)
    ON DELETE CASCADE;

-- resource_versions.parent_version_id → resource_versions.id (SET NULL)
DO $$
DECLARE
    fkname text;
BEGIN
    SELECT c.conname INTO fkname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'resource_versions'
    JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
    WHERE c.contype = 'f'
    AND pg_get_constraintdef(c.oid) LIKE '%parent_version_id%';
    
    IF fkname IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.resource_versions DROP CONSTRAINT %I', fkname);
    END IF;
END $$;

ALTER TABLE public.resource_versions
    ADD CONSTRAINT resource_versions_parent_version_fkey
    FOREIGN KEY (parent_version_id)
    REFERENCES public.resource_versions(id)
    ON DELETE SET NULL;

-- =============================================
-- 6단계: 상태 ↔ 포인터 정합성 CHECK 제약조건
-- =============================================

-- 기존 CHECK 제약조건 모두 삭제
ALTER TABLE public.resources
    DROP CONSTRAINT IF EXISTS resources_status_check,
    DROP CONSTRAINT IF EXISTS resources_status_version_check;

-- 모든 CHECK 제약조건 찾아서 삭제 (안전하게)
DO $$
DECLARE
    con_name TEXT;
BEGIN
    FOR con_name IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'resources'
        AND constraint_type = 'CHECK'
    LOOP
        EXECUTE format('ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS %I', con_name);
        RAISE NOTICE '삭제된 CHECK 제약조건: %', con_name;
    END LOOP;
END $$;

-- 새로운 CHECK 제약조건 생성
ALTER TABLE public.resources
    ADD CONSTRAINT resources_status_version_check
    CHECK (
        (status = 'draft' AND published_version_id IS NULL) OR
        (status IN ('public', 'private') AND published_version_id IS NOT NULL)
    );

-- =============================================
-- 7단계: 인덱스 생성
-- =============================================

-- resources 테이블 인덱스
-- 공개 정렬용
CREATE INDEX IF NOT EXISTS idx_resources_status_published_at
    ON public.resources(status, published_at DESC);

-- 핀된 글 전용 파셜 인덱스
DROP INDEX IF EXISTS idx_resources_pinned_published_at;
CREATE INDEX IF NOT EXISTS idx_resources_published_at_pinned_true
    ON public.resources(published_at DESC)
    WHERE is_pinned = true;

-- 출판 포인터 조인 최적화
CREATE INDEX IF NOT EXISTS idx_resources_published_version_id
    ON public.resources(published_version_id)
    WHERE published_version_id IS NOT NULL;

-- resource_versions 테이블 인덱스
-- 버전 최신 정렬
CREATE INDEX IF NOT EXISTS idx_resource_versions_resource_number
    ON public.resource_versions(resource_id, version_number DESC);

-- 계보 탐색용
CREATE INDEX IF NOT EXISTS idx_resource_versions_parent
    ON public.resource_versions(parent_version_id)
    WHERE parent_version_id IS NOT NULL;

-- version_code 검색용
CREATE INDEX IF NOT EXISTS idx_resource_versions_resource_code
    ON public.resource_versions(resource_id, version_code);

-- 기존 불필요한 인덱스 제거
DROP INDEX IF EXISTS idx_resource_versions_resource_id;

-- =============================================
-- 8단계: 트리거 함수 생성
-- =============================================

-- published_at은 최초 출판 시만 설정, republished_at은 재출판 시마다 갱신
CREATE OR REPLACE FUNCTION public.set_resource_publish_timestamps()
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
DROP TRIGGER IF EXISTS trg_resources_publish_ts_upd ON public.resources;
CREATE TRIGGER trg_resources_publish_ts_upd
    BEFORE UPDATE ON public.resources
    FOR EACH ROW
    EXECUTE FUNCTION public.set_resource_publish_timestamps();

-- INSERT 트리거
CREATE OR REPLACE FUNCTION public.set_resource_publish_timestamps_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('public', 'private') AND NEW.published_at IS NULL THEN
        NEW.published_at := NOW();
        NEW.republished_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_resources_publish_ts_ins ON public.resources;
CREATE TRIGGER trg_resources_publish_ts_ins
    BEFORE INSERT ON public.resources
    FOR EACH ROW
    EXECUTE FUNCTION public.set_resource_publish_timestamps_on_insert();

-- =============================================
-- 9단계: 기본값 설정 확인
-- =============================================

-- resources 테이블 기본값
ALTER TABLE public.resources
    ALTER COLUMN status SET DEFAULT 'draft'::resource_status,
    ALTER COLUMN is_pinned SET DEFAULT false;

-- resource_versions 테이블 기본값
ALTER TABLE public.resource_versions
    ALTER COLUMN rating SET DEFAULT 0.0,
    ALTER COLUMN rating_count SET DEFAULT 0,
    ALTER COLUMN tags SET DEFAULT '{}',
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

-- =============================================
-- 10단계: RLS 정책 설정 (타입 변경 후)
-- =============================================

-- RLS 활성화 확인
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_versions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Resources 테이블 RLS 정책 (새로 생성)
-- =============================================

-- SELECT 정책: 
-- - status='public': 모든 사용자 조회 가능
-- - status='private': 관리자/권한자만 조회 가능
-- - status='draft': 작성자/관리자만 조회 가능
CREATE POLICY "Public resources are visible to all, private/draft to admins or authors"
ON public.resources FOR SELECT
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
        author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    ))
);

-- INSERT 정책: 인증된 사용자는 작성 가능, 관리자는 모든 리소스 작성 가능
CREATE POLICY "Authenticated users can create resources, admins can create any"
ON public.resources FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
        author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    )
);

-- UPDATE 정책: 작성자 또는 관리자만 수정 가능
CREATE POLICY "Resource authors or admins can update resources"
ON public.resources FOR UPDATE
USING (
    author_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    author_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- DELETE 정책: 작성자 또는 관리자만 삭제 가능
CREATE POLICY "Resource authors or admins can delete resources"
ON public.resources FOR DELETE
USING (
    author_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
);

-- =============================================
-- Resource_versions 테이블 RLS 정책
-- =============================================

-- SELECT 정책: 공개 리소스의 버전은 모두 조회 가능, 비공개/초안은 작성자/관리자만
CREATE POLICY "Public resource versions are visible to all, private/draft to admins or authors"
ON public.resource_versions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.resources
        WHERE resources.id = resource_versions.resource_id
        AND (
            -- 공개 리소스의 버전은 모두 조회 가능
            resources.status = 'public'
            OR
            -- 비공개 리소스의 버전은 관리자만 조회 가능
            (resources.status = 'private' AND EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role IN ('admin', 'super_admin')
            ))
            OR
            -- 초안 리소스의 버전은 작성자 또는 관리자만 조회 가능
            (resources.status = 'draft' AND (
                resource_versions.author_id = auth.uid()
                OR resources.author_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND user_profiles.role IN ('admin', 'super_admin')
                )
            ))
        )
    )
);

-- INSERT 정책: 리소스 작성자 또는 관리자만 버전 생성 가능
CREATE POLICY "Resource authors or admins can create versions"
ON public.resource_versions FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.resources
        WHERE resources.id = resource_versions.resource_id
        AND (
            resource_versions.author_id = auth.uid()
            OR resources.author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role IN ('admin', 'super_admin')
            )
        )
    )
);

-- UPDATE 정책: 리소스 작성자 또는 관리자만 버전 수정 가능
CREATE POLICY "Resource authors or admins can update versions"
ON public.resource_versions FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.resources
        WHERE resources.id = resource_versions.resource_id
        AND (
            resource_versions.author_id = auth.uid()
            OR resources.author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role IN ('admin', 'super_admin')
            )
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.resources
        WHERE resources.id = resource_versions.resource_id
        AND (
            resource_versions.author_id = auth.uid()
            OR resources.author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role IN ('admin', 'super_admin')
            )
        )
    )
);

-- DELETE 정책: 리소스 작성자 또는 관리자만 버전 삭제 가능 (단, 출판된 버전은 제외)
CREATE POLICY "Resource authors or admins can delete versions (except published)"
ON public.resource_versions FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.resources
        WHERE resources.id = resource_versions.resource_id
        AND resources.published_version_id != resource_versions.id  -- 출판된 버전은 삭제 불가
        AND (
            resource_versions.author_id = auth.uid()
            OR resources.author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role IN ('admin', 'super_admin')
            )
        )
    )
);

-- =============================================
-- 완료
-- =============================================

