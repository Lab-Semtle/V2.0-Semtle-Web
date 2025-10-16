-- Fix RLS policy for resources table to allow authenticated users to create resources

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can create resources" ON resources;

-- Create new policy that allows authenticated users to create resources
CREATE POLICY "Authenticated users can create resources" ON resources
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = author_id
    );

-- Also ensure users can view their own draft resources
CREATE POLICY "Users can view their own draft resources" ON resources
    FOR SELECT 
    USING (
        status = 'published' 
        OR (status = 'draft' AND auth.uid() = author_id)
    );
