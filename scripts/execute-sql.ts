import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    console.log('[v0] Executing SQL file:', filePath);
    
    // Split SQL by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('[v0] Executing statement:', statement.substring(0, 80) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql_statement: statement });
        
        if (error) {
          console.error('[v0] Error executing statement:', error);
        }
      }
    }
    
    console.log('[v0] SQL file executed successfully');
  } catch (error) {
    console.error('[v0] Error executing SQL file:', error);
    process.exit(1);
  }
}

const sqlFile = path.resolve(process.cwd(), 'scripts/create-quiz-system-tables.sql');
executeSqlFile(sqlFile);
