-- =============================================
-- Activities 및 Activity Versions RLS 정책 개선
-- =============================================
-- 날짜: 2025-01-27
-- 설명: 관리자가 모든 게시물과 버전을 관리할 수 있도록 RLS 정책 수정

-- =============================================
-- 1단계: Activities 테이블 RLS 정책 수정
-- =============================================

-- 기존 UPDATE 정책 삭제
DROP POLICY IF EXISTS "Only admins can update activities" ON public.activities;
DROP POLICY IF EXISTS "Activity authors can update their own activities" ON public.activities;
DROP POLICY IF EXISTS "Admins or authors can update activities" ON public.activities;

-- 새로운 UPDATE 정책: 관리자 또는 작성자
CREATE POLICY "Admins or authors can update activities" 
ON public.activities FOR UPDATE 
USING (
    -- 관리자 권한 확인
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
    OR
    -- 작성자 확인
    auth.uid() IS NOT NULL 
    AND auth.uid() = author_id
)
WITH CHECK (
    -- 관리자 권한 확인
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
    OR
    -- 작성자 확인
    auth.uid() IS NOT NULL 
    AND auth.uid() = author_id
);

-- 기존 DELETE 정책 삭제
DROP POLICY IF EXISTS "Only admins can delete activities" ON public.activities;
DROP POLICY IF EXISTS "Activity authors can delete their own activities" ON public.activities;
DROP POLICY IF EXISTS "Admins or authors can delete activities" ON public.activities;

-- 새로운 DELETE 정책: 관리자 또는 작성자
CREATE POLICY "Admins or authors can delete activities" 
ON public.activities FOR DELETE 
USING (
    -- 관리자 권한 확인
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
    OR
    -- 작성자 확인
    auth.uid() IS NOT NULL 
    AND auth.uid() = author_id
);

-- SELECT 정책은 이미 올바르게 설정되어 있음 (출판된 게시물은 모두 조회 가능)
-- restricted 상태인 게시물은 관리자만 조회 가능하도록 확인
DO $$
BEGIN
    -- restricted 상태 게시물 조회 정책이 있는지 확인
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'activities'
        AND policyname = 'Admins can view restricted activities'
    ) THEN
        -- restricted 상태 게시물은 관리자만 조회 가능
        CREATE POLICY "Admins can view restricted activities"
        ON public.activities FOR SELECT
        USING (
            status != 'restricted'
            OR
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role IN ('admin', 'super_admin')
            )
        );
    END IF;
END $$;

-- =============================================
-- 2단계: Activity Versions 테이블 RLS 정책 수정
-- =============================================

-- 기존 SELECT 정책 삭제
DROP POLICY IF EXISTS "Users can view versions of published activities or their own activities" ON public.activity_versions;
DROP POLICY IF EXISTS "Users can view versions of published activities or admins can view all" ON public.activity_versions;

-- 새로운 SELECT 정책: 관리자는 모든 버전 조회 가능, 일반 사용자는 출판된 버전만
CREATE POLICY "Users can view versions of published activities or admins can view all"
ON public.activity_versions FOR SELECT
USING (
    -- 관리자는 모든 버전 조회 가능
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
    OR
    -- 일반 사용자는 출판된 활동의 버전만 조회 가능
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND (
            activities.status = 'published'
            OR activities.author_id = auth.uid()
        )
    )
);

-- 기존 INSERT 정책 삭제
DROP POLICY IF EXISTS "Activity authors can create versions" ON public.activity_versions;
DROP POLICY IF EXISTS "Admins or authors can create versions" ON public.activity_versions;

-- 새로운 INSERT 정책: 관리자 또는 작성자
CREATE POLICY "Admins or authors can create versions"
ON public.activity_versions FOR INSERT
WITH CHECK (
    -- 관리자 권한 확인
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
    OR
    -- 작성자 확인
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND activities.author_id = auth.uid()
    )
);

-- 기존 UPDATE 정책 삭제
DROP POLICY IF EXISTS "Activity authors can update their own versions" ON public.activity_versions;
DROP POLICY IF EXISTS "Admins or authors can update versions" ON public.activity_versions;

-- 새로운 UPDATE 정책: 관리자 또는 작성자
CREATE POLICY "Admins or authors can update versions"
ON public.activity_versions FOR UPDATE
USING (
    -- 관리자 권한 확인
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
    OR
    -- 작성자 확인
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND activities.author_id = auth.uid()
    )
)
WITH CHECK (
    -- 관리자 권한 확인
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
    OR
    -- 작성자 확인
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND activities.author_id = auth.uid()
    )
);

-- DELETE 정책 추가: 관리자 또는 작성자
DROP POLICY IF EXISTS "Admins or authors can delete versions" ON public.activity_versions;

CREATE POLICY "Admins or authors can delete versions"
ON public.activity_versions FOR DELETE
USING (
    -- 관리자 권한 확인
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'super_admin')
    )
    OR
    -- 작성자 확인
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND activities.author_id = auth.uid()
    )
    -- 단, published_version_id로 설정된 버전은 삭제 불가 (추가 검증 필요)
    AND NOT EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND activities.published_version_id = activity_versions.id
    )
);

-- =============================================
-- 3단계: 정책 확인 및 로그
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
    
    RAISE NOTICE 'RLS 정책 업데이트 완료';
    RAISE NOTICE 'activities 테이블 정책 수: %', activities_policies_count;
    RAISE NOTICE 'activity_versions 테이블 정책 수: %', versions_policies_count;
END $$;
