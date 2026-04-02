import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hdmoyywwgllwjtklzvnk.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkbW95eXd3Z2xsd2p0a2x6dm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAwMzgzMCwiZXhwIjoyMDg4NTc5ODMwfQ.4XJDU1mQO7iIBsQToGD64rm9gEK8iDyoY2X8g8bW6jY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createBuckets() {
  const buckets = [
    { name: 'advertisements', public: true },
    { name: 'profile-pictures', public: true },
    { name: 'id-cards', public: true },
    { name: 'learning-resources', public: true },
  ];

  for (const bucket of buckets) {
    const { data: existing } = await supabase.storage.getBucket(bucket.name);
    if (existing) {
      console.log(`Bucket "${bucket.name}" already exists — skipping.`);
      continue;
    }
    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    });
    if (error) {
      console.error(`Failed to create bucket "${bucket.name}":`, error.message);
    } else {
      console.log(`Created bucket "${bucket.name}" successfully.`);
    }
  }
}

createBuckets().catch(console.error);
