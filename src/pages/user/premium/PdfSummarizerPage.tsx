/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import { playSound } from "../../../hooks/useSound";

// ─── Types ────────────────────────────────────────────────────────────────────

type OutputMode =
  | "summary"
  | "flashcards"
  | "mcq"
  | "theory"
  | "keypoints"
  | "mnemonics"
  | "timeline"
  | "glossary";

type FileType = "pdf" | "txt" | "image" | "pptx";

interface Flashcard { term: string; definition: string; }
interface MCQItem { question: string; options: string[]; answer: string; explanation: string; }
interface TheoryItem { question: string; answer: string; }
interface KeyPoint { point: string; detail: string; }

type OutputResult =
  | { mode: "summary"; content: string }
  | { mode: "flashcards"; items: Flashcard[] }
  | { mode: "mcq"; items: MCQItem[] }
  | { mode: "theory"; items: TheoryItem[] }
  | { mode: "keypoints"; items: KeyPoint[] }
  | { mode: "mnemonics"; content: string }
  | { mode: "timeline"; content: string }
  | { mode: "glossary"; content: string };

// ─── Mode Config ──────────────────────────────────────────────────────────────

const OUTPUT_MODES: {
  id: OutputMode;
  label: string;
  icon: string;
  description: string;
  accent: string;
  bg: string;
}[] = [
  { id: "summary",    label: "Summary",     icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",                                                                                                                                                                                                         description: "Structured summary of entire document",      accent: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  { id: "flashcards", label: "Flashcards",  icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",                                                                                                                                                                    description: "Term-definition cards for quick revision",    accent: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
  { id: "mcq",        label: "MCQ Exam",    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",                                                                                                                                                                              description: "Multiple-choice questions with answers",      accent: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  { id: "theory",     label: "Theory Qs",   icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",                                                                                                                                                                                                                   description: "Long-form questions with model answers",      accent: "#c084fc", bg: "rgba(192,132,252,0.12)" },
  { id: "keypoints",  label: "Key Points",  icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",                                                                                                                                                                                                                    description: "Bullet-point key facts and concepts",         accent: "#34d399", bg: "rgba(52,211,153,0.12)" },
  { id: "mnemonics",  label: "Mnemonics",   icon: "M13 10V3L4 14h7v7l9-11h-7z",                                                                                                                                                                                                                                                                                                    description: "Memory aids and acronyms",                    accent: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  { id: "timeline",   label: "Timeline",    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                                                                                                                                                                                                                   description: "Chronological order of events/concepts",      accent: "#22d3ee", bg: "rgba(34,211,238,0.12)" },
  { id: "glossary",   label: "Glossary",    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", description: "Medical terms and their definitions",         accent: "#f472b6", bg: "rgba(244,114,182,0.12)" },
];

// ─── Prompt builders ──────────────────────────────────────────────────────────

const buildPrompt = (mode: OutputMode, text: string): string => {
  const base = `You are an expert medical education assistant for EBSUMSA (Ebonyi State University Medical Students). Based on the following document text, `;
  switch (mode) {
    case "summary":
      return `${base}write a clear, detailed summary in 4-6 paragraphs covering all major concepts, clinical relevance, key mechanisms, and practical takeaways. Use headings where helpful. Format with **bold** for key terms.\n\nDOCUMENT:\n${text}`;
    case "flashcards":
      return `${base}generate exactly 12 high-quality flashcards perfect for medical exam revision. Return ONLY a valid JSON array — no extra text, no markdown code blocks:\n[{"term":"...","definition":"..."}]\n\nDOCUMENT:\n${text}`;
    case "mcq":
      return `${base}generate as many multiple-choice questions as the content supports (up to 30). Each must have 4 options (A-D), a correct answer letter, and a detailed clinical explanation. Return ONLY valid JSON — no extra text, no markdown:\n[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."}]\n\nDOCUMENT:\n${text}`;
    case "theory":
      return `${base}generate up to 20 theory exam questions with comprehensive model answers (at least 4 sentences each). Return ONLY valid JSON — no extra text, no markdown:\n[{"question":"...","answer":"..."}]\n\nDOCUMENT:\n${text}`;
    case "keypoints":
      return `${base}extract the 12 most important key points a medical student must know. Return ONLY valid JSON — no extra text, no markdown:\n[{"point":"...","detail":"..."}]\n\nDOCUMENT:\n${text}`;
    case "mnemonics":
      return `${base}create memorable mnemonics, acronyms, and memory aids for all key concepts. Include an explanation for each. Format as a clear numbered list.\n\nDOCUMENT:\n${text}`;
    case "timeline":
      return `${base}organize the key events, disease progressions, physiological processes, or concepts in a clear chronological or logical sequential order with explanations. Present as a numbered timeline.\n\nDOCUMENT:\n${text}`;
    case "glossary":
      return `${base}create a comprehensive medical glossary of all specialized terms, abbreviations, drug names, and clinical vocabulary. Format as a numbered list: **Term**: Definition.\n\nDOCUMENT:\n${text}`;
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJSON<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch { return null; }
}

function detectFileType(file: File): FileType {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pptx") || file.type.includes("presentation")) return "pptx";
  if (name.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/) || file.type.startsWith("image/")) return "image";
  if (name.endsWith(".txt") || file.type === "text/plain") return "txt";
  return "pdf";
}

function getExtractLabel(type: FileType): string {
  return type === "image" ? "Running OCR on image..." : type === "pptx" ? "Parsing PowerPoint slides..." : type === "pdf" ? "Extracting text from PDF..." : "Reading text file...";
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function renderMd(text: string): JSX.Element {
  const lines = text.split("\n");
  const els: JSX.Element[] = [];
  const inline = (line: string, key: string) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return <span key={key}>{parts.map((p, pi) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={pi} className="font-bold" style={{ color: "#e2d9f3" }}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*")) return <em key={pi} className="italic text-purple-300">{p.slice(1, -1)}</em>;
      if (p.startsWith("`") && p.endsWith("`")) return <code key={pi} className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>{p.slice(1, -1)}</code>;
      return <span key={pi}>{p}</span>;
    })}</span>;
  };
  lines.forEach((line, idx) => {
    const key = `l${idx}`;
    if (/^### (.+)/.test(line)) els.push(<h3 key={key} className="text-sm font-bold mt-4 mb-1" style={{ color: "#c4b5fd" }}>{line.replace(/^### /, "")}</h3>);
    else if (/^## (.+)/.test(line)) els.push(<h2 key={key} className="text-base font-bold mt-5 mb-2 pb-1 border-b border-white/10" style={{ color: "#e2d9f3" }}>{line.replace(/^## /, "")}</h2>);
    else if (/^# (.+)/.test(line)) els.push(<h1 key={key} className="text-lg font-extrabold mt-5 mb-2" style={{ color: "#f0ebff" }}>{line.replace(/^# /, "")}</h1>);
    else if (/^[-*•] (.+)/.test(line)) els.push(<li key={key} className="flex gap-2 text-sm leading-relaxed" style={{ color: "#c4b5fd" }}><span className="font-bold mt-0.5 flex-shrink-0" style={{ color: "#a78bfa" }}>•</span><span style={{ color: "#d4c8f0" }}>{inline(line.replace(/^[-*•] /, ""), key + "c")}</span></li>);
    else if (/^\d+\. (.+)/.test(line)) { const n = line.match(/^(\d+)\./)?.[1]; els.push(<li key={key} className="flex gap-2 text-sm leading-relaxed"><span className="font-bold flex-shrink-0 min-w-[20px]" style={{ color: "#a78bfa" }}>{n}.</span><span style={{ color: "#d4c8f0" }}>{inline(line.replace(/^\d+\. /, ""), key + "c")}</span></li>); }
    else if (line.trim() === "") els.push(<div key={key} className="h-2" />);
    else els.push(<p key={key} className="text-sm leading-relaxed" style={{ color: "#d4c8f0" }}>{inline(line, key + "c")}</p>);
  });
  return <div className="space-y-1">{els}</div>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
      style={{ background: "rgba(167,139,250,0.12)", color: copied ? "#34d399" : "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
        {copied ? <path d="M20 6L9 17l-5-5" /> : <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>}
      </svg>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function FlashcardViewer({ items }: { items: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs" style={{ color: "#9981c9" }}>
        <span>Card {index + 1} of {items.length}</span>
        <div className="flex gap-2">
          <button onClick={() => { setIndex(i => Math.max(0, i - 1)); setFlipped(false); }} disabled={index === 0} className="px-3 py-1 rounded-lg text-xs font-medium disabled:opacity-30 transition-all" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>Prev</button>
          <button onClick={() => { setIndex(i => Math.min(items.length - 1, i + 1)); setFlipped(false); }} disabled={index === items.length - 1} className="px-3 py-1 rounded-lg text-xs font-medium disabled:opacity-30 transition-all" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>Next</button>
        </div>
      </div>
      <div className="relative h-44 cursor-pointer" onClick={() => setFlipped(f => !f)} style={{ perspective: "1000px" }}>
        <motion.div className="w-full h-full relative" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center" style={{ background: "linear-gradient(135deg, #4c1d95, #6d28d9)", backfaceVisibility: "hidden" }}>
            <p className="text-xss uppercase tracking-widest mb-3 font-medium" style={{ color: "#c4b5fd" }}>Term</p>
            <p className="font-bold text-base leading-snug text-white">{items[index].term}</p>
            <p className="text-xss mt-4" style={{ color: "#c4b5fd" }}>Tap to reveal definition</p>
          </div>
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center" style={{ background: "rgba(30,20,60,0.95)", border: "2px solid rgba(167,139,250,0.4)", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-xss uppercase tracking-widest mb-3 font-medium" style={{ color: "#a78bfa" }}>Definition</p>
            <p className="text-sm leading-relaxed" style={{ color: "#e2d9f3" }}>{items[index].definition}</p>
          </div>
        </motion.div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.slice(0, 8).map((card, i) => (
          <div key={i} onClick={() => { setIndex(i); setFlipped(false); }} className="cursor-pointer p-3 rounded-xl transition-all" style={{ background: i === index ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${i === index ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.07)"}` }}>
            <p className="text-xs font-semibold truncate" style={{ color: "#e2d9f3" }}>{card.term}</p>
            <p className="text-xss truncate mt-0.5" style={{ color: "#9981c9" }}>{card.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MCQViewer({ items }: { items: MCQItem[] }) {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const score = items.filter((item, i) => selected[i] === item.answer[0]).length;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
        <span className="text-sm" style={{ color: "#c4b5fd" }}>Score</span>
        <span className="font-bold text-base" style={{ color: "#a78bfa" }}>{score} / {items.length}</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "#e2d9f3" }}>{i + 1}. {item.question}</p>
          <div className="space-y-2">
            {item.options.map((opt) => {
              const label = opt.charAt(0);
              const isCorrect = label === item.answer[0];
              const isSelected = selected[i] === label;
              const isRevealed = revealed[i];
              let bg = "rgba(255,255,255,0.04)"; let color = "#c4b5fd"; let borderC = "rgba(255,255,255,0.08)";
              if (isRevealed) {
                if (isCorrect) { bg = "rgba(52,211,153,0.1)"; color = "#34d399"; borderC = "rgba(52,211,153,0.3)"; }
                else if (isSelected) { bg = "rgba(248,113,113,0.1)"; color = "#f87171"; borderC = "rgba(248,113,113,0.3)"; }
              } else if (isSelected) { bg = "rgba(167,139,250,0.15)"; color = "#a78bfa"; borderC = "rgba(167,139,250,0.4)"; }
              return (
                <button key={opt} onClick={() => { if (!isRevealed) setSelected(s => ({ ...s, [i]: label })); }} disabled={isRevealed} className="w-full text-left text-xs px-3 py-2.5 rounded-lg transition-all" style={{ background: bg, color, border: `1px solid ${borderC}` }}>
                  {opt}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end mt-3">
            {!revealed[i] ? (
              <button onClick={() => setRevealed(r => ({ ...r, [i]: true }))} disabled={!selected[i]} className="text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-30 transition-all" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>Check</button>
            ) : (
              <div className="text-xss rounded-lg px-3 py-2 text-left w-full" style={{ background: "rgba(167,139,250,0.08)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.15)" }}>
                <span className="font-semibold block mb-1" style={{ color: "#a78bfa" }}>Explanation:</span>
                {renderMd(item.explanation)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TheoryViewer({ items }: { items: TheoryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left transition-colors" style={{ background: open === i ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.03)" }}>
            <p className="text-sm font-semibold pr-4" style={{ color: "#e2d9f3" }}>{i + 1}. {item.question}</p>
            <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" className={`w-5 h-5 flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}><path d="M19 9l-7 7-7-7" /></svg>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="p-4" style={{ background: "rgba(167,139,250,0.05)", borderTop: "1px solid rgba(167,139,250,0.15)" }}>
                  <p className="text-xss font-bold uppercase tracking-wider mb-2" style={{ color: "#a78bfa" }}>Model Answer</p>
                  {renderMd(item.answer)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function KeyPointsViewer({ items }: { items: KeyPoint[] }) {
  return (
    <div className="space-y-3">
      {items.map((kp, i) => (
        <div key={i} className="flex gap-3 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
            <span className="text-white text-xss font-bold">{i + 1}</span>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#e2d9f3" }}>{kp.point}</p>
            <div className="text-xs mt-1 leading-relaxed" style={{ color: "#c4b5fd" }}>{renderMd(kp.detail)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PdfSummarizerPage() {
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<OutputMode>("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Partial<Record<OutputMode, OutputResult>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setFileName(null); setFileType(null); setRawText(""); setResults({}); setError(null); setImagePreview(null); setExtractProgress(null); };

  // ── Script loader ──
  const loadScript = (src: string): Promise<void> => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script"); s.src = src;
    s.onload = () => resolve(); s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });

  // ── Extractors ──
  const extractPDF = async (file: File): Promise<string> => {
    if (!(window as any).pdfjsLib) {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const pdfjs = (window as any).pdfjsLib;
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    let text = "";
    const maxPages = Math.min(pdf.numPages, 35);
    for (let p = 1; p <= maxPages; p++) {
      setExtractProgress(`Reading page ${p} of ${maxPages}...`);
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text.trim();
  };

  const extractImage = async (file: File): Promise<string> => {
    if (!(window as any).Tesseract) { setExtractProgress("Loading OCR engine..."); await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"); }
    const Tesseract = (window as any).Tesseract;
    setExtractProgress("Recognizing text (may take 10-30s)...");
    const result = await Tesseract.recognize(file, "eng", { logger: (m: any) => { if (m.status === "recognizing text") setExtractProgress(`Recognizing: ${Math.round((m.progress || 0) * 100)}%`); } });
    return result.data.text.trim();
  };

  const extractPPTX = async (file: File): Promise<string> => {
    if (!(window as any).JSZip) { setExtractProgress("Loading parser..."); await loadScript("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"); }
    const JSZip = (window as any).JSZip;
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const slides = Object.keys(zip.files).filter(n => n.match(/^ppt\/slides\/slide\d+\.xml$/)).sort((a, b) => parseInt(a.match(/slide(\d+)/)?.[1] || "0") - parseInt(b.match(/slide(\d+)/)?.[1] || "0"));
    let text = "";
    for (let i = 0; i < slides.length; i++) {
      setExtractProgress(`Parsing slide ${i + 1} of ${slides.length}...`);
      const xml = await zip.files[slides[i]].async("string");
      const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
      const slideText = matches.map((m: string) => m.replace(/<[^>]+>/g, "").trim()).filter(Boolean).join(" ");
      if (slideText) text += `[Slide ${i + 1}]: ${slideText}\n`;
    }
    return text.trim();
  };

  // ── File handler ──
  const handleFile = useCallback(async (file: File) => {
    reset();
    const type = detectFileType(file);
    setFileType(type); setFileName(file.name); setIsExtracting(true); setError(null);
    if (type === "image") setImagePreview(URL.createObjectURL(file));
    try {
      let text = "";
      if (type === "txt") text = await file.text();
      else if (type === "pdf") {
        text = await extractPDF(file);
        if (!text || text.length < 30) { setError("Could not extract readable text. This PDF may be scanned — try uploading a photo instead."); setIsExtracting(false); return; }
      } else if (type === "image") {
        text = await extractImage(file);
        if (!text || text.length < 10) { setError("Could not read text from this image. Ensure it is clear and well-lit."); setIsExtracting(false); return; }
      } else if (type === "pptx") {
        text = await extractPPTX(file);
        if (!text || text.length < 20) { setError("Could not extract text from this PowerPoint. Ensure slides have typed text."); setIsExtracting(false); return; }
      }
      setRawText(text.slice(0, 14000));
    } catch (e: any) { setError(`Failed to read file: ${e?.message || "Unknown error"}.`); }
    finally { setIsExtracting(false); setExtractProgress(null); }
  }, []);

  // ── Puter.js AI ──
  const waitForPuter = (): Promise<any> => new Promise((resolve, reject) => {
    if ((window as any).puter?.ai) { resolve((window as any).puter); return; }
    let attempts = 0;
    const iv = setInterval(() => {
      attempts++;
      if ((window as any).puter?.ai) { clearInterval(iv); resolve((window as any).puter); }
      else if (attempts > 60) { clearInterval(iv); reject(new Error("Puter.js failed to load. Please refresh and try again.")); }
    }, 250);
  });

  const generate = async (mode: OutputMode) => {
    if (!rawText.trim()) { setError("Please upload a document or paste your notes first."); return; }
    setActiveMode(mode); setIsGenerating(true); setError(null);
    try {
      const puter = await waitForPuter();
      const prompt = buildPrompt(mode, rawText.slice(0, 14000));
      const response = await puter.ai.chat(prompt, false, { model: "gpt-5-nano" });
      const content: string = typeof response === "string" ? response : response?.message?.content ?? response?.toString() ?? "";
      let result: OutputResult;
      if (mode === "flashcards") { const p = parseJSON<Flashcard[]>(content); result = { mode, items: p || [{ term: "Parse error", definition: content }] }; }
      else if (mode === "mcq")   { const p = parseJSON<MCQItem[]>(content);    result = { mode, items: p || [] }; }
      else if (mode === "theory") { const p = parseJSON<TheoryItem[]>(content); result = { mode, items: p || [] }; }
      else if (mode === "keypoints") { const p = parseJSON<KeyPoint[]>(content); result = { mode, items: p || [] }; }
      else result = { mode, content } as OutputResult;
      setResults(prev => ({ ...prev, [mode]: result }));
      playSound("ai-done");
    } catch (e: any) {
      setError(e?.message || "AI generation failed. Please try again.");
    } finally { setIsGenerating(false); }
  };

  const renderResult = (res: OutputResult) => {
    switch (res.mode) {
      case "flashcards": return <FlashcardViewer items={res.items} />;
      case "mcq":        return <MCQViewer items={res.items} />;
      case "theory":     return <TheoryViewer items={res.items} />;
      case "keypoints":  return <KeyPointsViewer items={res.items} />;
      default:           return <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)" }}>{renderMd((res as any).content)}</div>;
    }
  };

  const hasText = rawText.trim().length > 0;
  const currentResult = results[activeMode];
  const generatedCount = Object.keys(results).length;

  const fadeIn = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0d0820 0%, #120c2a 50%, #0a0f1e 100%)" }}>
      {/* Topbar */}
      <div className="fixed top-0 inset-x-0 z-30 h-14 flex items-center px-4 sm:px-8 gap-3" style={{ background: "rgba(13,8,32,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(167,139,250,0.12)" }}>
        <NavLink to="/u/premium/dashboard" className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: "#9981c9" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
          Premium
        </NavLink>
        <span style={{ color: "rgba(167,139,250,0.3)" }}>/</span>
        <span className="font-semibold text-sm" style={{ color: "#e2d9f3" }}>AI Summarizer</span>

        <div className="ml-auto flex items-center gap-3">
          {generatedCount > 0 && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
              {generatedCount} / {OUTPUT_MODES.length} modes generated
            </span>
          )}
          <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg" style={{ background: "rgba(167,139,250,0.06)", color: "#9981c9", border: "1px solid rgba(167,139,250,0.12)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" style={{ color: "#a78bfa" }}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Powered by Puter.js AI
          </span>
        </div>
      </div>

      <div className="pt-14 max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── LEFT PANEL ── */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div {...fadeIn}>
              {/* Page header */}
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)" }}>
                  <svg className="w-5 h-5" fill="none" stroke="#a78bfa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: "#f0ebff" }}>AI Summarizer</h1>
                  <p className="text-xs" style={{ color: "#9981c9" }}>Upload a document and choose a study mode</p>
                </div>
              </div>
            </motion.div>

            {/* Upload zone */}
            <motion.div {...fadeIn}>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                onClick={() => !isExtracting && fileInputRef.current?.click()}
                className="relative cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all"
                style={{
                  borderColor: isDragging ? "#a78bfa" : "rgba(167,139,250,0.2)",
                  background: isDragging ? "rgba(167,139,250,0.06)" : "rgba(255,255,255,0.02)",
                }}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.txt,.pptx,.ppt,.jpg,.jpeg,.png,.webp,.bmp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

                {isExtracting ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(167,139,250,0.3)", borderTopColor: "#a78bfa" }} />
                    <p className="text-sm" style={{ color: "#c4b5fd" }}>{fileType ? getExtractLabel(fileType) : "Processing..."}</p>
                    {extractProgress && <p className="text-xss" style={{ color: "#9981c9" }}>{extractProgress}</p>}
                  </div>
                ) : fileName ? (
                  <div className="flex flex-col items-center gap-2">
                    {imagePreview && fileType === "image" ? (
                      <div className="w-full max-h-28 overflow-hidden rounded-xl mb-1">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.12)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" className="w-5 h-5"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    )}
                    <p className="text-sm font-medium truncate max-w-full" style={{ color: "#e2d9f3" }}>{fileName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xss px-2 py-0.5 rounded-full font-medium uppercase" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>{fileType}</span>
                      <span className="text-xss" style={{ color: "#9981c9" }}>{rawText.length.toLocaleString()} chars</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); reset(); }} className="text-xss mt-1 transition-colors" style={{ color: "#f87171" }}>Remove file</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 py-2">
                    {/* File type icons */}
                    <div className="flex items-center gap-4">
                      {[
                        { label: "PDF", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" },
                        { label: "PPTX", color: "#f97316", bg: "rgba(249,115,22,0.1)", icon: "M2 3h20v14H2z M8 21h8 M12 17v4" },
                        { label: "Image", color: "#38bdf8", bg: "rgba(56,189,248,0.1)", icon: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7" },
                        { label: "TXT", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M16 13H8 M16 17H8 M10 9H8" },
                      ].map(ft => (
                        <div key={ft.label} className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ft.bg }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke={ft.color} strokeWidth="1.8" className="w-5 h-5"><path d={ft.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </div>
                          <span className="text-xss" style={{ color: "#9981c9" }}>{ft.label}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#c4b5fd" }}>Drop your file here or click to browse</p>
                      <p className="text-xss mt-1" style={{ color: "#6b5c8a" }}>PDF, PowerPoint, Images, or TXT — up to 35 pages</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* OCR tip */}
            <motion.div {...fadeIn}>
              <div className="flex items-start gap-2.5 rounded-xl p-3" style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" className="w-4 h-4 flex-shrink-0 mt-0.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#7dd3fc" }}>Snap &amp; Study</p>
                  <p className="text-xss mt-0.5 leading-relaxed" style={{ color: "#93c5fd" }}>Take a photo of printed or handwritten notes and upload — AI will OCR and analyze the text automatically.</p>
                </div>
              </div>
            </motion.div>

            {/* Manual paste */}
            <motion.div {...fadeIn}>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9981c9" }}>Or paste your notes</label>
              <textarea
                rows={7}
                value={rawText}
                onChange={(e) => { const v = e.target.value; reset(); setRawText(v); }}
                placeholder="Paste lecture notes, textbook content, or any medical text here..."
                className="w-full rounded-xl p-3 text-sm resize-none focus:outline-none transition-all leading-relaxed"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(167,139,250,0.2)", color: "#e2d9f3", caretColor: "#a78bfa" }}
                onFocus={e => (e.target.style.borderColor = "rgba(167,139,250,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(167,139,250,0.2)")}
              />
              <div className="flex items-center justify-between mt-1">
                {rawText.length > 0 && <span className="text-xss font-medium" style={{ color: "#a78bfa" }}>Ready — {rawText.length.toLocaleString()} characters</span>}
                <span className="text-xss ml-auto" style={{ color: "#6b5c8a" }}>{rawText.length.toLocaleString()} / 14,000</span>
              </div>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-3 text-xs" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#fca5a5" }}>
                {error}
              </motion.div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mode selector */}
            <motion.div {...fadeIn}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9981c9" }}>Choose a Study Mode</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OUTPUT_MODES.map((m) => {
                  const isActive = activeMode === m.id && !!results[m.id];
                  const isLoading = isGenerating && activeMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => generate(m.id)}
                      disabled={!hasText || isGenerating}
                      className="relative flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center transition-all"
                      style={{
                        background: isActive ? m.bg : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isActive ? m.accent + "40" : "rgba(255,255,255,0.07)"}`,
                        opacity: (!hasText || isGenerating) && !isLoading ? 0.5 : 1,
                        cursor: !hasText || isGenerating ? "not-allowed" : "pointer",
                      }}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: m.accent + "40", borderTopColor: m.accent }} />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke={isActive ? m.accent : "#9981c9"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d={m.icon} />
                        </svg>
                      )}
                      <span className="text-xss font-semibold leading-tight" style={{ color: isActive ? m.accent : "#9981c9" }}>{m.label}</span>
                      {results[m.id] && !isLoading && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: m.accent }} />
                      )}
                    </button>
                  );
                })}
              </div>
              {!hasText && (
                <p className="text-xss mt-2" style={{ color: "#6b5c8a" }}>Upload a document or paste text to enable the study modes above.</p>
              )}
            </motion.div>

            {/* Output area */}
            <AnimatePresence mode="wait">
              {isGenerating && !currentResult ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl p-10 flex flex-col items-center gap-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(167,139,250,0.12)" }}>
                  <div className="relative">
                    <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(167,139,250,0.2)", borderTopColor: "#a78bfa" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" className="w-5 h-5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold" style={{ color: "#c4b5fd" }}>AI is processing your document...</p>
                    <p className="text-xss mt-1" style={{ color: "#9981c9" }}>This may take 10–30 seconds for longer documents</p>
                  </div>
                </motion.div>
              ) : currentResult ? (
                <motion.div key={activeMode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(167,139,250,0.15)" }}>
                  {/* Result header */}
                  <div className="flex items-center justify-between px-5 py-3" style={{ background: "rgba(167,139,250,0.06)", borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
                    <div className="flex items-center gap-2">
                      {(() => { const m = OUTPUT_MODES.find(m => m.id === activeMode)!; return (
                        <>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: m.bg }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke={m.accent} strokeWidth="2" className="w-3.5 h-3.5"><path d={m.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: "#e2d9f3" }}>{m.label}</span>
                        </>
                      ); })()}
                      {fileName && <span className="text-xss hidden sm:block" style={{ color: "#9981c9" }}>— {fileName}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <CopyBtn text={"content" in currentResult ? (currentResult as any).content : JSON.stringify((currentResult as any).items, null, 2)} />
                      <button
                        onClick={() => generate(activeMode)}
                        disabled={isGenerating}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.15)" }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Regenerate
                      </button>
                    </div>
                  </div>
                  {/* Result body */}
                  <div className="p-5 max-h-[520px] overflow-y-auto" style={{ background: "rgba(13,8,32,0.6)" }}>
                    {renderResult(currentResult)}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(167,139,250,0.15)" }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" className="w-8 h-8"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#c4b5fd" }}>No output yet</p>
                    <p className="text-xss mt-1 max-w-xs" style={{ color: "#6b5c8a" }}>Upload or paste your document on the left, then tap a study mode above to generate AI-powered study materials.</p>
                  </div>
                  {/* Quick-start mode suggestions */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {OUTPUT_MODES.slice(0, 4).map(m => (
                      <button key={m.id} onClick={() => generate(m.id)} disabled={!hasText} className="text-xss px-3 py-1.5 rounded-lg font-medium disabled:opacity-30 transition-all" style={{ background: m.bg, color: m.accent, border: `1px solid ${m.accent}30` }}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Previously generated */}
            {generatedCount > 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xss font-semibold uppercase tracking-wider mb-3" style={{ color: "#9981c9" }}>Previously Generated</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(results).map((modeKey) => {
                    const m = OUTPUT_MODES.find(m => m.id === modeKey)!;
                    return (
                      <button
                        key={modeKey}
                        onClick={() => setActiveMode(modeKey as OutputMode)}
                        className="text-xss px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{ background: activeMode === modeKey ? m.bg : "rgba(255,255,255,0.04)", color: activeMode === modeKey ? m.accent : "#9981c9", border: `1px solid ${activeMode === modeKey ? m.accent + "40" : "rgba(255,255,255,0.08)"}` }}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
