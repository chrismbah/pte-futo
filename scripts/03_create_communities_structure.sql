-- ─────────────────────────────────────────────────────────────────────────────
-- EBSUMSA Community Restructure Migration
-- Adds proper communities hierarchy on top of existing community_messages table
-- Safe to re-run (all statements are idempotent)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Communities table
CREATE TABLE IF NOT EXISTS communities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,                      -- emoji or image URL
  color       TEXT DEFAULT '#075E54',    -- brand accent color
  member_count INT DEFAULT 0,
  post_count   INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- 2. Membership table (so we can track "members" per community)
CREATE TABLE IF NOT EXISTS community_memberships (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL,
  joined_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- 3. Add community_id to existing community_messages (posts)
ALTER TABLE community_messages
  ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

-- Index for fast per-community post lookups
CREATE INDEX IF NOT EXISTS idx_community_messages_community_id
  ON community_messages(community_id);

CREATE INDEX IF NOT EXISTS idx_community_memberships_community_id
  ON community_memberships(community_id);

CREATE INDEX IF NOT EXISTS idx_community_memberships_user_id
  ON community_memberships(user_id);

-- 4. Seed default communities
INSERT INTO communities (slug, name, description, icon, color, member_count) VALUES
  ('general',          'General',          'Open discussions for all EBSUMSA students',              '💬', '#075E54', 0),
  ('medical-students', 'Medical Students',  'Clinical rounds, MCQs, study resources & more',          '🩺', '#0288d1', 0),
  ('tech-hub',         'Tech Hub',          'Coding, projects, hackathons & tech opportunities',      '💻', '#388e3c', 0),
  ('campus-gist',      'Campus Gist',       'Latest gist, campus life, events & social updates',      '🏫', '#e91e63', 0),
  ('business-network', 'Business Network',  'Entrepreneurship, networking & business opportunities',  '🤝', '#f57c00', 0),
  ('academics',        'Academics',         'Course materials, exam tips & academic support',         '📚', '#5c35cc', 0),
  ('prayer-welfare',   'Prayer & Welfare',  'Spiritual support, welfare announcements & prayers',     '🙏', '#00897b', 0)
ON CONFLICT (slug) DO NOTHING;

-- 5. Functions to keep member_count and post_count updated

-- Update member_count on join / leave
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_community_member_count ON community_memberships;
CREATE TRIGGER trg_community_member_count
AFTER INSERT OR DELETE ON community_memberships
FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Update post_count when a message is inserted/soft-deleted
CREATE OR REPLACE FUNCTION update_community_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.community_id IS NOT NULL THEN
    UPDATE communities SET post_count = post_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE AND NEW.community_id IS NOT NULL THEN
    UPDATE communities SET post_count = GREATEST(0, post_count - 1) WHERE id = NEW.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_community_post_count ON community_messages;
CREATE TRIGGER trg_community_post_count
AFTER INSERT OR UPDATE ON community_messages
FOR EACH ROW EXECUTE FUNCTION update_community_post_count();

-- 6. Enable realtime for communities + memberships
ALTER PUBLICATION supabase_realtime ADD TABLE communities;
ALTER PUBLICATION supabase_realtime ADD TABLE community_memberships;
