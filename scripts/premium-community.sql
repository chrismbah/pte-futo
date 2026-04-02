-- Premium Community Messages table
CREATE TABLE IF NOT EXISTS premium_community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  message TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  likes_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Premium Community Replies table
CREATE TABLE IF NOT EXISTS premium_community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES premium_community_messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  reply TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Premium Community Likes table
CREATE TABLE IF NOT EXISTS premium_community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES premium_community_messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable Realtime for premium community tables
ALTER PUBLICATION supabase_realtime ADD TABLE premium_community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE premium_community_replies;

-- Enable RLS
ALTER TABLE premium_community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_community_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: allow all for anon (app handles auth via Firebase)
CREATE POLICY "allow_all_premium_messages" ON premium_community_messages FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_premium_replies" ON premium_community_replies FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_premium_likes" ON premium_community_likes FOR ALL TO anon USING (true) WITH CHECK (true);
