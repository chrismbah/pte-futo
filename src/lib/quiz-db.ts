import { supabase } from './supabase';

export async function initializeQuizTables() {
  try {
    console.log('[v0] Checking if quiz tables exist...');
    
    // Try to query the quizzes table to see if it exists
    const { error } = await supabase
      .from('quizzes')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('does not exist')) {
      console.log('[v0] Quiz tables do not exist yet');
      return false;
    }
    
    console.log('[v0] Quiz tables exist');
    return true;
  } catch (error) {
    console.error('[v0] Error checking quiz tables:', error);
    return false;
  }
}

export async function createSampleQuiz() {
  try {
    console.log('[v0] Attempting to create sample quiz...');
    
    // Try to create a sample quiz
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert([
        {
          title: 'Sample Quiz',
          description: 'This is a sample quiz to get you started',
          total_questions: 5,
          duration_minutes: 15,
          pass_score: 70,
          is_published: true
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('[v0] Error creating sample quiz:', error.message);
      return null;
    }
    
    console.log('[v0] Sample quiz created:', quiz);
    return quiz;
  } catch (error) {
    console.error('[v0] Error creating sample quiz:', error);
    return null;
  }
}
