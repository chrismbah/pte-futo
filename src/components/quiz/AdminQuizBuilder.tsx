import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useQuizManagement, type QuizQuestion } from '../../hooks/useQuizManagement';
import toast from 'react-hot-toast';

interface AdminQuizBuilderProps {
  courseId?: string;
  levelId?: string;
  onQuizCreated?: () => void;
}

export const AdminQuizBuilder: React.FC<AdminQuizBuilderProps> = ({ courseId, levelId, onQuizCreated }) => {
  const { createQuiz, publishQuiz, loading } = useQuizManagement();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion>>({
    type: 'multiple_choice',
    options: ['', '', '', ''],
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.text || !currentQuestion.correctAnswer) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newQuestion: QuizQuestion = {
      id: Math.random().toString(),
      text: currentQuestion.text || '',
      type: currentQuestion.type as 'multiple_choice' | 'true_false' | 'short_answer',
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer || '',
      explanation: currentQuestion.explanation || '',
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({ type: 'multiple_choice', options: ['', '', '', ''] });
    setShowQuestionForm(false);
    toast.success('Question added');
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.success('Question removed');
  };

  const handlePublishQuiz = async () => {
    if (!quizTitle || questions.length === 0) {
      toast.error('Quiz must have a title and at least one question');
      return;
    }

    console.log('[v0] Publishing quiz with:', {
      title: quizTitle,
      description: quizDescription,
      courseId,
      levelId,
      questionsCount: questions.length
    });

    const newQuiz = await createQuiz({
      title: quizTitle,
      description: quizDescription,
      courseId: courseId || '',
      levelId: levelId || '',
      questions,
      published: false,
    });

    if (newQuiz) {
      console.log('[v0] Quiz created, now publishing...');
      await publishQuiz(newQuiz.id);
      toast.success('Quiz published successfully!');
      // Reset form
      setQuizTitle('');
      setQuizDescription('');
      setQuestions([]);
      onQuizCreated?.();
    }
  };

  const fadeInVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="space-y-6">
      {/* Quiz Details */}
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter quiz title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter quiz description"
              rows={3}
            />
          </div>
        </div>
      </motion.div>

      {/* Questions Section */}
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Questions ({questions.length})</h3>
          <button
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {/* Question Form */}
        {showQuestionForm && (
          <motion.div
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  value={currentQuestion.text || ''}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter question text"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>

              {currentQuestion.type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {(currentQuestion.options || []).map((option, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(currentQuestion.options || [])];
                          newOptions[idx] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={`Option ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <input
                  type="text"
                  value={currentQuestion.correctAnswer || ''}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter correct answer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                <textarea
                  value={currentQuestion.explanation || ''}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter explanation for the answer"
                  rows={2}
                />
              </div>

              <button
                onClick={handleAddQuestion}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Save Question
              </button>
            </div>
          </motion.div>
        )}

        {/* Questions List */}
        <div className="space-y-2">
          {questions.map((question, idx) => (
            <motion.div
              key={question.id}
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{idx + 1}. {question.text}</p>
                <p className="text-xs text-gray-500 mt-1">Type: {question.type}</p>
              </div>
              <button
                onClick={() => handleRemoveQuestion(question.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Publish Button */}
      <button
        onClick={handlePublishQuiz}
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Publishing...' : 'Publish Quiz'}
      </button>
    </div>
  );
};
