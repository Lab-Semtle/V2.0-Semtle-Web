-- =============================================
-- Activity Versions RLS 정책 수정
-- =============================================
-- 날짜: 2025-01-28
-- 설명: restricted 상태 게시물의 버전 조회 문제 해결
--       activities 테이블 조회 대신 직접 author_id 확인

-- 1. activity_versions 테이블에 author_id 컬럼이 있는지 확인하고 없으면 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'activity_versions' 
        AND column_name = 'author_id'
    ) THEN
        -- author_id 컬럼 추가
        ALTER TABLE public.activity_versions 
        ADD COLUMN author_id UUID REFERENCES auth.users(id);
        
        -- 기존 데이터의 author_id 채우기 (activities 테이블에서 가져오기)
        UPDATE public.activity_versions av
        SET author_id = a.author_id
        FROM public.activities a
        WHERE av.activity_id = a.id
        AND av.author_id IS NULL;
    END IF;
END $$;

-- 2. 기존 SELECT 정책 삭제
DROP POLICY IF EXISTS "Users can view versions of published activities or admins can view all" ON public.activity_versions;

-- 3. 새로운 SELECT 정책: activities 테이블 조회 없이 직접 author_id 확인
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
    -- 작성자는 자신의 버전 조회 가능 (author_id 직접 확인)
    (
        author_id IS NOT NULL 
        AND author_id = auth.uid()
    )
    OR
    -- 출판된 활동의 버전은 모두 조회 가능 (activities 테이블 조회)
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND activities.status = 'published'
    )
);

-- 4. INSERT 시 author_id 자동 설정을 위한 트리거 (선택적)
-- 버전 생성 시 activities 테이블에서 author_id를 가져와서 설정
CREATE OR REPLACE FUNCTION public.set_activity_version_author_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.author_id IS NULL THEN
        SELECT author_id INTO NEW.author_id
        FROM public.activities
        WHERE id = NEW.activity_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_activity_version_author_id_trigger ON public.activity_versions;
CREATE TRIGGER set_activity_version_author_id_trigger
    BEFORE INSERT ON public.activity_versions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_activity_version_author_id();

