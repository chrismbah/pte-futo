/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type CVData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  objective: string;
  education: string;
  clinicalRotations: string;
  research: string;
  publications: string;
  volunteering: string;
  skills: string;
  references: string;
};

type Step = keyof CVData;

const STEPS: { key: Step; label: string; placeholder: string; multiline?: boolean; accent: string }[] = [
  { key: "fullName", label: "Full Name", placeholder: "e.g. Dr. John Emeka Obi", accent: "#60a5fa" },
  { key: "email", label: "Email Address", placeholder: "e.g. johnobi@ebsu.edu.ng", accent: "#60a5fa" },
  { key: "phone", label: "Phone Number", placeholder: "e.g. +234 801 234 5678", accent: "#60a5fa" },
  { key: "address", label: "Address / Location", placeholder: "e.g. Abakaliki, Ebonyi State, Nigeria", accent: "#60a5fa" },
  { key: "objective", label: "Professional Objective", placeholder: "A brief statement about your career goals as a medical professional...", multiline: true, accent: "#a78bfa" },
  { key: "education", label: "Education History", placeholder: "MBBS — Ebonyi State University, 2020–present\nSSCE — Government Secondary School, 2019", multiline: true, accent: "#34d399" },
  { key: "clinicalRotations", label: "Clinical Rotations & Postings", placeholder: "Internal Medicine — EBSU Teaching Hospital (3 months)\nSurgery — EBSU Teaching Hospital (2 months)", multiline: true, accent: "#fb923c" },
  { key: "research", label: "Research Experience", placeholder: "Co-investigator: 'Prevalence of Hypertension in EBSU Students' — 2023\nResearch methodology training — EBSUMSA Research Club", multiline: true, accent: "#f472b6" },
  { key: "publications", label: "Publications & Presentations", placeholder: "Oral presentation: NAMS Conference 2023 — 'Antimicrobial Resistance in LMIC'\n(Leave blank if none)", multiline: true, accent: "#fbbf24" },
  { key: "volunteering", label: "Volunteering & Activities", placeholder: "Health Outreach Coordinator — EBSUMSA (2022–present)\nBlood Drive Volunteer — Red Cross EBSU Chapter", multiline: true, accent: "#2dd4bf" },
  { key: "skills", label: "Skills", placeholder: "Clinical: History taking, IV cannulation, ECG interpretation\nTech: Microsoft Office, Python basics, SPSS\nSoft: Communication, Leadership, Teamwork", multiline: true, accent: "#38bdf8" },
  { key: "references", label: "References", placeholder: "Prof. Chukwuma Eze — HOD Internal Medicine, EBSU\nemail@ebsu.edu.ng | +234 xxx\n\n(Available on request is also acceptable)", multiline: true, accent: "#e879f9" },
];

const emptyCV: CVData = STEPS.reduce((acc, s) => ({ ...acc, [s.key]: "" }), {} as CVData);

