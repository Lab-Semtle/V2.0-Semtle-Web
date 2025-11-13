-- Resource versions system
-- This migration adds version control for resource posts

-- 1. Create resource_versions table
CREATE TABLE IF NOT EXISTS public.resource_versions (
    id BIGSERIAL PRIMARY KEY,
    resource_id BIGINT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    content JSONB,
    version_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add columns to resources table
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS latest_version_id BIGINT REFERENCES public.resource_versions(id),
ADD COLUMN IF NOT EXISTS published_version_id BIGINT REFERENCES public.resource_versions(id),
ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted'));

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resource_versions_resource_id ON public.resource_versions(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_versions_version_number ON public.resource_versions(resource_id, version_number);

-- 4. Create RLS policies for resource_versions
ALTER TABLE public.resource_versions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view versions of resources
CREATE POLICY "Users can view versions of published resources or their own resources"
ON public.resource_versions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.resources
        WHERE resources.id = resource_versions.resource_id
        AND (
            resources.status = 'published' AND resources.visibility = 'public'
            OR resources.author_id = auth.uid()
        )
    )
);

-- Allow resource authors to insert new versions
CREATE POLICY "Resource authors can create versions"
ON public.resource_versions FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.resources
        WHERE resources.id = resource_versions.resource_id
        AND resources.author_id = auth.uid()
    )
);

-- Allow resource authors to update their own versions
CREATE POLICY "Resource authors can update their own versions"
ON public.resource_versions FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.resources
        WHERE resources.id = resource_versions.resource_id
        AND resources.author_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.resources
        WHERE resources.id = resource_versions.resource_id
        AND resources.author_id = auth.uid()
    )
);

-- Allow resource authors to delete their own versions
CREATE POLICY "Resource authors can delete their own versions"
ON public.resource_versions FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.resources
        WHERE resources.id = resource_versions.resource_id
        AND resources.author_id = auth.uid()
    )
);

-- 5. Create updated_at trigger for resource_versions
CREATE OR REPLACE FUNCTION public.update_resource_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resource_versions_updated_at
    BEFORE UPDATE ON public.resource_versions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_resource_versions_updated_at();

-- 6. Create function to update latest_version_id when a new version is created
CREATE OR REPLACE FUNCTION public.update_resource_latest_version()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.resources
    SET latest_version_id = NEW.id
    WHERE id = NEW.resource_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resource_latest_version
    AFTER INSERT ON public.resource_versions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_resource_latest_version();

COMMENT ON TABLE public.resource_versions IS 'Stores version history for resource posts';
COMMENT ON COLUMN public.resource_versions.content IS 'JSON content of the resource';
COMMENT ON COLUMN public.resource_versions.version_number IS 'Version number of this resource';
COMMENT ON COLUMN public.resources.latest_version_id IS 'ID of the latest (draft) version';
COMMENT ON COLUMN public.resources.published_version_id IS 'ID of the currently published version';
COMMENT ON COLUMN public.resources.visibility IS 'Visibility: public, private, or unlisted';


