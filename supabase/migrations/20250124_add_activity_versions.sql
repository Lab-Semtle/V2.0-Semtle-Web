-- Activity versions system
-- This migration adds version control for activity posts

-- 1. Create activity_versions table
CREATE TABLE IF NOT EXISTS public.activity_versions (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    content JSONB,
    title VARCHAR(200),
    subtitle TEXT,
    thumbnail TEXT[],
    category_id INTEGER,
    location VARCHAR(200),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    max_participants INTEGER,
    participation_fee INTEGER,
    contact_info VARCHAR(200),
    tags TEXT[],
    has_voting BOOLEAN DEFAULT false,
    vote_options JSONB DEFAULT '[]',
    vote_deadline TIMESTAMPTZ,
    version_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add columns to activities table
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS latest_version_id BIGINT REFERENCES public.activity_versions(id),
ADD COLUMN IF NOT EXISTS published_version_id BIGINT REFERENCES public.activity_versions(id);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_versions_activity_id ON public.activity_versions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_versions_version_number ON public.activity_versions(activity_id, version_number);

-- 4. Create RLS policies for activity_versions
ALTER TABLE public.activity_versions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view versions of published activities or their own activities
CREATE POLICY "Users can view versions of published activities or their own activities"
ON public.activity_versions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND (
            activities.status = 'published'
            OR activities.author_id = auth.uid()
        )
    )
);

-- Allow activity authors to insert new versions
CREATE POLICY "Activity authors can create versions"
ON public.activity_versions FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND activities.author_id = auth.uid()
    )
);

-- Allow activity authors to update their own versions
CREATE POLICY "Activity authors can update their own versions"
ON public.activity_versions FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.activities
        WHERE activities.id = activity_versions.activity_id
        AND activities.author_id = auth.uid()
    )
);

-- 5. Function to update latest_version_id in activities table
CREATE OR REPLACE FUNCTION public.update_activity_latest_version()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.activities
    SET latest_version_id = NEW.id
    WHERE id = NEW.activity_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger to automatically update latest_version_id
CREATE TRIGGER update_activity_latest_version_trigger
AFTER INSERT ON public.activity_versions
FOR EACH ROW
EXECUTE FUNCTION public.update_activity_latest_version();

COMMENT ON TABLE public.activity_versions IS 'Stores version history for activity posts';
COMMENT ON COLUMN public.activity_versions.content IS 'JSON content of the activity';
COMMENT ON COLUMN public.activity_versions.version_number IS 'Version number of this activity';
COMMENT ON COLUMN public.activities.latest_version_id IS 'ID of the latest (draft) version';
COMMENT ON COLUMN public.activities.published_version_id IS 'ID of the currently published version';










