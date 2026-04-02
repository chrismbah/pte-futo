import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in project Vars.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

// Admin client using service role key — bypasses RLS, use only for admin/storage operations
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || supabaseAnonKey || 'placeholder'
);

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROFILE_PICTURES: 'profile-pictures',
  ID_CARDS: 'id-cards',
  LEARNING_RESOURCES: 'learning-resources',
  PAYMENT_RECEIPTS: 'id-cards',
  ADVERTISEMENTS: 'advertisements',
  COMMUNITY_IMAGES: 'community-images',
} as const;

// Helper to get public URL for a file
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
