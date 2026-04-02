/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Message = { role: "user" | "assistant"; content: string; id: string };

const MODULES = [
  {
    id: "communication",
    title: "Clinical Communication",
    desc: "Patient history taking, breaking bad news, doctor-patient communication.",
    accent: "#fb923c",
    lessons: ["History Taking Framework", "Breaking Bad News (SPIKES)", "Consent and Confidentiality", "Effective Handovers", "Communicating with Families"],
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
  {
    id: "leadership",
    title: "Leadership & Professionalism",
    desc: "Leading teams, medical ethics, healthcare management fundamentals.",
    accent: "#a78bfa",
    lessons: ["Medical Ethics Principles", "Team Leadership in Healthcare", "Time Management for Doctors", "Conflict Resolution", "Professional Identity Formation"],
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
  {
    id: "clinical",
    title: "Clinical Procedures",
    desc: "Step-by-step guides to common clinical procedures and skills.",
    accent: "#34d399",
    lessons: ["IV Line Insertion", "Urethral Catheterisation", "Venepuncture Technique", "Nasogastric Tube Insertion", "Wound Suturing Basics"],
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
  },
  {
    id: "research",
    title: "Research & Academic Writing",
    desc: "How to write case reports, conduct studies, and publish research.",
    accent: "#38bdf8",
    lessons: ["Writing a Case Report", "Understanding Study Designs", "Literature Review & PubMed", "Statistical Basics for Medics", "Getting Published as a Student"],
    icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
  },
];

export default function SkillsPage() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<typeof MODULES[0] | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lessonContent, setLessonContent] = useState<string>("");
  const [loadingLesson, setLoadingLesson] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const openLesson = async (module: typeof MODULES[0], lesson: string) => {
    setActiveModule(module);
    setActiveLesson(lesson);
    setMessages([]);
    setLessonContent("");
    setLoadingLesson(true);

    const puter = (window as any).puter;
    if (!puter?.ai?.chat) {
      setLessonContent("AI service unavailable. Please refresh.");
      setLoadingLesson(false);
      return;
    }

    try {
      const response = await puter.ai.chat(
        `You are a medical education expert teaching EBSU medical students. Create a comprehensive but concise lesson on "${lesson}" in the context of "${module.title}" for MBBS students in Nigeria. 

Format the response with:
1. A brief introduction (2-3 sentences)
2. Key Learning Points (bullet points)
3. Step-by-step guide or key concepts
4. Clinical Pearls / Tips
5. Common Mistakes to Avoid

Keep it practical, specific to the Nigerian/EBSU context where relevant. Use clear headings with **bold** for headers.`,
        false,
        { model: "gpt-5-nano" }
      );
      setLessonContent(typeof response === "string" ? response : response?.message?.content ?? response?.content ?? "Unable to load lesson content.");
    } catch {
      setLessonContent("Failed to load lesson. Please try again.");
    } finally {
      setLoadingLesson(false);
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !activeLesson) return;

    const userMsg: Message = { role: "user", content: trimmed, id: `u_${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const puter = (window as any).puter;
    if (!puter?.ai?.chat) {
      setLoading(false);
      return;
    }

    try {
      const response = await puter.ai.chat([
        { role: "system", content: `You are a medical education expert helping an EBSU MBBS student understand "${activeLesson}" in the module "${activeModule?.title}". Answer questions clearly, practically, and with Nigerian medical context where relevant.` },
        { role: "assistant", content: lessonContent },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: trimmed },
      ], false, { model: "gpt-5-nano" });
      const reply: Message = {
        role: "assistant", id: `a_${Date.now()}`,
        content: typeof response === "string" ? response : response?.message?.content ?? response?.content ?? "Sorry, please try again.",
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      // silent error
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-bold text-white mt-4 mb-1 first:mt-0">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith("- ")) {
        return <p key={i} className="text-gray-300 text-sm leading-relaxed pl-3 before:content-['•'] before:mr-2 before:text-current">{line.slice(2)}</p>;
      }
      if (/^\d+\./.test(line)) {
        return <p key={i} className="text-gray-300 text-sm leading-relaxed">{line}</p>;
      }
      return line ? <p key={i} className="text-gray-300 text-sm leading-relaxed">{line}</p> : <div key={i} className="h-1" />;
    });
  };

  if (activeLesson && activeModule) {
    return (
      <div className="min-h-screen flex flex-col pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
        <div className="px-4 pb-4 max-w-2xl mx-auto w-full">
          <button onClick={() => { setActiveLesson(null); setActiveModule(null); }}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Modules
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xss px-2 py-0.5 rounded-full font-bold" style={{ background: `${activeModule.accent}18`, color: activeModule.accent }}>{activeModule.title}</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-4">{activeLesson}</h1>

          {/* Lesson content */}
          <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {loadingLesson ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${activeModule.accent} transparent transparent transparent` }} />
                <p className="text-sm text-gray-400">Loading lesson content...</p>
              </div>
            ) : (
              <div className="prose-sm">{renderContent(lessonContent)}</div>
            )}
          </div>

          {/* Q&A */}
          <p className="text-xs font-bold text-white mb-3">Ask questions about this lesson</p>
          <div className="space-y-3 mb-4">
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm text-gray-200"}`}
                    style={m.role === "user" ? { background: `${activeModule.accent}25`, border: `1px solid ${activeModule.accent}40`, color: "white" } : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex gap-1 px-4 py-3 rounded-2xl rounded-tl-sm w-fit"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: activeModule.accent, animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="sticky bottom-0 px-4 py-3 max-w-2xl mx-auto w-full"
          style={{ background: "rgba(13,13,20,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${activeModule.accent}35` }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask a question about this lesson..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none py-1.5" />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30"
              style={{ background: activeModule.accent }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
      <div className="max-w-2xl mx-auto px-4">
        <button onClick={() => navigate("/u/premium/dashboard")}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)" }}>
              <svg className="w-6 h-6" fill="none" stroke="#fb923c" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Skills Acquisition</h1>
              <p className="text-xs text-gray-400 mt-0.5">AI-powered learning modules for MBBS students</p>
            </div>
          </div>

          <div className="space-y-4">
            {MODULES.map((mod, i) => (
              <motion.div key={mod.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${mod.accent}, transparent)` }} />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${mod.accent}18`, border: `1px solid ${mod.accent}30` }}>
                      <svg className="w-5 h-5" fill="none" stroke={mod.accent} viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={mod.icon} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{mod.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{mod.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {mod.lessons.map((lesson) => (
                      <button key={lesson} onClick={() => openLesson(mod, lesson)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all hover:opacity-90 active:scale-98 group"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{lesson}</span>
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke={mod.accent} viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
