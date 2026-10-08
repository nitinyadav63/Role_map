-- ==============================================================================
-- Career Roadmapper: Supabase Database Schema & Row Level Security (RLS) Setup
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create the 'roadmaps' table with foreign key to auth.users
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    roadmap_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index on user_id for fast queries
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_created_at ON public.roadmaps(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users can insert their own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users can update their own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users can delete their own roadmaps" ON public.roadmaps;

-- 5. Policy: SELECT - Authenticated users can only read their own roadmaps
CREATE POLICY "Users can view their own roadmaps"
ON public.roadmaps
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. Policy: INSERT - Authenticated users can only insert roadmaps for their own user_id
CREATE POLICY "Users can insert their own roadmaps"
ON public.roadmaps
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 7. Policy: UPDATE - Authenticated users can only update roadmaps they own
CREATE POLICY "Users can update their own roadmaps"
ON public.roadmaps
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. Policy: DELETE - Authenticated users can only delete their own roadmaps
CREATE POLICY "Users can delete their own roadmaps"
ON public.roadmaps
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
