-- Create community_reactions table
CREATE TABLE IF NOT EXISTS community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reaction_emoji TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(message_id, user_id, reaction_emoji)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_reactions_message_id ON community_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_user_id ON community_reactions(user_id);

-- Enable RLS
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reactions
CREATE POLICY "Anyone can view reactions"
  ON community_reactions FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own reactions
CREATE POLICY "Users can add reactions"
  ON community_reactions FOR INSERT
  WITH CHECK (true);

-- Allow users to delete their own reactions
CREATE POLICY "Users can delete their own reactions"
  ON community_reactions FOR DELETE
  USING (user_id = auth.uid()::text OR user_id = 'admin');
