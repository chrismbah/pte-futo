/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Message = { role: "user" | "assistant"; content: string; id: string };

const TRACKS = [
  {
    id: "python",
    title: "Python for Medicine",
    level: "Beginner",
    lessons: 8,
    accent: "#60a5fa",
    desc: "Learn Python from scratch using medical examples — data analysis, statistics, and automation for doctors.",
    modules: ["Python Basics & Setup", "Variables & Data Types", "Functions & Loops", "Pandas for Patient Data", "Matplotlib for Clinical Graphs", "Basic Statistics in Python", "Reading & Writing Medical Files", "Mini Project: Patient Data Analysis"],
    icon: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
  },
  {
    id: "webdev",
    title: "Web Dev for Health Apps",
    level: "Beginner",
    lessons: 6,
    accent: "#34d399",
    desc: "Build simple health-tracking web apps with HTML, CSS, and basic JavaScript.",
    modules: ["HTML & Web Structure", "CSS Styling & Layouts", "JavaScript Basics", "Building a BMI Calculator", "Creating a Health Form App", "Deploying Your App Online"],
    icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  },
  {
    id: "ai-tools",
    title: "AI Tools for Clinicians",
    level: "Intermediate",
    lessons: 5,
    accent: "#a78bfa",
    desc: "Practical use of AI tools — ChatGPT, medical imaging AI, literature search, and clinical decision support.",
    modules: ["AI in Modern Medicine Overview", "Using ChatGPT for Clinical Notes", "AI-Powered Literature Search (PubMed AI, Elicit)", "Medical Imaging & AI Diagnostics", "Building Simple AI Workflows"],
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z",
  },
  {
    id: "data",
    title: "Health Data Science",
    level: "Intermediate",
    lessons: 6,
    accent: "#fbbf24",
    desc: "Understand and analyse healthcare datasets using spreadsheets, SPSS-like tools, and Python.",
    modules: ["Understanding Health Datasets", "Data Cleaning for Medical Research", "Descriptive Statistics", "Inferential Statistics Basics", "Visualising Clinical Data", "Writing a Data-Driven Research Paper"],
    icon: "M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z",
  },
];

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "#34d399",
  Intermediate: "#fbbf24",
  Advanced: "#f87171",
};

