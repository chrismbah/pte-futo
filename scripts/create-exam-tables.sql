-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  total_questions INT DEFAULT 0,
  difficulty_level TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL,
  questions_attempted INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  score DECIMAL(5, 2),
  last_attempted TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_minutes INT,
  questions_completed INT,
  score INT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_exams_user_id ON exams(user_id);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_flashcards_exam_id ON flashcards(exam_id);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own exams" ON exams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exams" ON exams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams" ON exams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams" ON exams
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view questions from their exams" ON questions
  FOR SELECT USING (exam_id IN (SELECT id FROM exams WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their study sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert study sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view flashcards from their exams" ON flashcards
  FOR SELECT USING (exam_id IN (SELECT id FROM exams WHERE user_id = auth.uid()));
