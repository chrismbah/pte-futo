/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import {
  BookOpen,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  RotateCcw,
  Trophy,
  Zap,
  Target,
  ArrowLeft,
  Play,
  Shuffle,
  MessageSquare,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizFromDB {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  duration_minutes: number;
  pass_score: number;
  is_published: boolean;
}

interface QuestionFromDB {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  explanation: string | null;
  points: number;
  order_index: number;
}

interface AnswerFromDB {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  order_index: number;
}

interface Option {
  label: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
}

type QuizMode = "select" | "setup" | "quiz" | "review" | "results";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const LABELS = ["A", "B", "C", "D", "E", "F"];

// Subject color mapping for quiz cards
const CARD_COLORS: Record<number, { bg: string; accent: string; icon: string }> = {
  0: { bg: "from-emerald-500 to-teal-600", accent: "bg-emerald-100 text-emerald-700", icon: "🧬" },
  1: { bg: "from-blue-500 to-indigo-600", accent: "bg-blue-100 text-blue-700", icon: "🔬" },
  2: { bg: "from-violet-500 to-purple-600", accent: "bg-violet-100 text-violet-700", icon: "⚗️" },
  3: { bg: "from-orange-500 to-red-500", accent: "bg-orange-100 text-orange-700", icon: "🫀" },
  4: { bg: "from-cyan-500 to-blue-500", accent: "bg-cyan-100 text-cyan-700", icon: "🧪" },
  5: { bg: "from-rose-500 to-pink-600", accent: "bg-rose-100 text-rose-700", icon: "💊" },
};

// ─── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 80, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#059669"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

// ─── Timer Display ─────────────────────────────────────────────────────────────
function Timer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds > 0 && seconds <= 30;
  return (
    <motion.div
      animate={isLow ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm border ${
        isLow
          ? "bg-red-50 text-red-600 border-red-200"
          : "bg-white text-gray-700 border-gray-200"
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </motion.div>
  );
}

// ─── Option Button ─────────────────────────────────────────────────────────────
function OptionBtn({
  opt,
  selected,
  correct,
  revealed,
  onClick,
}: {
  opt: Option;
  selected: string | null;
  correct: string;
  revealed: boolean;
  onClick: () => void;
}) {
  const isSelected = selected === opt.label;
  const isCorrect = opt.label === correct;

  let state: "default" | "selected" | "correct" | "wrong" | "missed" = "default";
  if (revealed) {
    if (isCorrect) state = "correct";
    else if (isSelected && !isCorrect) state = "wrong";
    else state = "missed";
  } else if (isSelected) {
    state = "selected";
  }

  const styles: Record<string, string> = {
    default:
      "bg-white border-gray-200 text-gray-800 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md cursor-pointer",
    selected:
      "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 cursor-pointer",
    correct:
      "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100",
    wrong:
      "bg-red-500 border-red-500 text-white shadow-lg shadow-red-100",
    missed:
      "bg-gray-50 border-gray-100 text-gray-400",
  };

  return (
    <motion.button
      whileHover={state === "default" ? { x: 4 } : {}}
      whileTap={state === "default" || state === "selected" ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={revealed}
      className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${styles[state]}`}
    >
      <span
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
          state === "default"
            ? "border-gray-200 text-gray-500 bg-gray-50"
            : "border-white/30 text-current bg-white/20"
        }`}
      >
        {opt.label}
      </span>
      <span className="text-sm leading-relaxed pt-0.5">{opt.text}</span>
      {revealed && state === "correct" && <CheckCircle2 className="w-5 h-5 ml-auto flex-shrink-0 mt-0.5" />}
      {revealed && state === "wrong" && <XCircle className="w-5 h-5 ml-auto flex-shrink-0 mt-0.5" />}
    </motion.button>
  );
}

// ─── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        value ? "bg-emerald-600" : "bg-gray-200"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${
          value ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuizCardPage() {
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizFromDB[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizFromDB | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [mode, setMode] = useState<QuizMode>("select");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(0);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string | null>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("id, title, description, total_questions, duration_minutes, pass_score, is_published")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) {
          toast.error("Failed to load quizzes");
          setAvailableQuizzes([]);
        } else {
          setAvailableQuizzes(data || []);
        }
      } catch {
        setAvailableQuizzes([]);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Timer
  const endQuiz = useCallback(() => {
    setTimerActive(false);
    setMode("results");
  }, []);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); endQuiz(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerActive, endQuiz, timeLeft]);

  const handleSelectQuiz = (quiz: QuizFromDB) => {
    setSelectedQuiz(quiz);
    setQuestionCount(Math.min(quiz.total_questions, 10));
    setTimeLimit(0);
    setMode("setup");
  };

  const startQuiz = async () => {
    if (!selectedQuiz) return;
    setLoadingQuestions(true);
    try {
      const { data: qData, error: qErr } = await supabase
        .from("quiz_questions")
        .select("id, quiz_id, question_text, question_type, explanation, points, order_index")
        .eq("quiz_id", selectedQuiz.id)
        .order("order_index", { ascending: true });

      if (qErr || !qData || qData.length === 0) {
        toast.error("No questions found for this quiz.");
        return;
      }

      const qIds = qData.map((q: QuestionFromDB) => q.id);
      const { data: aData, error: aErr } = await supabase
        .from("quiz_answers")
        .select("id, question_id, answer_text, is_correct, order_index")
        .in("question_id", qIds)
        .order("order_index", { ascending: true });

      if (aErr) { toast.error("Failed to load answers."); return; }

      const byQ: Record<string, AnswerFromDB[]> = {};
      (aData || []).forEach((a: AnswerFromDB) => {
        byQ[a.question_id] = byQ[a.question_id] || [];
        byQ[a.question_id].push(a);
      });

      const formatted: QuizQuestion[] = qData.map((q: QuestionFromDB) => {
        const raw = byQ[q.id] || [];
        const shuffled = shuffleOptions ? shuffle(raw) : raw;
        const options: Option[] = shuffled.map((a, i) => ({ label: LABELS[i] || String(i + 1), text: a.answer_text }));
        const correctIdx = shuffled.findIndex((a) => a.is_correct);
        return {
          id: q.id,
          question: q.question_text,
          options,
          correctAnswer: LABELS[correctIdx] || "A",
          explanation: q.explanation || "No explanation provided.",
        };
      });

      const picked = shuffle(formatted).slice(0, questionCount);
      setQuestions(picked);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setRevealed(false);
      setAnswers({});
      setReviewIndex(0);
      if (timeLimit > 0) { setTimeLeft(timeLimit * 60); setTimerActive(true); }
      setMode("quiz");
    } catch {
      toast.error("Failed to start quiz.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelect = (label: string) => {
    if (revealed) return;
    setSelectedAnswer(label);
    if (!showExplanations) setAnswers((p) => ({ ...p, [currentIndex]: label }));
  };

  const handleReveal = () => {
    if (!selectedAnswer) return;
    setRevealed(true);
    setAnswers((p) => ({ ...p, [currentIndex]: selectedAnswer }));
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setTimerActive(false);
      setMode("results");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setRevealed(false);
    }
  };

  const handleSkip = () => {
    setAnswers((p) => ({ ...p, [currentIndex]: null }));
    handleNext();
  };

  const score = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = selectedQuiz ? pct >= (selectedQuiz.pass_score || 60) : false;

  const filteredQuizzes = availableQuizzes.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const slide = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -24 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  };

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="pt-[70px] xxss:pt-[80px] ss:pt-[90px] sm:pt-[105px] min-h-screen flex flex-col">

        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center gap-2">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </NavLink>
          <span className="text-gray-300 text-sm">/</span>
          <span className="text-sm font-semibold text-gray-900">
            {mode === "select" ? "Quiz Library" : mode === "setup" ? "Configure" : mode === "results" ? "Results" : mode === "review" ? "Review" : selectedQuiz?.title}
          </span>
          {mode === "quiz" && timeLimit > 0 && (
            <div className="ml-auto">
              <Timer seconds={timeLeft} />
            </div>
          )}
          {mode === "quiz" && (
            <div className={`${timeLimit > 0 ? "" : "ml-auto"} flex items-center gap-2`}>
              <span className="text-xs text-gray-500 font-medium">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">

            {/* ═════��══════════════ SELECT SCREEN ════════════════════ */}
            {mode === "select" && (
              <motion.div key="select" {...slide} className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Hero */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                    <Zap className="w-3.5 h-3.5" />
                    Quiz Library
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-balance">
                    Test Your Knowledge
                  </h1>
                  <p className="text-gray-500 mt-2 text-base">
                    Select a quiz uploaded by your instructors to begin your session.
                  </p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search quizzes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 shadow-sm transition"
                  />
                </div>

                {loadingQuizzes ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
                    </div>
                    <p className="text-gray-500 text-sm">Loading quizzes...</p>
                  </div>
                ) : filteredQuizzes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <BookOpen className="w-9 h-9 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800">No Quizzes Found</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {searchQuery ? "Try a different search term." : "Check back later or contact your instructor."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuizzes.map((quiz, idx) => {
                      const color = CARD_COLORS[idx % Object.keys(CARD_COLORS).length];
                      return (
                        <motion.button
                          key={quiz.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ y: -4, shadow: "lg" }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSelectQuiz(quiz)}
                          className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden"
                        >
                          {/* Card header gradient */}
                          <div className={`bg-gradient-to-br ${color.bg} p-5 relative overflow-hidden`}>
                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
                            <span className="text-3xl relative z-10">{color.icon}</span>
                            <div className="mt-3 relative z-10">
                              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white`}>
                                {quiz.total_questions} Questions
                              </span>
                            </div>
                          </div>
                          {/* Card body */}
                          <div className="p-5">
                            <h3 className="font-bold text-gray-900 text-base leading-snug mb-1.5 group-hover:text-emerald-700 transition-colors">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                              {quiz.description || "No description provided."}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {quiz.duration_minutes > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {quiz.duration_minutes} min
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Target className="w-3.5 h-3.5" />
                                Pass: {quiz.pass_score}%
                              </span>
                              <span className="ml-auto flex items-center gap-1 text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                Start
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════════════════ SETUP SCREEN ════════════════════ */}
            {mode === "setup" && selectedQuiz && (
              <motion.div key="setup" {...slide} className="max-w-lg mx-auto px-4 sm:px-6 py-8">
                <button
                  onClick={() => setMode("select")}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 text-sm font-medium mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Library
                </button>

                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 text-balance">{selectedQuiz.title}</h1>
                  <p className="text-gray-500 text-sm mt-1">{selectedQuiz.description || "Configure your session below."}</p>
                </div>

                <div className="space-y-4">
                  {/* Question Count */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">Number of Questions</span>
                      </div>
                      <span className="text-2xl font-bold text-emerald-600">{questionCount}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={selectedQuiz.total_questions}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                      <span>1</span>
                      <span>{selectedQuiz.total_questions} available</span>
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">Time Limit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {timeLimit === 0 ? "∞" : timeLimit < 60 ? `${timeLimit}m` : "1 hr"}
                        </span>
                        {/* No limit toggle */}
                        <button
                          onClick={() => setTimeLimit(timeLimit === 0 ? 10 : 0)}
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-all ${
                            timeLimit === 0
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-500 border-gray-200 hover:border-blue-400"
                          }`}
                        >
                          {timeLimit === 0 ? "No Limit" : "Set Limit"}
                        </button>
                      </div>
                    </div>

                    {timeLimit !== 0 && (
                      <>
                        <input
                          type="range"
                          min={1}
                          max={60}
                          step={1}
                          value={timeLimit}
                          onChange={(e) => setTimeLimit(Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-600"
                        />
                        {/* Minute markers */}
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                          <span>1 min</span>
                          <span>15 min</span>
                          <span>30 min</span>
                          <span>45 min</span>
                          <span>1 hr</span>
                        </div>
                        {/* Quick preset buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {[5, 10, 15, 20, 30, 45, 60].map((t) => (
                            <button
                              key={t}
                              onClick={() => setTimeLimit(t)}
                              className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
                                timeLimit === t
                                  ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100"
                                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                              }`}
                            >
                              {t === 60 ? "1 hr" : `${t} min`}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-blue-500 font-medium mt-3 text-center">
                          {timeLimit} minute{timeLimit !== 1 ? "s" : ""} selected — drag or tap a preset
                        </p>
                      </>
                    )}

                    {timeLimit === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">
                        No time limit — take as long as you need. Tap "Set Limit" to add a timer.
                      </p>
                    )}
                  </div>

                  {/* Toggles */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Options</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                          <Shuffle className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Shuffle Options</p>
                          <p className="text-xs text-gray-500">Randomise answer order</p>
                        </div>
                      </div>
                      <Toggle value={shuffleOptions} onChange={() => setShuffleOptions((v) => !v)} />
                    </div>
                    <div className="h-px bg-gray-50" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Show Explanations</p>
                          <p className="text-xs text-gray-500">Display after each answer</p>
                        </div>
                      </div>
                      <Toggle value={showExplanations} onChange={() => setShowExplanations((v) => !v)} />
                    </div>
                  </div>

                  {/* Summary pill */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <BookOpen className="w-3.5 h-3.5" /> {questionCount} questions
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> {timeLimit === 0 ? "No time limit" : timeLimit === 60 ? "1 hour" : `${timeLimit} min`}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <Target className="w-3.5 h-3.5" /> Pass at {selectedQuiz.pass_score}%
                    </span>
                  </div>

                  {/* Start button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startQuiz}
                    disabled={loadingQuestions}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  >
                    {loadingQuestions ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Loading Questions...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-white" /> Start Quiz
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ════════════════════ QUIZ SCREEN ════════════════════ */}
            {mode === "quiz" && q && (
              <motion.div key={`quiz-${currentIndex}`} {...slide} className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{currentIndex + 1} of {questions.length}</span>
                    <span>{Math.round((currentIndex / questions.length) * 100)}% complete</span>
                  </div>
                </div>

                {/* Question card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-sm shadow-emerald-200">
                      {currentIndex + 1}
                    </span>
                    <p className="text-gray-900 font-semibold text-base leading-relaxed">{q.question}</p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {q.options.map((opt) => (
                      <OptionBtn
                        key={opt.label}
                        opt={opt}
                        selected={selectedAnswer}
                        correct={q.correctAnswer}
                        revealed={revealed}
                        onClick={() => handleSelect(opt.label)}
                      />
                    ))}
                  </div>

                  {/* Explanation */}
                  <AnimatePresence>
                    {revealed && showExplanations && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className={`rounded-xl p-4 border-l-4 ${
                          selectedAnswer === q.correctAnswer
                            ? "bg-emerald-50 border-emerald-500"
                            : "bg-red-50 border-red-400"
                        }`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            {selectedAnswer === q.correctAnswer
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              : <XCircle className="w-4 h-4 text-red-500" />
                            }
                            <span className={`text-xs font-bold uppercase tracking-wider ${
                              selectedAnswer === q.correctAnswer ? "text-emerald-700" : "text-red-600"
                            }`}>
                              {selectedAnswer === q.correctAnswer ? "Correct!" : "Incorrect"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {!revealed && showExplanations ? (
                    <>
                      <button
                        onClick={handleSkip}
                        className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors"
                      >
                        <SkipForward className="w-4 h-4" /> Skip
                      </button>
                      <motion.button
                        whileHover={{ scale: selectedAnswer ? 1.02 : 1 }}
                        whileTap={{ scale: selectedAnswer ? 0.97 : 1 }}
                        onClick={handleReveal}
                        disabled={!selectedAnswer}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                          selectedAnswer
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-100 hover:bg-emerald-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Check Answer
                      </motion.button>
                    </>
                  ) : !revealed && !showExplanations ? (
                    <>
                      <button
                        onClick={handleSkip}
                        className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors"
                      >
                        <SkipForward className="w-4 h-4" /> Skip
                      </button>
                      <motion.button
                        whileHover={{ scale: selectedAnswer ? 1.02 : 1 }}
                        onClick={handleNext}
                        disabled={!selectedAnswer}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                          selectedAnswer
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-100 hover:bg-emerald-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNext}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-colors"
                    >
                      {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                {/* Question dots */}
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-200 ${
                        i === currentIndex
                          ? "w-6 h-2 bg-emerald-600"
                          : answers[i] === undefined
                          ? "w-2 h-2 bg-gray-200"
                          : answers[i] === questions[i].correctAnswer
                          ? "w-2 h-2 bg-emerald-400"
                          : "w-2 h-2 bg-red-400"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ════════════════════ RESULTS SCREEN ════════════════════ */}
            {mode === "results" && (
              <motion.div key="results" {...slide} className="max-w-lg mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">

                {/* Score card */}
                <div className={`rounded-3xl p-8 text-center relative overflow-hidden ${
                  passed
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                    : pct >= 50
                    ? "bg-gradient-to-br from-amber-400 to-orange-500"
                    : "bg-gradient-to-br from-red-500 to-rose-600"
                }`}>
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-4 border-white" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full border-4 border-white" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                      <Trophy className="w-3.5 h-3.5" />
                      {passed ? "Quiz Passed!" : pct >= 50 ? "Almost There" : "Keep Practicing"}
                    </div>
                    <div className="flex items-center justify-center mb-3">
                      <div className="relative">
                        <ProgressRing pct={pct} size={120} stroke={8} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-black text-white">{pct}%</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-white/90 text-lg font-semibold">
                      {score} / {questions.length} correct
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Correct", value: score, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Wrong", value: questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correctAnswer).length, color: "text-red-500", bg: "bg-red-50" },
                    { label: "Skipped", value: questions.filter((_, i) => answers[i] === undefined).length, color: "text-gray-500", bg: "bg-gray-50" },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                      <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setReviewIndex(0); setMode("review"); }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" /> Review Answers
                  </motion.button>
                  <div className="flex gap-2.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setMode("setup"); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Retry
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setMode("select")}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-colors"
                    >
                      New Quiz <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════════════ REVIEW SCREEN ════════════════════ */}
            {mode === "review" && questions[reviewIndex] && (
              <motion.div key={`review-${reviewIndex}`} {...slide} className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setMode("results")}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 text-sm font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Results
                  </button>
                  <span className="text-sm font-semibold text-gray-500">
                    {reviewIndex + 1} / {questions.length}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shadow-sm ${
                      answers[reviewIndex] === questions[reviewIndex].correctAnswer
                        ? "bg-emerald-600 text-white shadow-emerald-200"
                        : "bg-red-500 text-white shadow-red-200"
                    }`}>
                      {reviewIndex + 1}
                    </span>
                    <p className="text-gray-900 font-semibold text-base leading-relaxed">
                      {questions[reviewIndex].question}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {questions[reviewIndex].options.map((opt) => (
                      <OptionBtn
                        key={opt.label}
                        opt={opt}
                        selected={answers[reviewIndex] || null}
                        correct={questions[reviewIndex].correctAnswer}
                        revealed={true}
                        onClick={() => {}}
                      />
                    ))}
                  </div>

                  <div className={`mt-4 rounded-xl p-4 border-l-4 ${
                    answers[reviewIndex] === questions[reviewIndex].correctAnswer
                      ? "bg-emerald-50 border-emerald-500"
                      : "bg-red-50 border-red-400"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {answers[reviewIndex] === questions[reviewIndex].correctAnswer
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        answers[reviewIndex] === questions[reviewIndex].correctAnswer
                          ? "text-emerald-700" : "text-red-600"
                      }`}>
                        {answers[reviewIndex] === questions[reviewIndex].correctAnswer ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{questions[reviewIndex].explanation}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
                    disabled={reviewIndex === 0}
                    className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={() => {
                      if (reviewIndex + 1 >= questions.length) setMode("results");
                      else setReviewIndex((i) => i + 1);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-colors"
                  >
                    {reviewIndex + 1 >= questions.length ? "Finish Review" : "Next"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
