-- Community Messages Table
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  message TEXT NOT NULL,
  topic VARCHAR(50) DEFAULT 'General',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  likes_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false
);

-- Community Likes Table
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Community Replies Table
CREATE TABLE IF NOT EXISTS community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  reply TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false
);

-- Community Reports Table
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES community_messages(id) ON DELETE CASCADE,
  reported_by TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  status VARCHAR(20) DEFAULT 'pending'
);

-- Community Analytics Table
CREATE TABLE IF NOT EXISTS community_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE DEFAULT CURRENT_DATE,
  total_messages INT DEFAULT 0,
  total_replies INT DEFAULT 0,
  active_users INT DEFAULT 0,
  top_topics JSONB,
  reported_messages INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE community_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE community_likes;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_topic ON community_messages(topic);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_message_id ON community_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_message_id ON community_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON community_likes(user_id);

-- Create function to increment reply count
CREATE OR REPLACE FUNCTION increment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_messages SET reply_count = reply_count + 1 WHERE id = NEW.message_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reply count
CREATE TRIGGER trigger_increment_reply_count
AFTER INSERT ON community_replies
FOR EACH ROW
EXECUTE FUNCTION increment_reply_count();

-- Create function to decrement reply count on deletion
CREATE OR REPLACE FUNCTION decrement_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_messages SET reply_count = GREATEST(0, reply_count - 1) WHERE id = OLD.message_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reply count decrement
CREATE TRIGGER trigger_decrement_reply_count
AFTER DELETE ON community_replies
FOR EACH ROW
EXECUTE FUNCTION decrement_reply_count();

-- Create function to update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_messages SET likes_count = likes_count + 1 WHERE id = NEW.message_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_messages SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.message_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for likes count
CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON community_likes
FOR EACH ROW
EXECUTE FUNCTION update_likes_count();
