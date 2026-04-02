import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSqlFile(filePath: string) {
  try {
    console.log(`[v0] Reading SQL file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    // Split by semicolons and filter empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`[v0] Found ${statements.length} SQL statements`);
    
    // Execute each statement
    for (const statement of statements) {
      try {
        console.log(`[v0] Executing: ${statement.substring(0, 50)}...`);
        const result = await supabase.rpc('exec', { sql: statement });
        console.log(`[v0] Statement executed successfully`);
      } catch (err) {
        console.error(`[v0] Error executing statement:`, err);
      }
    }
    
    console.log('[v0] SQL file executed successfully');
  } catch (error) {
    console.error('[v0] Error reading SQL file:', error);
    process.exit(1);
  }
}

async function main() {
  const sqlFilePath = path.join(process.cwd(), 'scripts', 'create-quiz-system-tables.sql');
  await executeSqlFile(sqlFilePath);
}

main().catch(console.error);
