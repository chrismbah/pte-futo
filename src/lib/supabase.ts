import { createClient } from '@supabase/supabase-js';

// Hardcoded fallbacks ensure the client always connects even when env vars
// are not yet injected (e.g. first load in preview, Vite define race, etc.)
const FALLBACK_URL = 'https://syfyjowpqzqtizlnrtal.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Znlqb3dwcXpxdGl6bG5ydGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDkxMTYsImV4cCI6MjA5MDcyNTExNn0.9dFXwi6uRPg1TpUO-oevRlWcrt6bY6DT4Z3fi4_eht4';

const supabaseUrl: string =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (process.env.SUPABASE_URL as string) ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
  FALLBACK_URL;

const supabaseAnonKey: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (process.env.SUPABASE_ANON_KEY as string) ||
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Community = {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  message: string;
  topic: string;
  community_id?: string;
  image_urls?: string[];
  sticker_url?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_edited: boolean;
  is_deleted: boolean;
};

export type CommunityReply = {
  id: string;
  message_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  reply: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
};

export type CommunityLike = {
  id: string;
  message_id: string;
  user_id: string;
  created_at: string;
};

export type CommunityReport = {
  id: string;
  message_id: string;
  reported_by: string;
  reason?: string;
  created_at: string;
  status: string;
};

export type CommunityReaction = {
  id: string;
  message_id: string;
  user_id: string;
  reaction_emoji: string;
  created_at: string;
};

export type CommunityGuideline = {
  id: string;
  content: string;
  created_at: string;
};

// ── Community Group types ──────────────────────────────────────────────────

export type CommunityGroup = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  banner_url?: string;
  member_count: number;
  post_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// ── Private Chat types ─────────────────────────────────────────────────────

export type UserVerification = {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
  bio?: string;
  online_status: 'online' | 'offline' | 'away';
  last_seen: string;
  created_at: string;
  updated_at: string;
};

export type PrivateChat = {
  id: string;
  participant_1: string;
  participant_2: string;
  participant_1_name: string;
  participant_2_name: string;
  participant_1_avatar?: string;
  participant_2_avatar?: string;
  last_message?: string;
  last_message_at: string;
  created_at: string;
};

export type PrivateMessage = {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  image_url?: string;
  is_seen: boolean;
  is_delivered: boolean;
  created_at: string;
};