export default function TechSkillsPage() {
  const navigate = useNavigate();
  const [activeTrack, setActiveTrack] = useState<typeof TRACKS[0] | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState("");
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const openModule = async (track: typeof TRACKS[0], module: string) => {
    setActiveTrack(track);
    setActiveModule(module);
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
        `You are a tech educator teaching "${module}" as part of the "${track.title}" track for EBSU medical students who are beginners/intermediate in tech. 

Create a practical, engaging lesson that:
1. Starts with a brief intro relevant to medicine/healthcare
2. Has clear **Key Concepts** with explanations
3. Includes a practical **Code Example** or **Hands-on Exercise** (where relevant) using medical scenarios (e.g., patient data, BMI, drug dosing)
4. Has **Practice Tasks** for the student
5. Ends with **Next Steps**

Use **bold** for headers. Keep code in simple blocks. Make it approachable for a medical student with no prior tech background (if beginner level).`,
        false,
        { model: "gpt-5-nano" }
      );
      setLessonContent(typeof response === "string" ? response : response?.message?.content ?? response?.content ?? "Unable to load lesson.");
    } catch {
      setLessonContent("Failed to load lesson. Please try again.");
    } finally {
      setLoadingLesson(false);
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !activeModule) return;
    const userMsg: Message = { role: "user", content: trimmed, id: `u_${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const puter = (window as any).puter;
    if (!puter?.ai?.chat) { setLoading(false); return; }

    try {
      const response = await puter.ai.chat([
        { role: "system", content: `You are a tech educator helping an EBSU medical student learn "${activeModule}" in the "${activeTrack?.title}" track. Answer questions clearly, with code examples where helpful. Use medical/health context.` },
        { role: "assistant", content: lessonContent },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: trimmed },
      ], false, { model: "gpt-5-nano" });
      const reply: Message = { role: "assistant", id: `a_${Date.now()}`, content: typeof response === "string" ? response : response?.message?.content ?? response?.content ?? "Please try again." };
      setMessages((prev) => [...prev, reply]);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const renderContent = (text: string) => text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold text-white mt-4 mb-1 text-sm first:mt-0">{line.slice(2, -2)}</p>;
    if (line.startsWith("```") || line.endsWith("```")) return <div key={i} className="font-mono text-xs text-green-300" />;
    if (line.startsWith("- ")) return <p key={i} className="text-gray-300 text-sm leading-relaxed pl-3 before:content-['•'] before:mr-2">{line.slice(2)}</p>;
    return line ? <p key={i} className="text-gray-300 text-sm leading-relaxed font-mono">{line}</p> : <div key={i} className="h-1" />;
  });

  if (activeModule && activeTrack) {
    return (
      <div className="min-h-screen flex flex-col pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
        <div className="px-4 pb-4 max-w-2xl mx-auto w-full">
          <button onClick={() => { setActiveModule(null); setActiveTrack(null); }}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Tracks
          </button>
          <span className="text-xss px-2 py-0.5 rounded-full font-bold mb-2 inline-block" style={{ background: `${activeTrack.accent}18`, color: activeTrack.accent }}>{activeTrack.title}</span>
          <h1 className="text-xl font-bold text-white mb-4">{activeModule}</h1>

          <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {loadingLesson ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: `${activeTrack.accent} transparent transparent transparent` }} />
                <p className="text-sm text-gray-400">Loading lesson...</p>
              </div>
            ) : <div>{renderContent(lessonContent)}</div>}
          </div>

          <p className="text-xs font-bold text-white mb-3">Ask a question</p>
          <div className="space-y-3 mb-4">
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm text-gray-200"}`}
                    style={m.role === "user" ? { background: `${activeTrack.accent}25`, border: `1px solid ${activeTrack.accent}40`, color: "white" } : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex gap-1 px-4 py-3 rounded-2xl rounded-tl-sm w-fit"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {[0,1,2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: activeTrack.accent, animationDelay: `${i*150}ms` }} />)}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="sticky bottom-0 px-4 py-3 max-w-2xl mx-auto w-full"
          style={{ background: "rgba(13,13,20,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${activeTrack.accent}35` }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask about this lesson..." className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none py-1.5" />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30"
              style={{ background: activeTrack.accent }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)" }}>
              <svg className="w-6 h-6" fill="none" stroke="#60a5fa" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Tech Skills for Doctors</h1>
              <p className="text-xs text-gray-400 mt-0.5">Structured learning tracks for the digital age of medicine</p>
            </div>
          </div>

          <div className="space-y-4">
            {TRACKS.map((track, i) => (
              <motion.div key={track.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${track.accent}, transparent)` }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${track.accent}18`, border: `1px solid ${track.accent}30` }}>
                        <svg className="w-5 h-5" fill="none" stroke={track.accent} viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={track.icon} />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{track.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{track.desc}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                      <span className="text-xss px-2 py-0.5 rounded-full font-bold" style={{ background: `${LEVEL_COLORS[track.level]}18`, color: LEVEL_COLORS[track.level] }}>{track.level}</span>
                      <span className="text-xss text-gray-500">{track.lessons} lessons</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-3">
                    {track.modules.map((mod, j) => (
                      <button key={mod} onClick={() => openModule(track, mod)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all hover:opacity-90 active:scale-98 group"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xss w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                            style={{ background: `${track.accent}18`, color: track.accent }}>{j + 1}</span>
                          <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{mod}</span>
                        </div>
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke={track.accent} viewBox="0 0 24 24" strokeWidth={2.5}>
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
