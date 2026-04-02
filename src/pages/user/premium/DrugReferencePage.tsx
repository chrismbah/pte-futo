/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "lookup" | "mnemonic" | "interaction" | "doses";

const MODES: { id: Mode; label: string; desc: string; accent: string; icon: string }[] = [
  {
    id: "lookup",
    label: "Drug Lookup",
    desc: "Full drug profile — mechanism, indications, contraindications, side effects",
    accent: "#38bdf8",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    id: "doses",
    label: "Dosage Calculator",
    desc: "Adult & pediatric doses, renal/hepatic adjustments, routes of administration",
    accent: "#34d399",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    id: "interaction",
    label: "Drug Interactions",
    desc: "Check interactions between two or more drugs — severity & mechanism",
    accent: "#fb923c",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    id: "mnemonic",
    label: "Clinical Mnemonics",
    desc: "Generate easy-to-remember mnemonics for drug classes, side effects & diagnosis",
    accent: "#a78bfa",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
];

const QUICK_SEARCHES = [
  "Metformin", "Amlodipine", "Amoxicillin", "Lisinopril",
  "Omeprazole", "Paracetamol", "Metronidazole", "Diazepam",
];

const SYSTEM_PROMPTS: Record<Mode, string> = {
  lookup: `You are a clinical pharmacology expert and MBBS examiner. When given a drug name, provide a concise but complete drug profile using this structure:

**Drug Class:** 
**Mechanism of Action:** 
**Indications:** (bulleted)
**Contraindications:** (bulleted)
**Side Effects:** (organised by frequency: common / serious)
**Drug Interactions:** (top 3 important ones)
**Monitoring:** (key parameters to monitor)
**Clinical Pearl:** (one memorable exam tip)

Use bold headers. Keep each section concise. Tailor to MBBS level.`,

  doses: `You are a clinical pharmacology expert. When given a drug name (and optionally patient details like weight, age, renal function), provide:

**Drug:** 
**Standard Adult Dose:**
**Route(s) of Administration:**
**Frequency:**
**Pediatric Dose:** (if applicable, mg/kg)
**Renal Adjustment:** (eGFR thresholds)
**Hepatic Adjustment:** (Child-Pugh if relevant)
**Maximum Dose:**
**Clinical Note:** (one important prescribing tip)

Use bold headers. Flag any drugs that require TDM (therapeutic drug monitoring).`,

  interaction: `You are a clinical pharmacologist. When given two or more drug names, analyse their interactions using this format:

**Drugs:** 
**Interaction Severity:** (Major / Moderate / Minor / None)
**Mechanism:** 
**Clinical Effect:** 
**Management:**
- What to do if co-prescription is necessary
- Alternative drugs to consider
**Evidence Level:** (High / Moderate / Low)

If no significant interaction exists, say so clearly with a brief explanation.`,

  mnemonic: `You are a medical educator specialising in clinical pharmacology for MBBS students. When asked for a mnemonic about a drug class, drug side effects, or clinical condition:

1. Create a catchy, memorable mnemonic or acronym
2. Expand each letter with a clear explanation
3. Add a "Memory Hook" — a short story or image to anchor it
4. Give a quick "Exam Tip" on how this is commonly tested

Make it fun, creative, and easy to recall under exam stress. Nigerian medical student context is a plus.`,
};

const PLACEHOLDERS: Record<Mode, string> = {
  lookup: "Enter a drug name (e.g. Metformin, Amlodipine, Metronidazole)...",
  doses: "Enter drug name + patient details (e.g. Gentamicin, 70kg adult, eGFR 45)...",
  interaction: "Enter two or more drugs (e.g. Warfarin and Aspirin)...",
  mnemonic: "Enter a topic (e.g. Beta blocker side effects, ACE inhibitor uses)...",
};

function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      return (
        <p key={i} className="font-bold text-white mt-3 mb-0.5 text-sm">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    if (parts.length > 1) {
      return (
        <p key={i} className="text-gray-300 text-sm leading-relaxed">
          {parts.map((p, j) =>
            j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{p}</strong> : p
          )}
        </p>
      );
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={i} className="flex items-start gap-2 text-sm text-gray-300 leading-relaxed">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-sky-400 flex-shrink-0" />
          <span>{line.slice(2)}</span>
        </div>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return <p key={i} className="text-gray-300 text-sm leading-relaxed">{line}</p>;
  });
}

