-- ============================================================
-- team_images table
-- Stores uploaded images + editable fields for:
--   • executive team  (teamType = 'executive')
--   • class reps      (teamType = 'classRep')
--   • alumni          (teamType = 'alumni')
-- ============================================================

CREATE TABLE IF NOT EXISTS public.team_images (
  id          TEXT PRIMARY KEY,          -- "{teamType}_{memberId}"
  team_type   TEXT NOT NULL,             -- 'executive' | 'classRep' | 'alumni'
  member_id   TEXT NOT NULL,
  image_url   TEXT,
  name        TEXT,
  role        TEXT,
  extra       TEXT,                      -- phone / work / bio / year-served
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.team_images ENABLE ROW LEVEL SECURITY;

-- Public can read all rows
CREATE POLICY "Public read team_images"
  ON public.team_images FOR SELECT
  USING (true);

-- Anyone can insert (admin gate is enforced in app code)
CREATE POLICY "Allow insert team_images"
  ON public.team_images FOR INSERT
  WITH CHECK (true);

-- Anyone can update (admin gate is enforced in app code)
CREATE POLICY "Allow update team_images"
  ON public.team_images FOR UPDATE
  USING (true);

-- Anyone can delete (admin gate is enforced in app code)
CREATE POLICY "Allow delete team_images"
  ON public.team_images FOR DELETE
  USING (true);

-- ============================================================
-- alumni table  (separate from team_images – richer fields)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.alumni (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  full_name    TEXT NOT NULL,
  role         TEXT NOT NULL,
  year_served  TEXT NOT NULL,
  image_url    TEXT,
  bio          TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read alumni"
  ON public.alumni FOR SELECT
  USING (true);

CREATE POLICY "Allow insert alumni"
  ON public.alumni FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update alumni"
  ON public.alumni FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete alumni"
  ON public.alumni FOR DELETE
  USING (true);
