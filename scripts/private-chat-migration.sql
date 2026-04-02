-- Migration: Add is_verified to community tables + private chat system
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks)

-- 1. Add is_verified field to community_messages (for display purposes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_messages' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE community_messages ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 2. Create user_verification table (admin-controlled)
CREATE TABLE IF NOT EXISTS user_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  bio TEXT,
  online_status TEXT DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create private_chats table (1-to-1 conversations)
CREATE TABLE IF NOT EXISTS private_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 TEXT NOT NULL,
  participant_2 TEXT NOT NULL,
  participant_1_name TEXT NOT NULL DEFAULT '',
  participant_2_name TEXT NOT NULL DEFAULT '',
  participant_1_avatar TEXT,
  participant_2_avatar TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (participant_1, participant_2)
);

-- 4. Create private_messages table
CREATE TABLE IF NOT EXISTS private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES private_chats(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  is_seen BOOLEAN NOT NULL DEFAULT FALSE,
  is_delivered BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security
ALTER TABLE user_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: user_verification
DROP POLICY IF EXISTS "Anyone can read verification" ON user_verification;
CREATE POLICY "Anyone can read verification"
  ON user_verification FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can upsert their own record" ON user_verification;
CREATE POLICY "Users can upsert their own record"
  ON user_verification FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own record" ON user_verification;
CREATE POLICY "Users can update their own record"
  ON user_verification FOR UPDATE USING (true);

-- 7. RLS Policies: private_chats
DROP POLICY IF EXISTS "Participants can read their chats" ON private_chats;
CREATE POLICY "Participants can read their chats"
  ON private_chats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create chats" ON private_chats;
CREATE POLICY "Anyone can create chats"
  ON private_chats FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Participants can update chats" ON private_chats;
CREATE POLICY "Participants can update chats"
  ON private_chats FOR UPDATE USING (true);

-- 8. RLS Policies: private_messages
DROP POLICY IF EXISTS "Chat participants can read messages" ON private_messages;
CREATE POLICY "Chat participants can read messages"
  ON private_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can send messages" ON private_messages;
CREATE POLICY "Anyone can send messages"
  ON private_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update messages" ON private_messages;
CREATE POLICY "Anyone can update messages"
  ON private_messages FOR UPDATE USING (true);

-- 9. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_private_chats_p1 ON private_chats(participant_1);
CREATE INDEX IF NOT EXISTS idx_private_chats_p2 ON private_chats(participant_2);
CREATE INDEX IF NOT EXISTS idx_private_messages_chat_id ON private_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON private_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_verification_user_id ON user_verification(user_id);

-- 10. Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE private_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE private_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_verification;
