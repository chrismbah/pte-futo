-- Create community_guidelines table
CREATE TABLE IF NOT EXISTS public.community_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.community_guidelines ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow anyone to read guidelines
CREATE POLICY "Anyone can read guidelines"
  ON public.community_guidelines
  FOR SELECT
  USING (true);

-- Allow only authenticated users to insert
CREATE POLICY "Authenticated users can insert guidelines"
  ON public.community_guidelines
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow only authenticated users to delete guidelines
CREATE POLICY "Authenticated users can delete guidelines"
  ON public.community_guidelines
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_guidelines_created_at 
  ON public.community_guidelines(created_at DESC);
