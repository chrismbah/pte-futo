-- Create quiz tables if they don't already exist

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID,
  total_questions INT DEFAULT 0,
  duration_minutes INT DEFAULT 30,
  pass_score INT DEFAULT 50,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  explanation TEXT,
  points INT DEFAULT 1,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now()
);
