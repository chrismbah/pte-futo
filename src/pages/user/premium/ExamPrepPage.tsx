/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

type ExamState = "select" | "loading" | "active" | "results";

const SUBJECTS = [
  { id: "anatomy", name: "Anatomy", accent: "#38bdf8", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" },
  { id: "physiology", name: "Physiology", accent: "#34d399", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
  { id: "biochemistry", name: "Biochemistry", accent: "#a78bfa", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
  { id: "pharmacology", name: "Pharmacology", accent: "#fb923c", icon: "M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" },
  { id: "pathology", name: "Pathology", accent: "#f472b6", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
  { id: "microbiology", name: "Microbiology", accent: "#2dd4bf", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5" },
  { id: "medicine", name: "Internal Medicine", accent: "#fbbf24", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" },
  { id: "surgery", name: "Surgery", accent: "#60a5fa", icon: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" },
  { id: "genetics", name: "Medical Genetics", accent: "#e879f9", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
];

const QUESTION_COUNTS = [10, 20, 30, 50];

export default function ExamPrepPage() {
  const navigate = useNavigate();
  const [examState, setExamState] = useState<ExamState>("select");
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [questionCount, setQuestionCount] = useState(20);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const startExam = async () => {
    if (!selectedSubject) return;
    setExamState("loading");
    setErrorMsg("");

    const puter = (window as any).puter;
    if (!puter?.ai?.chat) {
      setErrorMsg("AI service unavailable. Please refresh.");
      setExamState("select");
      return;
    }

    try {
      const response = await puter.ai.chat(
        `Generate ${questionCount} MBBS-style multiple choice questions on "${selectedSubject.name}" suitable for medical students at EBSU Nigeria.

Return ONLY a valid JSON array with this exact structure, no extra text:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["A. Option text", "B. Option text", "C. Option text", "D. Option text"],
    "correct": 0,
    "explanation": "Brief explanation of the correct answer with key clinical/academic details."
  }
]

Where "correct" is the 0-based index of the correct option (0=A, 1=B, 2=C, 3=D). Make questions clinically relevant and exam-style.`,
        false,
        { model: "gpt-5-nano" }
      );

      const text = typeof response === "string" ? response : response?.message?.content ?? response?.content ?? "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid response format");
      const parsed: Question[] = JSON.parse(jsonMatch[0]);
      setQuestions(parsed);
      setAnswers(new Array(parsed.length).fill(null));
      setCurrentQ(0);
      setSelected(null);
      setShowExplanation(false);
      setExamState("active");
    } catch {
      setErrorMsg("Failed to generate questions. Please try again.");
      setExamState("select");
    }
  };

  const submitAnswer = () => {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setExamState("results");
    }
  };

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const getGrade = () => {
    if (percent >= 70) return { label: "Pass", color: "#34d399" };
    if (percent >= 50) return { label: "Borderline", color: "#fbbf24" };
    return { label: "Fail", color: "#f87171" };
  };

  if (examState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}>
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#fbbf24 transparent transparent transparent" }} />
          </div>
          <p className="text-white font-bold mb-1">Generating {questionCount} questions...</p>
          <p className="text-gray-400 text-xs">on {selectedSubject?.name}</p>
        </div>
      </div>
    );
  }

  if (examState === "results") {
    const grade = getGrade();
    return (
      <div className="min-h-screen pb-20 pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
        <div className="max-w-xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
              style={{ background: `${grade.color}18`, border: `2px solid ${grade.color}40` }}>
              <p className="text-3xl font-black" style={{ color: grade.color }}>{percent}%</p>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{grade.label}</h2>
            <p className="text-gray-400 text-sm mb-1">{score} / {questions.length} correct on {selectedSubject?.name}</p>
            <p className="text-gray-500 text-xs mb-8">
              {percent >= 70 ? "Excellent work! Keep revising to maintain this level." : percent >= 50 ? "Good effort. Review the questions you missed." : "Keep practicing — focus on the areas you got wrong."}
            </p>

            {/* Review answers */}
            <div className="space-y-3 text-left mb-8">
              {questions.map((q, i) => {
                const userAns = answers[i];
                const correct = q.correct;
                const isRight = userAns === correct;
                return (
                  <div key={q.id} className="rounded-xl p-4" style={{ background: isRight ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)", border: `1px solid ${isRight ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}` }}>
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: isRight ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)" }}>
                        <svg className="w-3 h-3" fill="none" stroke={isRight ? "#34d399" : "#f87171"} viewBox="0 0 24 24" strokeWidth={2.5}>
                          {isRight ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
                        </svg>
                      </div>
                      <p className="text-xs text-white font-medium leading-relaxed">{q.question}</p>
                    </div>
                    <p className="text-xs pl-7 mb-1" style={{ color: isRight ? "#34d399" : "#f87171" }}>
                      Your answer: {userAns !== null ? q.options[userAns] : "Not answered"}
                    </p>
                    {!isRight && <p className="text-xs pl-7 text-emerald-400 mb-1">Correct: {q.options[correct]}</p>}
                    <p className="text-xss pl-7 text-gray-500 leading-relaxed">{q.explanation}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setExamState("select"); setSelectedSubject(null); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                Change Subject
              </button>
              <button onClick={() => startExam()}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)", color: "#1a0a00" }}>
                Retry Exam
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (examState === "active" && questions.length > 0) {
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;
    return (
      <div className="min-h-screen pb-20 pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
        <div className="max-w-xl mx-auto px-4">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">{selectedSubject?.name}</span>
              <span className="text-xs text-gray-400">Q{currentQ + 1} of {questions.length}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div className="h-full rounded-full" style={{ background: selectedSubject?.accent ?? "#fbbf24" }}
                animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}>
              <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-sm text-white font-medium leading-relaxed">{q.question}</p>
              </div>

              <div className="space-y-2.5 mb-4">
                {q.options.map((opt, idx) => {
                  let bg = "rgba(255,255,255,0.03)";
                  let border = "rgba(255,255,255,0.07)";
                  let textColor = "#d1d5db";
                  if (selected === idx && !showExplanation) { bg = `${selectedSubject?.accent}18`; border = `${selectedSubject?.accent}50`; textColor = "white"; }
                  if (showExplanation) {
                    if (idx === q.correct) { bg = "rgba(52,211,153,0.12)"; border = "rgba(52,211,153,0.4)"; textColor = "#34d399"; }
                    else if (idx === selected) { bg = "rgba(248,113,113,0.12)"; border = "rgba(248,113,113,0.4)"; textColor = "#f87171"; }
                  }
                  return (
                    <button key={idx} onClick={() => !showExplanation && setSelected(idx)}
                      disabled={showExplanation}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{ background: bg, border: `1px solid ${border}` }}>
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xss font-bold flex-shrink-0"
                        style={{ background: selected === idx || (showExplanation && idx === q.correct) ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)", color: textColor }}>
                        {["A","B","C","D"][idx]}
                      </span>
                      <span className="text-xs leading-relaxed" style={{ color: textColor }}>{opt.replace(/^[A-D]\.\s?/, "")}</span>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl px-4 py-3 mb-4" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <p className="text-xs font-bold text-amber-300 mb-1">Explanation</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{q.explanation}</p>
                </motion.div>
              )}

              <div className="flex gap-3">
                {!showExplanation ? (
                  <button onClick={submitAnswer} disabled={selected === null}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-30"
                    style={{ background: `linear-gradient(135deg, ${selectedSubject?.accent ?? "#fbbf24"}, ${selectedSubject?.accent ?? "#d97706"})`, color: "#0d0d14" }}>
                    Submit Answer
                  </button>
                ) : (
                  <button onClick={nextQuestion}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${selectedSubject?.accent ?? "#fbbf24"}, ${selectedSubject?.accent ?? "#d97706"})`, color: "#0d0d14" }}>
                    {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
      <div className="max-w-xl mx-auto px-4">
        <button onClick={() => navigate("/u/premium/dashboard")}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}>
              <svg className="w-6 h-6" fill="none" stroke="#fbbf24" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Exam Prep Vault</h1>
              <p className="text-xs text-gray-400 mt-0.5">AI-generated MBBS mock exams — practice any subject</p>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl px-4 py-3 mb-4 text-xs text-red-400"
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>{errorMsg}</div>
          )}

          <p className="text-xs font-bold text-white mb-3">Choose a Subject</p>
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {SUBJECTS.map((s) => (
              <button key={s.id} onClick={() => setSelectedSubject(s)}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left transition-all active:scale-97"
                style={{
                  background: selectedSubject?.id === s.id ? `${s.accent}18` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedSubject?.id === s.id ? `${s.accent}50` : "rgba(255,255,255,0.07)"}`,
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.accent}18`, border: `1px solid ${s.accent}30` }}>
                  <svg className="w-4 h-4" fill="none" stroke={s.accent} viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
                <span className="text-xs font-semibold" style={{ color: selectedSubject?.id === s.id ? s.accent : "#d1d5db" }}>{s.name}</span>
              </button>
            ))}
          </div>

          <p className="text-xs font-bold text-white mb-3">Number of Questions</p>
          <div className="flex gap-2 mb-8">
            {QUESTION_COUNTS.map((n) => (
              <button key={n} onClick={() => setQuestionCount(n)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: questionCount === n ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${questionCount === n ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.07)"}`,
                  color: questionCount === n ? "#fbbf24" : "#6b7280",
                }}>
                {n} Qs
              </button>
            ))}
          </div>

          <button onClick={startExam} disabled={!selectedSubject}
            className="w-full py-4 rounded-xl text-sm font-black transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)", color: "#1a0a00", boxShadow: "0 4px 20px rgba(251,191,36,0.25)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            {selectedSubject ? `Start ${questionCount}-Question Exam on ${selectedSubject.name}` : "Select a subject to begin"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
