import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileJson, CheckCircle, XCircle, AlertCircle, Loader2, Download, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface QuizQuestion {
  question_text: string;
  question_type?: string;
  points?: number;
  explanation?: string;
  answers: {
    answer_text: string;
    is_correct: boolean;
  }[];
}

interface QuizData {
  title: string;
  description?: string;
  duration_minutes?: number;
  pass_score?: number;
  is_published?: boolean;
  course_id?: string;
  questions: QuizQuestion[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface JsonQuizUploaderProps {
  onQuizUploaded?: () => void;
}

export const JsonQuizUploader = ({ onQuizUploaded }: JsonQuizUploaderProps) => {
  const [jsonContent, setJsonContent] = useState<string>('');
  const [parsedQuiz, setParsedQuiz] = useState<QuizData | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateQuizData = (data: unknown): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
      return { isValid: false, errors: ['Invalid JSON structure'], warnings: [] };
    }

    const quiz = data as Record<string, unknown>;

    // Required fields
    if (!quiz.title || typeof quiz.title !== 'string') {
      errors.push('Missing or invalid "title" field (required string)');
    }

    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      errors.push('Missing or invalid "questions" field (required array)');
      return { isValid: false, errors, warnings };
    }

    if (quiz.questions.length === 0) {
      errors.push('Quiz must have at least one question');
    }

    // Validate each question
    (quiz.questions as unknown[]).forEach((q, index) => {
      const question = q as Record<string, unknown>;
      const qNum = index + 1;

      if (!question.question_text || typeof question.question_text !== 'string') {
        errors.push(`Question ${qNum}: Missing or invalid "question_text"`);
      }

      if (!question.answers || !Array.isArray(question.answers)) {
        errors.push(`Question ${qNum}: Missing or invalid "answers" array`);
      } else {
        if (question.answers.length < 2) {
          errors.push(`Question ${qNum}: Must have at least 2 answer options`);
        }

        const correctAnswers = (question.answers as Record<string, unknown>[]).filter(
          (a) => a.is_correct === true
        );
        if (correctAnswers.length === 0) {
          errors.push(`Question ${qNum}: Must have at least one correct answer`);
        }

        (question.answers as Record<string, unknown>[]).forEach((a, aIndex) => {
          if (!a.answer_text || typeof a.answer_text !== 'string') {
            errors.push(`Question ${qNum}, Answer ${aIndex + 1}: Missing or invalid "answer_text"`);
          }
        });
      }

      // Optional field warnings
      if (!question.explanation) {
        warnings.push(`Question ${qNum}: No explanation provided`);
      }
    });

