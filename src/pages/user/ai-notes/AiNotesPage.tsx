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

interface Flashcard {
  term: string;
  definition: string;
}

interface MCQItem {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface TheoryItem {
  question: string;
  answer: string;
}

interface KeyPoint {
  point: string;
  detail: string;
}

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
  color: string;
  textColor: string;
}[] = [
  { id: "summary",    label: "Summary",    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",                                                                                                                                                                                                         description: "Concise summary of the entire document",         color: "bg-[#bef264]/80 hover:bg-[#bef264]", textColor: "text-[#3a5c00]" },
  { id: "flashcards", label: "Flashcards", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",                                                                                                                                                                    description: "Term-definition cards for quick revision",       color: "bg-[#93c5fd]/80 hover:bg-[#93c5fd]", textColor: "text-[#1d4ed8]" },
  { id: "mcq",        label: "MCQ Exam",   icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",                                                                                                                                                                              description: "Multiple-choice questions with answers",         color: "bg-[#fde68a]/80 hover:bg-[#fde68a]", textColor: "text-[#b45309]" },
  { id: "theory",     label: "Theory Qs", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",                                                                                                                                                                                                                   description: "Long-form theory questions & model answers",     color: "bg-[#c4b5fd]/80 hover:bg-[#c4b5fd]", textColor: "text-[#6d28d9]" },
  { id: "keypoints",  label: "Key Points", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",                                                                                                                                                                                                                    description: "Bullet-point key facts and concepts",            color: "bg-[#6ee7b7]/80 hover:bg-[#6ee7b7]", textColor: "text-[#047857]" },
  { id: "mnemonics",  label: "Mnemonics",  icon: "M13 10V3L4 14h7v7l9-11h-7z",                                                                                                                                                                                                                                                                                                    description: "Memory aids and acronyms",                       color: "bg-[#fca5a5]/80 hover:bg-[#fca5a5]", textColor: "text-[#b91c1c]" },
  { id: "timeline",   label: "Timeline",   icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                                                                                                                                                                                                                   description: "Chronological order of events/concepts",         color: "bg-[#a5f3fc]/80 hover:bg-[#a5f3fc]", textColor: "text-[#0e7490]" },
  { id: "glossary",   label: "Glossary",   icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", description: "Medical terms and their definitions",            color: "bg-[#c7d2fe]/80 hover:bg-[#c7d2fe]", textColor: "text-[#4338ca]" },
];

// ─── Prompt builders ──────────────────────────────────────────────────────────

const buildPrompt = (mode: OutputMode, text: string): string => {
  const base = `You are an expert medical education assistant. Based on the following medical document text, `;
  switch (mode) {
    case "summary":
      return `${base}write a clear, structured summary in 3-5 paragraphs covering all major concepts, clinical relevance, and key takeaways. Use headings where helpful.\n\nDOCUMENT:\n${text}`;
    case "flashcards":
      return `${base}generate exactly 10 flashcards. Return ONLY valid JSON array like this format:\n[{"term":"...","definition":"..."}]\nNo extra text, no markdown code blocks.\n\nDOCUMENT:\n${text}`;
    case "mcq":
      return `${base}generate as many multiple-choice questions as the document content supports, up to a maximum of 35. Each question must have 4 options (A, B, C, D), a correct answer letter, and a detailed explanation. Return ONLY a valid JSON array with no extra text and no markdown code blocks:\n[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."}]\n\nDOCUMENT:\n${text}`;
    case "theory":
      return `${base}generate as many theory exam questions as the document content supports, up to a maximum of 25. Each question must have a comprehensive model answer of at least 3 sentences. Return ONLY a valid JSON array with no extra text and no markdown code blocks:\n[{"question":"...","answer":"..."}]\n\nDOCUMENT:\n${text}`;
    case "keypoints":
      return `${base}extract the 10 most important key points. Return ONLY valid JSON array:\n[{"point":"...","detail":"..."}]\nNo extra text, no markdown code blocks.\n\nDOCUMENT:\n${text}`;
    case "mnemonics":
      return `${base}create memorable mnemonics, acronyms, and memory aids for the key concepts. Format as a clear, readable list with explanations.\n\nDOCUMENT:\n${text}`;
    case "timeline":
      return `${base}organize the key events, processes, or concepts in chronological or logical sequential order. Present as a clear numbered timeline.\n\nDOCUMENT:\n${text}`;
    case "glossary":
      return `${base}create a comprehensive glossary of all medical terms, abbreviations, and specialized vocabulary. Format as a numbered list: Term: Definition.\n\nDOCUMENT:\n${text}`;
  }
};

// ─── Parse AI JSON responses safely ──────────────────────────────────────────

function parseJSON<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FlashcardViewer({ items }: { items: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Card {index + 1} of {items.length}</span>
        <div className="flex gap-2">
          <button onClick={() => { setIndex((i) => Math.max(0, i - 1)); setFlipped(false); }} disabled={index === 0} className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-40 hover:bg-gray-50">Prev</button>
          <button onClick={() => { setIndex((i) => Math.min(items.length - 1, i + 1)); setFlipped(false); }} disabled={index === items.length - 1} className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      </div>
      <div className="relative h-48 cursor-pointer" onClick={() => setFlipped((f) => !f)} style={{ perspective: "1000px" }}>
        <motion.div className="w-full h-full relative" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.45, ease: "easeInOut" }} style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0 bg-[#00875a] rounded-2xl flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: "hidden" }}>
            <p className="text-xss text-green-200 uppercase tracking-widest mb-3 font-medium">Term</p>
            <p className="text-white font-semibold text-base leading-snug">{items[index].term}</p>
            <p className="text-green-200 text-xss mt-4">Tap to reveal definition</p>
          </div>
          <div className="absolute inset-0 bg-white border-2 border-[#00875a] rounded-2xl flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-xss text-[#00875a] uppercase tracking-widest mb-3 font-medium">Definition</p>
            <p className="text-gray-800 text-sm leading-relaxed">{items[index].definition}</p>
          </div>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {items.map((card, i) => (
          <div key={i} onClick={() => { setIndex(i); setFlipped(false); }} className={`cursor-pointer p-3 rounded-xl border transition-all ${i === index ? "border-[#00875a] bg-[#f0fdf4]" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
            <p className="text-xs font-semibold text-gray-800 truncate">{card.term}</p>
            <p className="text-xss text-gray-500 truncate mt-0.5">{card.definition}</p>
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
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
        <span className="text-sm text-gray-600">Score</span>
        <span className="font-bold text-[#00875a]">{score} / {items.length}</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">{i + 1}. {item.question}</p>
          <div className="space-y-2">
            {item.options.map((opt) => {
              const optLabel = opt.charAt(0);
              const isCorrect = optLabel === item.answer[0];
              const isSelected = selected[i] === optLabel;
              const isRevealed = revealed[i];
              let bg = "bg-white border-gray-200 text-gray-700 hover:border-gray-300";
              if (isRevealed) {
                if (isCorrect) bg = "bg-green-50 border-green-400 text-green-800";
                else if (isSelected && !isCorrect) bg = "bg-red-50 border-red-400 text-red-700";
              } else if (isSelected) {
                bg = "bg-[#00875a] border-[#00875a] text-white";
              }
              return (
                <button key={opt} onClick={() => { if (!isRevealed) setSelected((s) => ({ ...s, [i]: optLabel })); }} disabled={isRevealed} className={`w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all ${bg}`}>
                  {opt}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end mt-3">
            {!revealed[i] ? (
              <button onClick={() => setRevealed((r) => ({ ...r, [i]: true }))} disabled={!selected[i]} className="text-xs px-3 py-1.5 bg-[#00875a] text-white rounded-lg disabled:opacity-40 hover:bg-[#21875a] transition-colors">Check</button>
            ) : (
              <div className="text-xss text-blue-700 bg-blue-50 rounded-lg px-3 py-2 text-left w-full">
                <span className="font-semibold block mb-1">Explanation:</span>
                <div className="text-blue-800">{renderMarkdown(item.explanation)}</div>
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
        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors">
            <p className="text-sm font-semibold text-gray-900 pr-4">{i + 1}. {item.question}</p>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform ${open === i ? "rotate-180" : ""}`}>
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="p-4 bg-blue-50 border-t border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Model Answer</p>
                  <div className="text-sm text-gray-800 leading-relaxed">{renderMarkdown(item.answer)}</div>
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
        <div key={i} className="flex gap-3 bg-white border border-gray-100 rounded-xl p-4">
          <div className="w-7 h-7 flex-shrink-0 rounded-full bg-[#00875a] flex items-center justify-center">
            <span className="text-white text-xss font-bold">{i + 1}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{kp.point}</p>
            <div className="text-xs text-gray-600 mt-1 leading-relaxed">{renderMarkdown(kp.detail)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMarkdown(text: string): JSX.Element {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  const inlineFormat = (line: string, key: string): JSX.Element => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return (
      <span key={key}>
        {parts.map((part, pi) => {
          if (part.startsWith("**") && part.endsWith("**")) return <strong key={pi} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
          if (part.startsWith("*") && part.endsWith("*")) return <em key={pi} className="italic">{part.slice(1, -1)}</em>;
          if (part.startsWith("`") && part.endsWith("`")) return <code key={pi} className="bg-gray-100 text-[#00875a] px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
          return <span key={pi}>{part}</span>;
        })}
      </span>
    );
  };
  lines.forEach((line, idx) => {
    const key = `line-${idx}`;
    if (/^### (.+)/.test(line)) elements.push(<h3 key={key} className="text-sm font-bold text-gray-900 mt-4 mb-1">{line.replace(/^### /, "")}</h3>);
    else if (/^## (.+)/.test(line)) elements.push(<h2 key={key} className="text-base font-bold text-gray-900 mt-5 mb-2 border-b border-gray-100 pb-1">{line.replace(/^## /, "")}</h2>);
    else if (/^# (.+)/.test(line)) elements.push(<h1 key={key} className="text-lg font-extrabold text-gray-900 mt-5 mb-2">{line.replace(/^# /, "")}</h1>);
    else if (/^[-*•] (.+)/.test(line)) elements.push(<li key={key} className="flex gap-2 text-sm text-gray-800 leading-relaxed"><span className="text-[#00875a] font-bold mt-0.5 flex-shrink-0">•</span><span>{inlineFormat(line.replace(/^[-*•] /, ""), key + "c")}</span></li>);
    else if (/^\d+\. (.+)/.test(line)) { const num = line.match(/^(\d+)\./)?.[1]; elements.push(<li key={key} className="flex gap-2 text-sm text-gray-800 leading-relaxed"><span className="text-[#00875a] font-bold flex-shrink-0 min-w-[18px]">{num}.</span><span>{inlineFormat(line.replace(/^\d+\. /, ""), key + "c")}</span></li>); }
    else if (line.trim() === "") elements.push(<div key={key} className="h-2" />);
    else elements.push(<p key={key} className="text-sm text-gray-800 leading-relaxed">{inlineFormat(line, key + "c")}</p>);
  });
  return <div className="space-y-1">{elements}</div>;
}

function TextViewer({ content }: { content: string }) {
  return <div className="bg-white rounded-xl p-1">{renderMarkdown(content)}</div>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#00875a] transition-colors">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        {copied ? <path d="M20 6L9 17l-5-5" /> : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>}
      </svg>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── File type helpers ────────────────────────────────────────────────────────
function detectFileType(file: File): FileType {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pptx") || file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "pptx";
  if (name.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/) || file.type.startsWith("image/")) return "image";
  if (name.endsWith(".txt") || file.type === "text/plain") return "txt";
  return "pdf";
}

function getFileTypeLabel(type: FileType): string {
  switch (type) {
    case "image": return "Running OCR on image...";
    case "pptx":  return "Extracting slides from PowerPoint...";
    case "pdf":   return "Extracting text from PDF...";
    case "txt":   return "Reading text file...";
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AiNotesPage() {
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

  const resetState = () => {
    setFileName(null);
    setFileType(null);
    setRawText("");
    setResults({});
    setError(null);
    setImagePreview(null);
    setExtractProgress(null);
  };

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
    });
  };

  const extractFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    if (!(window as any).pdfjsLib) {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const pdfjs = (window as any).pdfjsLib;
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let allText = "";
    const maxPages = Math.min(pdf.numPages, 30);
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      setExtractProgress(`Reading page ${pageNum} of ${maxPages}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      allText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return allText.trim();
  };

  const extractFromImage = async (file: File): Promise<string> => {
    if (!(window as any).Tesseract) {
      setExtractProgress("Loading OCR engine...");
      await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
    }
    const Tesseract = (window as any).Tesseract;
    setExtractProgress("Recognizing text (this may take 10-30 seconds)...");
    const result = await Tesseract.recognize(file, "eng", {
      logger: (m: any) => {
        if (m.status === "recognizing text") {
          setExtractProgress(`Recognizing text: ${Math.round((m.progress || 0) * 100)}%`);
        }
      },
    });
    return result.data.text.trim();
  };

  const extractFromPPTX = async (file: File): Promise<string> => {
    if (!(window as any).JSZip) {
      setExtractProgress("Loading PPTX parser...");
      await loadScript("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js");
    }
    const JSZip = (window as any).JSZip;
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const slideFiles = Object.keys(zip.files)
      .filter((name) => name.match(/^ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
        return numA - numB;
      });
    let allText = "";
    for (let i = 0; i < slideFiles.length; i++) {
      setExtractProgress(`Parsing slide ${i + 1} of ${slideFiles.length}...`);
      const xml = await zip.files[slideFiles[i]].async("string");
      const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
      const slideText = matches.map((m: string) => m.replace(/<[^>]+>/g, "").trim()).filter(Boolean).join(" ");
      if (slideText) allText += `[Slide ${i + 1}]: ${slideText}\n`;
    }
    return allText.trim();
  };

  const handleFile = useCallback(async (file: File) => {
    resetState();
    const type = detectFileType(file);
    setFileType(type);
    setFileName(file.name);
    setIsExtracting(true);
    setError(null);
    if (type === "image") {
      setImagePreview(URL.createObjectURL(file));
    }
    try {
      let text = "";
      if (type === "txt") {
        text = await file.text();
      } else if (type === "pdf") {
        text = await extractFromPDF(file);
        if (!text || text.length < 30) {
          setError("Could not extract readable text from this PDF. It may be scanned — try uploading a photo of it instead.");
          setIsExtracting(false);
          return;
        }
      } else if (type === "image") {
        text = await extractFromImage(file);
        if (!text || text.length < 10) {
          setError("Could not read text from this image. Make sure the image is clear and well-lit.");
          setIsExtracting(false);
          return;
        }
      } else if (type === "pptx") {
        text = await extractFromPPTX(file);
        if (!text || text.length < 20) {
          setError("Could not extract text from this PowerPoint. Make sure slides contain typed text (not just images).");
          setIsExtracting(false);
          return;
        }
      }
      setRawText(text.slice(0, 12000));
    } catch (e: any) {
      setError(`Failed to read the file: ${e?.message || "Unknown error"}. Please try again.`);
    } finally {
      setIsExtracting(false);
      setExtractProgress(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const waitForPuter = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).puter?.ai) { resolve((window as any).puter); return; }
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).puter?.ai) { clearInterval(interval); resolve((window as any).puter); }
        else if (attempts > 40) { clearInterval(interval); reject(new Error("Puter.js failed to load. Please refresh and try again.")); }
      }, 250);
    });
  };

  const generate = async (mode: OutputMode) => {
    if (!rawText.trim()) { setError("Please upload a document or paste your notes first."); return; }
    setActiveMode(mode);
    setIsGenerating(true);
    setError(null);
    try {
      const puter = await waitForPuter();
      const prompt = buildPrompt(mode, rawText.slice(0, 12000));
      // Use ChatGPT 5nano - the best AI model for premium features
      const response = await puter.ai.chat(prompt, false, { model: "gpt-5-nano" });
      let content = typeof response === "string" ? response : response?.message?.content ?? response?.toString() ?? "";
      let result: OutputResult;
      if (mode === "flashcards") { const parsed = parseJSON<Flashcard[]>(content); result = { mode, items: parsed || [{ term: "Parse error", definition: content }] }; }
      else if (mode === "mcq")   { const parsed = parseJSON<MCQItem[]>(content);    result = { mode, items: parsed || [] }; }
      else if (mode === "theory") { const parsed = parseJSON<TheoryItem[]>(content); result = { mode, items: parsed || [] }; }
      else if (mode === "keypoints") { const parsed = parseJSON<KeyPoint[]>(content); result = { mode, items: parsed || [] }; }
      else result = { mode, content } as OutputResult;
      setResults((prev) => ({ ...prev, [mode]: result }));
      playSound("ai-done");
    } catch (e: any) {
      setError(e?.message || "AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentResult = results[activeMode];
  const hasText = rawText.trim().length > 0;

  const renderResult = (res: OutputResult) => {
    switch (res.mode) {
      case "flashcards": return <FlashcardViewer items={res.items} />;
      case "mcq":        return <MCQViewer items={res.items} />;
      case "theory":     return <TheoryViewer items={res.items} />;
      case "keypoints":  return <KeyPointsViewer items={res.items} />;
      default:           return <TextViewer content={(res as any).content} />;
    }
  };

  const fadeIn = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Topbar */}
      <div className="fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-200 h-14 flex items-center px-4 sm:px-8 gap-3">
        <NavLink to="/dashboard" className="flex items-center gap-1.5 text-gray-500 hover:text-[#00875a] text-sm transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
          Dashboard
        </NavLink>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-800 text-sm">AI Notes</span>
        <div className="ml-auto">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#00875a]"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Powered by Puter.js AI
          </span>
        </div>
      </div>

      <div className="pt-14 max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── LEFT PANEL ── */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div {...fadeIn}>
              <h1 className="text-xl font-bold text-gray-900">AI Note Summarizer</h1>
              <p className="text-sm text-gray-500 mt-1">Upload a PDF, PowerPoint, image, or paste text — then choose a study mode.</p>
            </motion.div>

            {/* Upload zone */}
            <motion.div {...fadeIn}>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${isDragging ? "border-[#00875a] bg-[#f0fdf4]" : "border-gray-200 bg-white hover:border-[#00875a] hover:bg-[#f0fdf4]"}`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.txt,.pptx,.ppt,.jpg,.jpeg,.png,.webp,.bmp" className="hidden" onChange={handleFileChange} />

                {isExtracting ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-8 h-8 border-[3px] border-[#00875a] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">{fileType ? getFileTypeLabel(fileType) : "Processing..."}</p>
                    {extractProgress && <p className="text-xss text-gray-400">{extractProgress}</p>}
                  </div>
                ) : fileName ? (
                  <div className="flex flex-col items-center gap-2">
                    {imagePreview && fileType === "image" ? (
                      <div className="w-full max-h-32 overflow-hidden rounded-xl mb-1">
                        <img src={imagePreview} alt="Uploaded preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#00875a" strokeWidth="2" className="w-5 h-5"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-800 truncate max-w-full">{fileName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xss px-2 py-0.5 bg-[#f0fdf4] text-[#00875a] rounded-full font-medium capitalize">{fileType}</span>
                      <span className="text-xss text-gray-400">{rawText.length.toLocaleString()} chars extracted</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); resetState(); }} className="text-xss text-red-400 hover:text-red-600 mt-1">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        </div>
                        <span className="text-xss text-gray-400">PDF</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" className="w-5 h-5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                        </div>
                        <span className="text-xss text-gray-400">PPTX</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </div>
                        <span className="text-xss text-gray-400">Image</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        </div>
                        <span className="text-xss text-gray-400">TXT</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Drop your file here</p>
                      <p className="text-xss text-gray-400 mt-1">PDF, PowerPoint (.pptx), Images (JPG/PNG), or TXT</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Snap tip */}
            <motion.div {...fadeIn}>
              <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="w-4 h-4 flex-shrink-0 mt-0.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                <div>
                  <p className="text-xs font-semibold text-blue-800">Snap &amp; Study</p>
                  <p className="text-xss text-blue-600 mt-0.5 leading-relaxed">Take a photo of your handwritten or printed notes and upload it — AI will read and analyze the text automatically.</p>
                </div>
              </div>
            </motion.div>

            {/* Manual text */}
            <motion.div {...fadeIn}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Or paste your notes</label>
              <textarea
                rows={7}
                value={rawText}
                onChange={(e) => { const v = e.target.value; resetState(); setRawText(v); }}
                placeholder="Paste lecture notes, textbook content, or any medical text here..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors placeholder-gray-400"
              />
              <div className="flex items-center justify-between mt-1">
                {rawText.length > 0 && <span className="text-xss text-[#00875a] font-medium">Ready — {rawText.length.toLocaleString()} characters</span>}
                <span className="text-xss text-gray-400 ml-auto">{rawText.length.toLocaleString()} / 12,000</span>
              </div>
            </motion.div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">{error}</div>}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-3 space-y-4">
            <motion.div {...fadeIn}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Choose a Study Mode</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OUTPUT_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => generate(m.id)}
                    disabled={!hasText || isGenerating}
                    className={`relative group flex flex-col items-center gap-2 p-3 rounded-2xl text-center transition-all border-2 ${
                      activeMode === m.id && results[m.id] ? `${m.color.replace("hover:", "")} border-current` : `${m.color} border-transparent`
                    } ${!hasText || isGenerating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {isGenerating && activeMode === m.id ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${m.textColor}`}>
                        <path d={m.icon} />
                      </svg>
                    )}
                    <span className={`text-xss font-semibold leading-tight ${m.textColor}`}>{m.label}</span>
                    {results[m.id] && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00875a] rounded-full" />}
                  </button>
                ))}
              </div>
              <p className="text-xss text-gray-400 mt-2">{Object.keys(results).length} / {OUTPUT_MODES.length} modes generated</p>
            </motion.div>

            {/* Output area */}
            <AnimatePresence mode="wait">
              {currentResult ? (
                <motion.div key={activeMode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{OUTPUT_MODES.find((m) => m.id === activeMode)?.label}</span>
                      {fileName && <span className="text-xss text-gray-400 truncate max-w-[120px]">from {fileName}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <CopyButton text={"content" in currentResult ? (currentResult as any).content : JSON.stringify((currentResult as any).items, null, 2)} />
                      <button onClick={() => generate(activeMode)} className="text-xs text-gray-400 hover:text-[#00875a] flex items-center gap-1 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Regenerate
                      </button>
                    </div>
                  </div>
                  <div className="p-5 max-h-[600px] overflow-y-auto">{renderResult(currentResult)}</div>
                </motion.div>
              ) : !isGenerating ? (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-7 h-7"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{hasText ? "Select a study mode above to generate content" : "Upload a file or paste your notes to get started"}</p>
                  <p className="text-xss text-gray-400 mt-1">Supports PDF, PowerPoint, images (snap &amp; study), and plain text</p>
                </motion.div>
              ) : (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 border-[3px] border-[#00875a] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm font-medium text-gray-700">Generating {OUTPUT_MODES.find((m) => m.id === activeMode)?.label}...</p>
                  <p className="text-xss text-gray-400 mt-1">This usually takes 5-15 seconds</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
