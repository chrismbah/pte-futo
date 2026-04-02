import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function publishAllQuizzes() {
  try {
    console.log('[v0] Fetching all quizzes...');
    const { data: quizzes, error: fetchErr } = await supabase
      .from('quizzes')
      .select('*');

    if (fetchErr) {
      console.error('[v0] Error fetching quizzes:', fetchErr);
      return;
    }

    console.log(`[v0] Found ${quizzes?.length || 0} quizzes`);
    quizzes?.forEach((quiz: any) => {
      console.log(`  - ${quiz.title} (published: ${quiz.is_published})`);
    });

    // Publish all unpublished quizzes
    const unpublished = quizzes?.filter((q: any) => !q.is_published) || [];
    
    if (unpublished.length > 0) {
      console.log(`[v0] Publishing ${unpublished.length} quizzes...`);
      
      const { error: updateErr } = await supabase
        .from('quizzes')
        .update({ is_published: true })
        .in('id', unpublished.map((q: any) => q.id));

      if (updateErr) {
        console.error('[v0] Error publishing quizzes:', updateErr);
      } else {
        console.log('[v0] Successfully published all quizzes!');
      }
    } else {
      console.log('[v0] All quizzes are already published');
    }
  } catch (err) {
    console.error('[v0] Error:', err);
  }
}

publishAllQuizzes();
