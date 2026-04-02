import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AdminQuizBuilder } from '../../../components/quiz/AdminQuizBuilder';
import { PDFSummarizer } from '../../../components/quiz/PDFSummarizer';
import { JsonQuizUploader } from '../../../components/quiz/JsonQuizUploader';
import { supabase } from '../../../lib/supabase';
import { initializeQuizTables, createSampleQuiz } from '../../../lib/quiz-db';
import toast from 'react-hot-toast';

// Admin Quiz Manager Tab - Manage and create quizzes

interface Quiz {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  duration_minutes: number;
  is_published: boolean;
  created_at: string;
  course_id: string;
}

export const AdminQuizManager = () => {
  const [activeTab, setActiveTab] = useState<'manage' | 'create' | 'pdf' | 'json'>('manage');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      console.log('[v0] Checking if quiz database is initialized...');
      const exists = await initializeQuizTables();
      
      if (exists) {
        await fetchQuizzes();
        setDbError(null);
      } else {
        setDbError('Quiz system not yet initialized. Please follow the setup instructions below to create the database tables.');
        console.log('[v0] Quiz tables do not exist - displaying setup instructions');
      }
    } catch (error) {
      console.error('[v0] Database initialization error:', error);
      setDbError('Quiz system not yet initialized. Please follow the setup instructions below to create the database tables.');
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setDbError(null);
      console.log('[v0] Fetching quizzes from Supabase...');
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('[v0] Supabase error:', error.message);
        setDbError(error.message);
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          // Tables don't exist, suggest creating sample data
          setDbError('Quiz database not initialized. Creating sample data...');
          await createSampleQuiz();
          // Try fetching again
          const { data: retryData, error: retryError } = await supabase
            .from('quizzes')
            .select('*')
            .order('created_at', { ascending: false });
          if (retryError) throw retryError;
          setQuizzes(retryData || []);
        } else {
          throw error;
        }
      } else {
        console.log('[v0] Quizzes fetched:', data);
        setQuizzes(data || []);
      }
    } catch (err) {
      console.error('[v0] Failed to fetch quizzes:', err);
      
      // Extract error message from different error types
      let errorMsg = 'Unknown error occurred';
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMsg = String((err as any).message);
      } else if (typeof err === 'string') {
        errorMsg = err;
      }
      
      console.log('[v0] Error message extracted:', errorMsg);
      
      // Check if it's a table not found error
      if (errorMsg.includes('does not exist') || errorMsg.includes('not found') || errorMsg.includes('schema cache')) {
        setDbError('Quiz system not yet initialized. Please follow the setup instructions below to create the database tables.');
      } else {
        setDbError(`Failed to load quizzes: ${errorMsg}`);
        toast.error(`Failed to load quizzes: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_published: !quiz.is_published })
        .eq('id', quiz.id);

      if (error) throw error;
      toast.success(quiz.is_published ? 'Quiz unpublished' : 'Quiz published');
      fetchQuizzes();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
      toast.error('Failed to update quiz');
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
      toast.success('Quiz deleted');
      fetchQuizzes();
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      toast.error('Failed to delete quiz');
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Database Error/Setup Banner */}
      {dbError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Setup Required</h3>
              <p className="text-blue-800 text-sm">{dbError}</p>
            </div>
          </div>
          
          <div className="ml-8 space-y-2 text-sm text-blue-800">
            <p className="font-medium">To get started, follow these steps:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to your Supabase dashboard at <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-700">app.supabase.com</a></li>
              <li>Select your project and go to the SQL Editor</li>
              <li>Copy and paste the SQL migration script below</li>
              <li>Execute the script to create the necessary database tables</li>
              <li>Refresh this page after the tables are created</li>
            </ol>
          </div>

          <div className="ml-8 mt-4 bg-white p-4 rounded border border-blue-200">
            <p className="font-medium text-blue-900 mb-2">SQL Migration Script:</p>
            <pre className="text-xs overflow-auto max-h-80 bg-gray-900 text-gray-100 p-3 rounded font-mono leading-relaxed whitespace-pre-wrap break-words">
{`-- Quiz System Database Schema
CREATE TABLE IF NOT EXISTS quiz_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Insert default data
INSERT INTO quiz_categories (name, description, order_index) 
VALUES 
  ('Preclinical', 'Foundation and basic sciences (Levels 1-3)', 1),
  ('Clinical', 'Clinical practice and case studies (Levels 4-6)', 2)
ON CONFLICT (name) DO NOTHING;`}
            </pre>
          </div>
        </motion.div>
      )}
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'manage'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage Quizzes
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'create'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Create Quiz
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'pdf'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          PDF to Questions
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'json'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          JSON Upload
        </button>
      </div>

      {/* Manage Quizzes Tab */}
      {activeTab === 'manage' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quizzes Table */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No quizzes found. Create one to get started!</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Questions</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">{quiz.title}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{quiz.total_questions}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{quiz.duration_minutes} mins</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          quiz.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {quiz.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePublish(quiz)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={quiz.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {quiz.is_published ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => console.log('Edit quiz:', quiz.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => deleteQuiz(quiz.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Create Quiz Tab */}
      {activeTab === 'create' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Quiz</h3>
            <AdminQuizBuilder onQuizCreated={fetchQuizzes} />
            <AdminQuizBuilder courseId="" levelId="" />
          </div>
        </motion.div>
      )}

      {/* PDF to Questions Tab */}
      {activeTab === 'pdf' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Questions from PDF</h3>
            <PDFSummarizer
              onSummaryComplete={(summary: string) => {
                console.log('[v0] Summary generated:', summary);
                toast.success('PDF processed! You can now create a quiz with these questions.');
              }}
            />
          </div>
        </motion.div>
      )}

      {/* JSON Upload Tab */}
      {activeTab === 'json' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg p-6">
            <JsonQuizUploader onQuizUploaded={fetchQuizzes} />
          </div>
        </motion.div>
      )}
    </div>
  );
};