export default function CVBuilderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [cvData, setCVData] = useState<CVData>(emptyCV);
  const [view, setView] = useState<"form" | "preview" | "enhance">("form");
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedSection, setEnhancedSection] = useState<Partial<CVData>>({});
  const [enhanceKey, setEnhanceKey] = useState<Step | null>(null);

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;
  const isLast = step === STEPS.length - 1;

  const update = (val: string) => setCVData((prev) => ({ ...prev, [currentStep.key]: val }));

  const next = () => { if (step < STEPS.length - 1) setStep(step + 1); else setView("preview"); };
  const back = () => { if (step > 0) setStep(step - 1); };

  const enhanceSection = async (key: Step) => {
    const content = cvData[key];
    if (!content.trim()) return;
    setEnhancing(true);
    setEnhanceKey(key);

    const puter = (window as any).puter;
    if (!puter?.ai?.chat) { setEnhancing(false); return; }

    try {
      const label = STEPS.find((s) => s.key === key)?.label ?? key;
      const response = await puter.ai.chat(
        `You are a professional medical CV editor. Improve and professionally enhance the following CV section for "${label}" for an EBSU medical student applying for internship/residency.

Current content:
${content}

Rules:
- Keep factual information accurate — don't invent facts
- Make it more professional, action-oriented, and ATS-friendly
- Use strong action verbs and quantify achievements where possible
- Keep it concise and appropriate for a medical CV
- Return ONLY the enhanced text, no extra commentary or labels.`,
        false,
        { model: "gpt-5-nano" }
      );
      const enhanced = typeof response === "string" ? response : response?.message?.content ?? response?.content ?? content;
      setEnhancedSection((prev) => ({ ...prev, [key]: enhanced.trim() }));
    } catch { /* silent */ } finally { setEnhancing(false); setEnhanceKey(null); }
  };

  const applyEnhancement = (key: Step) => {
    if (enhancedSection[key]) {
      setCVData((prev) => ({ ...prev, [key]: enhancedSection[key]! }));
      setEnhancedSection((prev) => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const downloadCV = () => {
    const cvText = generateCVText();
    const blob = new Blob([cvText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cvData.fullName || "CV"}_Medical_CV.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCVText = () => `${cvData.fullName.toUpperCase()}
${cvData.email} | ${cvData.phone}
${cvData.address}
${"=".repeat(60)}

PROFESSIONAL OBJECTIVE
${cvData.objective}

EDUCATION
${cvData.education}

CLINICAL ROTATIONS & POSTINGS
${cvData.clinicalRotations}

RESEARCH EXPERIENCE
${cvData.research}

PUBLICATIONS & PRESENTATIONS
${cvData.publications || "Available on request"}

VOLUNTEERING & EXTRACURRICULAR ACTIVITIES
${cvData.volunteering}

SKILLS
${cvData.skills}

REFERENCES
${cvData.references}
`;

  if (view === "preview") {
    return (
      <div className="min-h-screen pb-20 pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setView("form")} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Edit CV
            </button>
            <div className="flex gap-2">
              <button onClick={() => setView("enhance")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                AI Enhance
              </button>
              <button onClick={downloadCV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: "linear-gradient(135deg, #2dd4bf, #14b8a6)", color: "#0d0d14" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Download
              </button>
            </div>
          </div>

          {/* CV Preview */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <div className="p-8" style={{ background: "linear-gradient(135deg, #1e3a5f, #0f2542)", color: "white" }}>
              <h1 className="text-2xl font-bold mb-1">{cvData.fullName || "Your Name"}</h1>
              <p className="text-blue-200 text-sm">{[cvData.email, cvData.phone].filter(Boolean).join(" | ")}</p>
              {cvData.address && <p className="text-blue-300 text-xs mt-0.5">{cvData.address}</p>}
            </div>
            <div className="p-8 space-y-6 bg-white text-gray-800">
              {[
                { title: "Professional Objective", content: cvData.objective },
                { title: "Education", content: cvData.education },
                { title: "Clinical Rotations", content: cvData.clinicalRotations },
                { title: "Research Experience", content: cvData.research },
                { title: "Publications & Presentations", content: cvData.publications },
                { title: "Volunteering & Activities", content: cvData.volunteering },
                { title: "Skills", content: cvData.skills },
                { title: "References", content: cvData.references },
              ].filter((s) => s.content).map((s) => (
                <div key={s.title}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-blue-800 border-b border-blue-100 pb-1 mb-2">{s.title}</h2>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "enhance") {
    return (
      <div className="min-h-screen pb-20 pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
        <div className="max-w-2xl mx-auto px-4">
          <button onClick={() => setView("preview")} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Preview
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <svg className="w-5 h-5" fill="none" stroke="#a78bfa" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Enhancement</h2>
              <p className="text-xs text-gray-400">Let AI polish each section of your CV</p>
            </div>
          </div>

          <div className="space-y-3">
            {STEPS.filter((s) => cvData[s.key]).map((s) => (
              <div key={s.key} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-white">{s.label}</p>
                  <button onClick={() => enhanceSection(s.key)}
                    disabled={enhancing && enhanceKey === s.key}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xss font-bold transition-all disabled:opacity-50"
                    style={{ background: `${s.accent}18`, color: s.accent, border: `1px solid ${s.accent}30` }}>
                    {enhancing && enhanceKey === s.key ? (
                      <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: `${s.accent} transparent transparent transparent` }} />
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                    )}
                    {enhancing && enhanceKey === s.key ? "Enhancing..." : "Enhance"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 truncate">{cvData[s.key]}</p>

                {enhancedSection[s.key] && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                      <p className="text-xss text-green-400 mb-1 font-bold">AI Enhanced Version:</p>
                      <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed mb-3">{enhancedSection[s.key]}</p>
                      <div className="flex gap-2">
                        <button onClick={() => applyEnhancement(s.key)}
                          className="px-3 py-1.5 rounded-lg text-xss font-bold transition-all"
                          style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                          Apply
                        </button>
                        <button onClick={() => setEnhancedSection((prev) => { const n = { ...prev }; delete n[s.key]; return n; })}
                          className="px-3 py-1.5 rounded-lg text-xss font-bold transition-all"
                          style={{ background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }}>
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
      <div className="max-w-xl mx-auto px-4">
        <button onClick={() => { if (step === 0) navigate("/u/premium/dashboard"); else back(); }}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          {step === 0 ? "Back to Dashboard" : "Previous"}
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.3)" }}>
            <svg className="w-6 h-6" fill="none" stroke="#2dd4bf" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Medical CV Builder</h1>
            <p className="text-xs text-gray-400">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-8 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #2dd4bf, #14b8a6)" }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>

        {/* Form step */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}>
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <label className="block text-sm font-bold text-white mb-3">{currentStep.label}</label>
              {currentStep.multiline ? (
                <textarea
                  value={cvData[currentStep.key]}
                  onChange={(e) => update(e.target.value)}
                  placeholder={currentStep.placeholder}
                  rows={5}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none resize-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.1)` }}
                />
              ) : (
                <input
                  value={cvData[currentStep.key]}
                  onChange={(e) => update(e.target.value)}
                  placeholder={currentStep.placeholder}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.1)` }}
                />
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={next}
                className="flex-1 py-3.5 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-98 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #2dd4bf, #14b8a6)", color: "#0d0d14" }}>
                {isLast ? "Preview My CV" : "Continue"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Step indicators */}
            <div className="flex gap-1 justify-center mt-6 flex-wrap">
              {STEPS.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-all cursor-pointer"
                  onClick={() => setStep(i)}
                  style={{ background: i === step ? "#2dd4bf" : i < step ? "rgba(45,212,191,0.4)" : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
