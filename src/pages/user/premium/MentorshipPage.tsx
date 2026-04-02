/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
  id: string;
};

const SYSTEM_PROMPT = `You are an experienced EBSU (Ebonyi State University) medical school mentor. You are a final-year medical student and clinical mentor who helps MBBS students with:
- Academic guidance, study strategies, and exam preparation (MBBS, OSCE, clinical exams)
- Career advice in medicine (residency, fellowships, NYSC postings, electives)
- Clinical skills and patient management advice
- Research and publication guidance for medical students
- Mental health, burnout, and work-life balance in medical school
- Navigating the Nigerian medical education system

Be warm, encouraging, and practical. Give specific, actionable advice. Use examples from Nigerian medical school context. Keep responses concise but helpful.`;

const QUICK_PROMPTS = [
  "How do I prepare for MBBS clinical exams?",
  "What are the best study techniques for pre-clinical years?",
  "How do I get into a competitive residency program?",
  "How to manage burnout in medical school?",
  "How do I start doing medical research as a student?",
  "What electives should I apply for internationally?",
];

export default function MentorshipPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      id: "welcome",
      content: "Hello! I'm your AI Mentor — trained on medical education and the EBSU experience. Whether it's exam prep, career guidance, or just needing someone to talk to about the challenges of med school, I'm here.\n\nWhat's on your mind today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed, id: `u_${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    const puter = (window as any).puter;
    if (!puter?.ai?.chat) {
      setError("AI service not available. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await puter.ai.chat([
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
      ], false, { model: "gpt-5-nano" });

      const reply: Message = {
        role: "assistant",
        id: `a_${Date.now()}`,
        content: typeof response === "string" ? response : response?.message?.content ?? response?.content ?? "Sorry, I couldn't generate a response. Please try again.",
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-0" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>

      {/* Header */}
      <div className="px-4 pb-4 max-w-2xl mx-auto w-full">
        <button
          onClick={() => navigate("/u/premium/dashboard")}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)" }}>
            <svg className="w-6 h-6" fill="none" stroke="#34d399" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Academic Mentor</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-emerald-400 font-medium">Online — ready to help</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 max-w-2xl mx-auto w-full mb-3">
          <p className="text-xss text-gray-500 mb-2 font-medium uppercase tracking-wider">Quick questions</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((q) => (
              <button key={q} onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:bg-emerald-500/20 active:scale-95"
                style={{ background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 px-4 max-w-2xl mx-auto w-full overflow-y-auto space-y-4 pb-4" style={{ minHeight: 0 }}>
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                  style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="#34d399" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "rounded-tr-sm text-white"
                  : "rounded-tl-sm text-gray-200"
              }`}
                style={m.role === "user" ? {
                  background: "linear-gradient(135deg, rgba(52,211,153,0.25), rgba(16,185,129,0.15))",
                  border: "1px solid rgba(52,211,153,0.3)",
                } : {
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="#34d399" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex gap-1 px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </motion.div>
        )}

        {error && (
          <div className="text-xs text-red-400 px-4 py-2 rounded-xl"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 px-4 py-3 max-w-2xl mx-auto w-full"
        style={{ background: "rgba(13,13,20,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-end gap-2 rounded-2xl px-4 py-2"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(52,211,153,0.25)" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask your mentor anything..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none py-1.5 max-h-32"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30 mb-0.5"
            style={{ background: "linear-gradient(135deg, #34d399, #10b981)" }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xss text-gray-600 text-center mt-1.5">Powered by ChatGPT 5nano via puter.js · Press Enter to send</p>
      </div>
    </div>
  );
}
