-- ── User Profiles (verified badge, online status) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id        text        PRIMARY KEY,
  display_name   text        NOT NULL DEFAULT '',
  avatar_url     text,
  bio            text        DEFAULT '',
  is_verified    boolean     NOT NULL DEFAULT false,
  is_online      boolean     NOT NULL DEFAULT false,
  last_seen      timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ── Conversations (P2P direct messaging) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a   text        NOT NULL,
  participant_b   text        NOT NULL,
  last_message    text,
  last_message_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_a, participant_b)
);

-- ── Direct Messages ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       text        NOT NULL,
  receiver_id     text        NOT NULL,
  content         text        NOT NULL,
  image_url       text,
  is_delivered    boolean     NOT NULL DEFAULT false,
  is_seen         boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_conversations_a    ON public.conversations(participant_a);
CREATE INDEX IF NOT EXISTS idx_conversations_b    ON public.conversations(participant_b);
CREATE INDEX IF NOT EXISTS idx_dm_conversation    ON public.direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_dm_sender          ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_receiver        ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_created_at      ON public.direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_up_user_id         ON public.user_profiles(user_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.user_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- User profiles: public read, owner write
CREATE POLICY "profiles_select"   ON public.user_profiles FOR SELECT  USING (true);
CREATE POLICY "profiles_insert"   ON public.user_profiles FOR INSERT  WITH CHECK (true);
CREATE POLICY "profiles_update"   ON public.user_profiles FOR UPDATE  USING (true);

-- Conversations: open for now (app-level auth)
CREATE POLICY "conv_select"  ON public.conversations FOR SELECT  USING (true);
CREATE POLICY "conv_insert"  ON public.conversations FOR INSERT  WITH CHECK (true);
CREATE POLICY "conv_update"  ON public.conversations FOR UPDATE  USING (true);

-- Direct messages: open for now (app-level auth)
CREATE POLICY "dm_select"  ON public.direct_messages FOR SELECT  USING (true);
CREATE POLICY "dm_insert"  ON public.direct_messages FOR INSERT  WITH CHECK (true);
CREATE POLICY "dm_update"  ON public.direct_messages FOR UPDATE  USING (true);
CREATE POLICY "dm_delete"  ON public.direct_messages FOR DELETE  USING (true);

-- ── Realtime ─────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- ── Auto-update conversation last_message on new DM ─────────────────────────
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
    SET last_message    = NEW.content,
        last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dm_last_message ON public.direct_messages;
CREATE TRIGGER trg_dm_last_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

-- ── upsert_user_profile helper (idempotent) ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  p_user_id      text,
  p_display_name text,
  p_avatar_url   text DEFAULT NULL,
  p_bio          text DEFAULT ''
) RETURNS void AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, avatar_url, bio)
    VALUES (p_user_id, p_display_name, p_avatar_url, p_bio)
  ON CONFLICT (user_id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        avatar_url   = COALESCE(EXCLUDED.avatar_url, public.user_profiles.avatar_url),
        updated_at   = now();
END;
$$ LANGUAGE plpgsql;

-- ── get_or_create_conversation helper ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_user_a text,
  p_user_b text
) RETURNS uuid AS $$
DECLARE
  v_id uuid;
  a text := LEAST(p_user_a, p_user_b);
  b text := GREATEST(p_user_a, p_user_b);
BEGIN
  SELECT id INTO v_id FROM public.conversations
    WHERE participant_a = a AND participant_b = b;
  IF v_id IS NULL THEN
    INSERT INTO public.conversations (participant_a, participant_b)
      VALUES (a, b)
    RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;
