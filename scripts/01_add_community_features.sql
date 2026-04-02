-- Create community_subcategories table for hierarchical sub-communities
CREATE TABLE IF NOT EXISTS community_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_subcategories_name ON community_subcategories(name);

-- Create community_stickers table (library of available stickers)
CREATE TABLE IF NOT EXISTS community_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  category VARCHAR(50),
  is_animated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stickers_category ON community_stickers(category);

-- Create user_saved_stickers table (user's favorite stickers)
CREATE TABLE IF NOT EXISTS user_saved_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  sticker_id UUID NOT NULL REFERENCES community_stickers(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, sticker_id)
);

CREATE INDEX IF NOT EXISTS idx_user_saved_stickers_user_id ON user_saved_stickers(user_id);

-- Alter community_messages table to support images and subcategories
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES community_subcategories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_subcategory_id ON community_messages(subcategory_id);

-- Insert default subcategories
INSERT INTO community_subcategories (name, description, icon, color, order_index) VALUES
  ('General', 'General discussions and announcements', '💬', '#0ea5e9', 0),
  ('Academics', 'Course materials and academic support', '📚', '#06b6d4', 1),
  ('Events', 'Campus events and activities', '🎉', '#14b8a6', 2),
  ('Networking', 'Professional development and networking', '🤝', '#10b981', 3)
ON CONFLICT (name) DO NOTHING;

-- Insert sample stickers
INSERT INTO community_stickers (name, image_url, category, is_animated) VALUES
  ('Thumbs Up', 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f44d.png', 'reaction', false),
  ('Heart', 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/2764.png', 'reaction', false),
  ('Fire', 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f525.png', 'reaction', false),
  ('Clap', 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f44f.png', 'reaction', false),
  ('Laugh', 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f602.png', 'emotion', false),
  ('Party', 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f389.png', 'celebration', false),
  ('Trophy', 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3c6.png', 'achievement', false),
  ('Rocket', 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f680.png', 'action', false)
ON CONFLICT DO NOTHING;
