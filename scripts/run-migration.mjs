import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running team_images migration...');

  // Test connection
  const { error: pingError } = await supabase.from('team_images').select('id').limit(1);
  if (!pingError) {
    console.log('team_images table already exists. Skipping.');
  } else {
    console.log('team_images table does not exist yet — please run the SQL script via the Supabase dashboard SQL editor.');
    console.log('SQL file: scripts/create-team-images-table.sql');
  }

  const { error: alumniPingError } = await supabase.from('alumni').select('id').limit(1);
  if (!alumniPingError) {
    console.log('alumni table already exists. Skipping.');
  } else {
    console.log('alumni table does not exist yet — please run the SQL script via the Supabase dashboard SQL editor.');
  }

  console.log('Done.');
}

runMigration().catch(console.error);
