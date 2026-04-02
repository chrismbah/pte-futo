import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizPlayerProps {
  quizId: string;
  quizTitle: string;
  questions: Question[];
  duration?: number;
  onComplete: (score: number) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quizId,
  quizTitle,
  questions,
  duration,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration ? duration * 60 : null);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((question) => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
        correctCount++;
      }
    });
    return Math.round((correctCount / questions.length) * 100);
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(userAnswers).length < questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const finalScore = calculateScore();
      setScore(finalScore);
      setShowResults(true);

      // Save attempt to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_attempts').insert([
          {
            user_id: user.id,
            quiz_id: quizId,
            score: finalScore,
            answers: userAnswers,
            completed_at: new Date().toISOString(),
          },
        ]);
      }

      onComplete(finalScore);
      toast.success(`Quiz completed! Score: ${finalScore}%`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fadeInVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  if (showResults) {
    return (
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="max-w-2xl mx-auto bg-white rounded-lg p-8 border border-gray-200 text-center space-y-6"
      >
        <div className={`inline-block p-4 rounded-full ${score >= 70 ? 'bg-emerald-100' : score >= 50 ? 'bg-amber-100' : 'bg-red-100'}`}>
          {score >= 70 ? (
            <Check className={`w-12 h-12 ${score >= 70 ? 'text-emerald-600' : ''}`} />
          ) : (
            <X className="w-12 h-12 text-red-600" />
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
          <p className="text-gray-600">You scored</p>
        </div>

        <div className="text-5xl font-bold text-teal-600">{score}%</div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700">
            {score >= 70
              ? 'Great job! You passed the quiz.'
              : score >= 50
              ? 'Good effort! Review the material and try again.'
              : 'Keep practicing! You can do better.'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">{questions.length}</p>
            <p className="text-sm text-gray-600">Total Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">
              {Math.round((score / 100) * questions.length)}
            </p>
            <p className="text-sm text-gray-600">Correct Answers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {questions.length - Math.round((score / 100) * questions.length)}
            </p>
            <p className="text-sm text-gray-600">Incorrect Answers</p>
          </div>
        </div>

        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Back to Quizzes
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{quizTitle}</h1>
          <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>
        {timeLeft !== null && (
          <div className={`text-2xl font-bold flex items-center gap-2 ${timeLeft < 60 ? 'text-red-600' : 'text-teal-600'}`}>
            <Clock className="w-6 h-6" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion.id}
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="bg-white rounded-lg p-6 border border-gray-200 space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-800">{currentQuestion.text}</h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
            currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  userAnswers[currentQuestion.id] === option
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      userAnswers[currentQuestion.id] === option
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {userAnswers[currentQuestion.id] === option && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))
          ) : currentQuestion.type === 'true_false' ? (
            <div className="grid grid-cols-2 gap-4">
              {['True', 'False'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`p-4 rounded-lg border-2 transition-colors font-medium ${
                    userAnswers[currentQuestion.id] === option
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={userAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              placeholder="Enter your answer..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={3}
            />
          )}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting || Object.keys(userAnswers).length < questions.length}
            className="flex-1 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question Indicators */}
      <div className="flex gap-2 flex-wrap justify-center">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestionIndex(idx)}
            className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
              idx === currentQuestionIndex
                ? 'bg-teal-500 text-white'
                : userAnswers[q.id]
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