export default function DrugReferencePage() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<Mode>("lookup");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ query: string; mode: Mode; result: string }[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const currentMode = MODES.find((m) => m.id === activeMode)!;

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const puter = (window as any).puter;
    if (!puter?.ai?.chat) {
      setError("AI service not available. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      const response = await puter.ai.chat(
        [
          { role: "system", content: SYSTEM_PROMPTS[activeMode] },
          { role: "user", content: q },
        ],
        false,
        { model: "gpt-5-nano" }
      );

      const text =
        typeof response === "string"
          ? response
          : response?.message?.content ?? response?.content ?? "No response received.";

      setResult(text);
      setHistory((prev) => [{ query: q, mode: activeMode, result: text }, ...prev.slice(0, 9)]);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      setError("Failed to fetch clinical data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div
      className="min-h-screen pb-20 pt-20"
      style={{ background: "linear-gradient(135deg, #0d0d14 0%, #0a1020 50%, #0d0d14 100%)" }}
    >
      <div className="max-w-2xl mx-auto px-4">

        {/* Back */}
        <button
          onClick={() => navigate("/u/premium/dashboard")}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)" }}
            >
              <svg className="w-6 h-6" fill="none" stroke="#38bdf8" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Drug & Clinical Reference</h1>
              <p className="text-xs text-sky-400 font-medium mt-0.5">Powered by ChatGPT 5nano</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Instant drug profiles, dosing guides, interaction checks, and clinical mnemonics — built for MBBS students at EBSU.
          </p>
        </motion.div>

        {/* Mode Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-2 mb-6"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => { setActiveMode(m.id); setResult(null); setError(null); }}
              className="relative rounded-2xl p-3.5 text-left transition-all group overflow-hidden"
              style={{
                background: activeMode === m.id ? `${m.accent}15` : "rgba(255,255,255,0.03)",
                border: activeMode === m.id
                  ? `1px solid ${m.accent}50`
                  : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {activeMode === m.id && (
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${m.accent}, transparent)` }}
                />
              )}
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke={activeMode === m.id ? m.accent : "#6b7280"}
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={m.icon} />
                </svg>
                <span
                  className="text-xs font-bold"
                  style={{ color: activeMode === m.id ? m.accent : "#9ca3af" }}
                >
                  {m.label}
                </span>
              </div>
              <p className="text-xss text-gray-500 leading-snug">{m.desc}</p>
            </button>
          ))}
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="mb-4"
        >
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${currentMode.accent}35`,
            }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={currentMode.accent} viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[activeMode]}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-500 hover:text-gray-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim() || loading}
              className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 flex-shrink-0"
              style={{ background: currentMode.accent, color: "#0d0d14" }}
            >
              {loading ? "..." : "Search"}
            </button>
          </div>
        </motion.div>

        {/* Quick Search Chips — only on lookup mode */}
        {activeMode === "lookup" && !result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="mb-6"
          >
            <p className="text-xss text-gray-500 uppercase tracking-wider font-semibold mb-2">Common drugs</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map((drug) => (
                <button
                  key={drug}
                  onClick={() => { setQuery(drug); handleSearch(drug); }}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80 active:scale-95"
                  style={{
                    background: "rgba(56,189,248,0.08)",
                    border: "1px solid rgba(56,189,248,0.2)",
                    color: "#38bdf8",
                  }}
                >
                  {drug}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-6 mb-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${currentMode.accent}15`, border: `1px solid ${currentMode.accent}30` }}
              >
                <svg className="w-4 h-4 animate-spin" fill="none" stroke={currentMode.accent} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Querying clinical database...</p>
                <p className="text-xss text-gray-500">ChatGPT 5nano is compiling your reference</p>
              </div>
            </div>
            <div className="space-y-2">
              {[80, 60, 70, 45].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full animate-pulse"
                  style={{ width: `${w}%`, background: "rgba(255,255,255,0.06)", animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-2xl px-4 py-3 mb-4 text-sm text-red-400"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            {error}
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultRef}
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl overflow-hidden mb-6"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${currentMode.accent}25` }}
            >
              {/* Result header */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ background: `${currentMode.accent}10`, borderBottom: `1px solid ${currentMode.accent}20` }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke={currentMode.accent} viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={currentMode.icon} />
                  </svg>
                  <span className="text-xs font-bold" style={{ color: currentMode.accent }}>{currentMode.label}</span>
                  <span className="text-xss text-gray-500">—</span>
                  <span className="text-xs text-gray-400 truncate max-w-[160px]">{query}</span>
                </div>
                <button
                  onClick={() => { setResult(null); setQuery(""); }}
                  className="text-xss text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Result body */}
              <div className="px-5 py-4 space-y-0.5">
                {renderContent(result)}
              </div>

              {/* Disclaimer */}
              <div
                className="px-5 py-3 flex items-start gap-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <svg className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xss text-gray-600 leading-snug">
                  For educational purposes only. Always verify doses with current BNF, formulary, or a senior clinician before prescribing.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search History */}
        {history.length > 0 && !result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-xss text-gray-500 uppercase tracking-wider font-semibold mb-3">Recent searches</p>
            <div className="space-y-2">
              {history.slice(0, 5).map((h, i) => {
                const m = MODES.find((x) => x.id === h.mode)!;
                return (
                  <button
                    key={i}
                    onClick={() => { setQuery(h.query); setActiveMode(h.mode); setResult(h.result); }}
                    className="w-full rounded-xl px-4 py-3 flex items-center gap-3 text-left transition-all hover:opacity-80"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${m.accent}15` }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke={m.accent} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={m.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{h.query}</p>
                      <p className="text-xss text-gray-500">{m.label}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!result && !loading && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-10"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}
            >
              <svg className="w-8 h-8" fill="none" stroke="#38bdf8" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-base mb-1">Your clinical reference is ready</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
              Search any drug for instant profiles, doses, interactions, or generate mnemonics to ace your pharmacology exams.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
