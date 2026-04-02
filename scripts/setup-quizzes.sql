-- Quiz System Database Schema

-- Categories table (Preclinical/Clinical)
CREATE TABLE IF NOT EXISTS quiz_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Levels table (1-6)
CREATE TABLE IF NOT EXISTS quiz_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES quiz_categories(id) ON DELETE CASCADE,
  level_number INT NOT NULL CHECK (level_number >= 1 AND level_number <= 6),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(category_id, level_number)
);

-- Courses table
CREATE TABLE IF NOT EXISTS quiz_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES quiz_levels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE,
  instructor_id UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES quiz_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_questions INT DEFAULT 0,
  duration_minutes INT DEFAULT 30,
  pass_score INT DEFAULT 60,
  is_published BOOLEAN DEFAULT false,
  is_randomized BOOLEAN DEFAULT false,
  shuffle_questions BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  points INT DEFAULT 1,
  order_index INT DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Quiz Attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  score INT,
  total_possible_score INT,
  percentage DECIMAL(5, 2),
  time_spent_seconds INT,
  started_at TIMESTAMP,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- User Answers table
CREATE TABLE IF NOT EXISTS user_quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id),
  selected_answer_id UUID REFERENCES quiz_answers(id),
  user_answer_text TEXT,
  is_correct BOOLEAN,
  points_earned INT,
  created_at TIMESTAMP DEFAULT now()
);

-- PDF Summaries table
CREATE TABLE IF NOT EXISTS pdf_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES quiz_courses(id),
  original_filename TEXT,
  summary_text TEXT,
  generated_questions INT DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_courses_level_id ON quiz_courses(level_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_attempt_id ON user_quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_pdf_summaries_course_id ON pdf_summaries(course_id);

-- Insert default categories
INSERT INTO quiz_categories (name, description, order_index) 
VALUES 
  ('Preclinical', 'Foundation and basic sciences (Levels 1-3)', 1),
  ('Clinical', 'Clinical practice and case studies (Levels 4-6)', 2)
ON CONFLICT (name) DO NOTHING;

-- Insert default levels for Preclinical
INSERT INTO quiz_levels (category_id, level_number, title, description)
SELECT id, 1, 'Level 1', 'Foundation concepts and fundamentals' FROM quiz_categories WHERE name = 'Preclinical'
ON CONFLICT (category_id, level_number) DO NOTHING;

INSERT INTO quiz_levels (category_id, level_number, title, description)
SELECT id, 2, 'Level 2', 'Intermediate concepts and integration' FROM quiz_categories WHERE name = 'Preclinical'
ON CONFLICT (category_id, level_number) DO NOTHING;

INSERT INTO quiz_levels (category_id, level_number, title, description)
SELECT id, 3, 'Level 3', 'Advanced concepts and application' FROM quiz_categories WHERE name = 'Preclinical'
ON CONFLICT (category_id, level_number) DO NOTHING;

-- Insert default levels for Clinical
INSERT INTO quiz_levels (category_id, level_number, title, description)
SELECT id, 4, 'Level 4', 'Clinical basics and patient assessment' FROM quiz_categories WHERE name = 'Clinical'
ON CONFLICT (category_id, level_number) DO NOTHING;

INSERT INTO quiz_levels (category_id, level_number, title, description)
SELECT id, 5, 'Level 5', 'Clinical management and case studies' FROM quiz_categories WHERE name = 'Clinical'
ON CONFLICT (category_id, level_number) DO NOTHING;

INSERT INTO quiz_levels (category_id, level_number, title, description)
SELECT id, 6, 'Level 6', 'Advanced clinical practice and board review' FROM quiz_categories WHERE name = 'Clinical'
ON CONFLICT (category_id, level_number) DO NOTHING;

-- Note: RLS policies will be added in a separate migration once tables are created
