-- Add is_active column to communities table if it doesn't exist
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Set all existing communities as active
UPDATE communities SET is_active = TRUE WHERE is_active IS NULL;

-- Add banner_url column if it doesn't exist (referenced in CommunityGroup type)
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS banner_url TEXT;