    // Optional field warnings
    if (!quiz.description) {
      warnings.push('No description provided for the quiz');
    }
    if (!quiz.duration_minutes) {
      warnings.push('No duration specified (will default to 30 minutes)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonContent(content);
      parseAndValidate(content);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
  };

  const parseAndValidate = (content: string) => {
    try {
      const data = JSON.parse(content);
      const validationResult = validateQuizData(data);
      setValidation(validationResult);

      if (validationResult.isValid) {
        setParsedQuiz(data as QuizData);
        toast.success('JSON parsed successfully!');
      } else {
        setParsedQuiz(null);
      }
    } catch {
      setValidation({
        isValid: false,
        errors: ['Invalid JSON syntax. Please check your file format.'],
        warnings: [],
      });
      setParsedQuiz(null);
    }
  };

  const handleTextChange = (content: string) => {
    setJsonContent(content);
    if (content.trim()) {
      parseAndValidate(content);
    } else {
      setValidation(null);
      setParsedQuiz(null);
    }
  };

  const uploadQuiz = async () => {
    if (!parsedQuiz || !validation?.isValid) return;

    setUploading(true);
    try {
      // Check if supabase client is properly initialized
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your environment variables.');
      }

      // 1. Create the quiz
      console.log('[v0] Creating quiz:', parsedQuiz.title);
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert([
          {
            title: parsedQuiz.title,
            description: parsedQuiz.description || '',
            duration_minutes: parsedQuiz.duration_minutes || 30,
            pass_score: parsedQuiz.pass_score || 60,
            is_published: parsedQuiz.is_published ?? true,
            total_questions: parsedQuiz.questions.length,
            course_id: parsedQuiz.course_id || null,
          },
        ])
        .select()
        .single();

      if (quizError) {
        console.error('[v0] Quiz creation error:', quizError);
        if (quizError.message.includes('does not exist')) {
          throw new Error('Quiz tables do not exist. Please run the database migration script first.');
        }
        throw new Error(`Failed to create quiz: ${quizError.message}`);
      }

      console.log('[v0] Quiz created with ID:', quiz.id);

      // 2. Create questions
      for (let i = 0; i < parsedQuiz.questions.length; i++) {
        const q = parsedQuiz.questions[i];

        console.log('[v0] Creating question', i + 1, 'of', parsedQuiz.questions.length);
        const { data: question, error: questionError } = await supabase
          .from('quiz_questions')
          .insert([
            {
              quiz_id: quiz.id,
              question_text: q.question_text,
              question_type: q.question_type || 'multiple_choice',
              points: q.points || 1,
              order_index: i,
              explanation: q.explanation || null,
            },
          ])
          .select()
          .single();

        if (questionError) {
          console.error('[v0] Question creation error:', questionError);
          throw new Error(`Failed to create question ${i + 1}: ${questionError.message}`);
        }

        // 3. Create answers for each question
        const answersToInsert = q.answers.map((a, aIndex) => ({
          question_id: question.id,
          answer_text: a.answer_text,
          is_correct: a.is_correct,
          order_index: aIndex,
        }));

        const { error: answersError } = await supabase
          .from('quiz_answers')
          .insert(answersToInsert);

        if (answersError) {
          console.error('[v0] Answers creation error:', answersError);
          throw new Error(`Failed to create answers for question ${i + 1}: ${answersError.message}`);
        }
      }

      console.log('[v0] Quiz upload complete!');
      toast.success(`Quiz "${parsedQuiz.title}" uploaded successfully with ${parsedQuiz.questions.length} questions!`);
      
      // Reset form
      setJsonContent('');
      setParsedQuiz(null);
      setValidation(null);
      setShowPreview(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onQuizUploaded?.();
    } catch (error) {
      console.error('[v0] Failed to upload quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const clearForm = () => {
    setJsonContent('');
    setParsedQuiz(null);
    setValidation(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template: QuizData = {
      title: "Sample Quiz Title",
      description: "A description of your quiz",
      duration_minutes: 30,
      pass_score: 60,
      is_published: true,
      questions: [
        {
          question_text: "What is the capital of France?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "Paris is the capital and largest city of France.",
          answers: [
            { answer_text: "London", is_correct: false },
            { answer_text: "Paris", is_correct: true },
            { answer_text: "Berlin", is_correct: false },
            { answer_text: "Madrid", is_correct: false }
          ]
        },
        {
          question_text: "Which planet is known as the Red Planet?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "Mars is called the Red Planet due to its reddish appearance caused by iron oxide on its surface.",
          answers: [
            { answer_text: "Venus", is_correct: false },
            { answer_text: "Mars", is_correct: true },
            { answer_text: "Jupiter", is_correct: false },
            { answer_text: "Saturn", is_correct: false }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Header with Template Download */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Upload Quiz from JSON</h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload a JSON file containing your quiz data or paste JSON content below.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* File Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
        <FileJson className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">Click to upload a JSON file</p>
        <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
      </div>

      {/* JSON Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or paste JSON content directly:
        </label>
        <textarea
          value={jsonContent}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder='{"title": "Quiz Title", "questions": [...]}'
          className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Validation Results */}
      <AnimatePresence>
        {validation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Status Banner */}
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                validation.isValid
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {validation.isValid
                    ? `Valid JSON - ${parsedQuiz?.questions.length} questions ready to upload`
                    : 'Validation Failed'}
                </p>
                {!validation.isValid && (
                  <ul className="mt-2 space-y-1">
                    {validation.errors.map((error, i) => (
                      <li key={i} className="text-sm text-red-700">
                        - {error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Warnings</p>
                    <ul className="mt-2 space-y-1">
                      {validation.warnings.map((warning, i) => (
                        <li key={i} className="text-sm text-yellow-700">
                          - {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Preview */}
      {parsedQuiz && validation?.isValid && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview Quiz
            </span>
            <span className="text-sm text-gray-500">
              {showPreview ? 'Hide' : 'Show'} details
            </span>
          </button>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Title:</span>
                      <p className="font-medium text-gray-900">{parsedQuiz.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Questions:</span>
                      <p className="font-medium text-gray-900">{parsedQuiz.questions.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <p className="font-medium text-gray-900">{parsedQuiz.duration_minutes || 30} minutes</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Pass Score:</span>
                      <p className="font-medium text-gray-900">{parsedQuiz.pass_score || 60}%</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Questions Preview</h4>
                    <div className="space-y-3">
                      {parsedQuiz.questions.slice(0, 5).map((q, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-800">
                            {i + 1}. {q.question_text.substring(0, 100)}
                            {q.question_text.length > 100 ? '...' : ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {q.answers.length} options | Correct:{' '}
                            {q.answers.find((a) => a.is_correct)?.answer_text.substring(0, 30)}...
                          </p>
                        </div>
                      ))}
                      {parsedQuiz.questions.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          ... and {parsedQuiz.questions.length - 5} more questions
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={uploadQuiz}
          disabled={!validation?.isValid || uploading}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            validation?.isValid && !uploading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Quiz to Database
            </>
          )}
        </button>
        
        {jsonContent && (
          <button
            onClick={clearForm}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* JSON Format Reference */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">JSON Format Reference</h4>
        <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`{
  "title": "Quiz Title (required)",
  "description": "Optional description",
  "duration_minutes": 30,
  "pass_score": 60,
  "is_published": true,
  "questions": [
    {
      "question_text": "Question text (required)",
      "explanation": "Why this answer is correct",
      "answers": [
        { "answer_text": "Option A", "is_correct": false },
        { "answer_text": "Option B", "is_correct": true },
        { "answer_text": "Option C", "is_correct": false },
        { "answer_text": "Option D", "is_correct": false }
      ]
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
};
