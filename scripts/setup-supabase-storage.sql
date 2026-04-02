-- Create storage buckets for EBSU Portal
-- Run this script in your Supabase SQL Editor

-- Create profile-pictures bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create id-cards bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-cards', 'id-cards', true)
ON CONFLICT (id) DO NOTHING;

-- Create learning-resources bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-resources', 'learning-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to profile-pictures bucket
CREATE POLICY "Public Access for profile-pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

-- Allow authenticated users to upload to profile-pictures
CREATE POLICY "Allow authenticated uploads to profile-pictures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-pictures');

-- Allow users to update their own profile pictures
CREATE POLICY "Allow users to update profile-pictures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-pictures');

-- Allow users to delete their own profile pictures
CREATE POLICY "Allow users to delete profile-pictures"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-pictures');

-- Allow public read access to id-cards bucket
CREATE POLICY "Public Access for id-cards"
ON storage.objects FOR SELECT
USING (bucket_id = 'id-cards');

-- Allow authenticated users to upload to id-cards
CREATE POLICY "Allow authenticated uploads to id-cards"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'id-cards');

-- Allow users to update their own id cards
CREATE POLICY "Allow users to update id-cards"
ON storage.objects FOR UPDATE
USING (bucket_id = 'id-cards');

-- Allow public read access to learning-resources bucket
CREATE POLICY "Public Access for learning-resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'learning-resources');

-- Allow admins to upload learning resources (you may want to restrict this further)
CREATE POLICY "Allow uploads to learning-resources"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'learning-resources');

-- Allow admins to update learning resources
CREATE POLICY "Allow updates to learning-resources"
ON storage.objects FOR UPDATE
USING (bucket_id = 'learning-resources');

-- Allow admins to delete learning resources
CREATE POLICY "Allow deletes from learning-resources"
ON storage.objects FOR DELETE
USING (bucket_id = 'learning-resources');
