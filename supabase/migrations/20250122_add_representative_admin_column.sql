-- Add is_representative_admin column to user_profiles table
-- This column will be used to designate which super admin is the representative admin

-- Add the column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_representative_admin BOOLEAN DEFAULT FALSE;

-- Create an index for better performance when querying representative admin
CREATE INDEX IF NOT EXISTS idx_user_profiles_representative_admin 
ON public.user_profiles(is_representative_admin) 
WHERE is_representative_admin = TRUE;

-- Add a comment to explain the column purpose
COMMENT ON COLUMN public.user_profiles.is_representative_admin IS 'Designates which super admin is the representative admin for contact purposes';
