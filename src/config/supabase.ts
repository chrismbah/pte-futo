import { createClient } from '@supabase/supabase-js';

// Hardcoded fallback values for the EBSU project
const FALLBACK_SUPABASE_URL = 'https://hdmoyywwgllwjtklzvnk.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkbW95eXd3Z2xsd2p0a2x6dm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDM4MzAsImV4cCI6MjA4ODU3OTgzMH0.qA2EKC6r7p45g0R-iZXHxEnO_ptQ9oDupPvbOOBrGiI';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROFILE_PICTURES: 'profile-pictures',
  ID_CARDS: 'id-cards',
  LEARNING_RESOURCES: 'learning-resources',
} as const;

// Helper to get public URL for a file
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
