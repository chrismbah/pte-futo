-- ── Premium Community Messages ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.premium_community_messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          text        NOT NULL,
  user_name        text        NOT NULL,
  user_avatar      text,
  content          text        NOT NULL,
  image_url        text,
  likes_count      integer     NOT NULL DEFAULT 0,
  replies_count    integer     NOT NULL DEFAULT 0,
  is_pinned        boolean     NOT NULL DEFAULT false,
  is_announcement  boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── Premium Community Replies ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.premium_community_replies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  uuid        NOT NULL REFERENCES public.premium_community_messages(id) ON DELETE CASCADE,
  user_id     text        NOT NULL,
  user_name   text        NOT NULL,
  user_avatar text,
  content     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Premium Community Likes ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.premium_community_likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  uuid  NOT NULL REFERENCES public.premium_community_messages(id) ON DELETE CASCADE,
  user_id     text  NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pcm_created_at   ON public.premium_community_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pcm_is_pinned    ON public.premium_community_messages(is_pinned);
CREATE INDEX IF NOT EXISTS idx_pcr_message_id   ON public.premium_community_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_pcl_message_id   ON public.premium_community_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_pcl_user_id      ON public.premium_community_likes(user_id);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.premium_community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_community_replies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_community_likes    ENABLE ROW LEVEL SECURITY;

-- Messages: anyone authenticated can read; only owner can insert their own rows
CREATE POLICY "read_messages"   ON public.premium_community_messages FOR SELECT USING (true);
CREATE POLICY "insert_messages" ON public.premium_community_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "update_messages" ON public.premium_community_messages FOR UPDATE USING (true);
CREATE POLICY "delete_messages" ON public.premium_community_messages FOR DELETE USING (true);

-- Replies
CREATE POLICY "read_replies"   ON public.premium_community_replies FOR SELECT USING (true);
CREATE POLICY "insert_replies" ON public.premium_community_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "delete_replies" ON public.premium_community_replies FOR DELETE USING (true);

-- Likes
CREATE POLICY "read_likes"   ON public.premium_community_likes FOR SELECT USING (true);
CREATE POLICY "insert_likes" ON public.premium_community_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "delete_likes" ON public.premium_community_likes FOR DELETE USING (true);

-- ── Realtime ──────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.premium_community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.premium_community_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.premium_community_likes;
