# Student Community Feature - Setup Guide

## Step 1: Environment Variables
Make sure these are set in your Vercel project settings (Settings > Vars):
- `VITE_SUPABASE_URL`: https://cjrwfrjxtybftdylhuhg.supabase.co
- `VITE_SUPABASE_ANON_KEY`: (your anon public key)

## Step 2: Create Database Tables
1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Copy the entire content from `/scripts/create-community-tables.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

This will create:
- `community_messages` table
- `community_likes` table  
- `community_replies` table
- `community_reports` table
- `community_analytics` table
- Indexes and triggers for automatic counting

## Step 3: Enable Realtime (Optional but Recommended)
In Supabase:
1. Go to Database > Replication
2. Check the boxes for `community_messages`, `community_replies`, and `community_likes`
3. This enables real-time updates in the UI

## Step 4: Row Level Security (RLS)
If you want to enforce security (recommended):
1. Go to SQL Editor
2. Run the RLS policies in `scripts/rls-policies.sql` (if it exists)

## Testing
Once setup is complete, the Community Widget will automatically appear on your dashboard showing:
- Latest student messages
- Topic filters (General, Academics, Campus Life, Tech, Events)
- Real-time updates as new messages are posted

For admin features, visit the Admin Dashboard > Community Monitor and Community Analytics tabs.
