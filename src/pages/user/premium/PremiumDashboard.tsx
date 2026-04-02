/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from "../../../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import { useSubscriptionManager } from "../../../hooks/premium/useSubscriptionManager";

const FEATURES = [
  {
    id: "ai-summarizer",
    title: "AI Summarizer",
    desc: "Condense textbooks, journals, and clinical guidelines into bite-sized summaries in seconds.",
    detail: "Paste up to 20,000 words of medical content. The AI extracts key concepts, differentials, and management points formatted for quick recall.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    accent: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    tag: "AI",
    link: "/u/pdf-summarizer",
    cta: "Open Summarizer",
  },
  {
    id: "mentorship",
    title: "Academic Mentorship",
    desc: "Get paired with senior students and medical professionals for personalised 1-on-1 guidance.",
    detail: "Submit your mentorship request and get matched within 48 hours based on your level, interests, and goals. Sessions are conducted via video call or chat.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    accent: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    tag: "Mentorship",
    link: "/u/premium/mentorship",
    cta: "Request Mentor",
  },
  {
    id: "skills",
    title: "Skills Acquisition",
    desc: "Access curated programmes in communication, leadership, clinical procedures, and research.",
    detail: "Structured self-paced modules covering clinical skills, academic writing, grant applications, research methodology, and professional soft skills.",
    icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    accent: "#fb923c",
    bg: "rgba(251,146,60,0.08)",
    tag: "Skills",
    link: "/u/premium/skills",
    cta: "Browse Modules",
  },
  {
    id: "tech",
    title: "Tech Skills for Doctors",
    desc: "Learn web development, data science, AI/ML, and digital health tools from structured tracks.",
    detail: "Curated learning paths in Python for medicine, health data analysis, building medical apps, and leveraging AI tools in clinical practice.",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    accent: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    tag: "Tech",
    link: "/u/premium/tech-skills",
    cta: "Start Learning",
  },
  {
    id: "udemy",
    title: "Udemy Course Access",
    desc: "Exclusive access to curated Udemy courses handpicked for medical students and healthcare professionals.",
    detail: "Courses include anatomy revision, USMLE prep, pharmacology made easy, clinical communication, and global health certifications.",
    icon: "M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.89L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
    accent: "#f472b6",
    bg: "rgba(244,114,182,0.08)",
    tag: "Courses",
    link: "/u/premium/udemy",
    cta: "View Courses",
  },
  {
    id: "exam-prep",
    title: "Exam Prep Vault",
    desc: "Access an exclusive bank of past MBBS questions, model answers, and timed mock exams.",
    detail: "Hundreds of EBSU MBBS past questions organised by level and subject, with model answers written by final-year students and consultants.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    accent: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    tag: "Exams",
    link: "/u/premium/exam-prep",
    cta: "Open Vault",
  },
  {
    id: "cv",
    title: "Medical CV Builder",
    desc: "Create a polished, ATS-friendly CV tailored for medical internships, residency, and fellowship applications.",
    detail: "Templates designed by medical professionals. Sections for clinical rotations, research, publications, volunteering, and professional references.",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    accent: "#2dd4bf",
    bg: "rgba(45,212,191,0.08)",
    tag: "Career",
    link: "/u/premium/cv-builder",
    cta: "Build My CV",
  },
  {
    id: "drug-reference",
    title: "Drug & Clinical Reference",
    desc: "Instant drug profiles, dosing guides, interaction checks, and clinical mnemonics — built for MBBS exams.",
    detail: "Search any drug for its full profile — mechanism, indications, contraindications, side effects, and dosing. Check drug interactions and generate memorable mnemonics powered by ChatGPT 5nano.",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    accent: "#38bdf8",
    bg: "rgba(56,189,248,0.08)",
    tag: "Clinical",
    link: "/u/premium/drug-reference",
    cta: "Open Reference",
  },
  {
    id: "community",
    title: "Premium Community",
    desc: "Join an exclusive group of high-achieving EBSU medical students in a private discussion space.",
    detail: "Share research interests, collaborate on projects, find study partners, and access premium-only announcements and opportunities.",
    icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
    accent: "#e879f9",
    bg: "rgba(232,121,249,0.08)",
    tag: "Community",
    link: "/u/premium/community",
    cta: "Join Discussion",
  },
];

const TAG_COLORS: Record<string, string> = {
  AI: "#38bdf8",
  Mentorship: "#34d399",
  Skills: "#fb923c",
  Tech: "#60a5fa",
  Courses: "#f472b6",
  Exams: "#fbbf24",
  Career: "#2dd4bf",
  Community: "#e879f9",
  Clinical: "#38bdf8",
};

export default function PremiumDashboard() {
  const navigate = useNavigate();
  const { studentDetails } = useGetUserInfo();
  const userID = studentDetails?.userID || "";
  const userEmail = studentDetails?.email || "";
  const userName = studentDetails ? `${studentDetails.firstName} ${studentDetails.lastName}` : "Member";

  const [checking, setChecking] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  // Auto-renewal hook - checks subscription status and attempts renewal if expired
  useSubscriptionManager({ userID, userEmail, userName });

  useEffect(() => {
    if (!userID) return;
    const unsub = onSnapshot(doc(db, "premiumUsers", userID), (snap) => {
      const active = snap.exists() && snap.data()?.active === true;
      setChecking(false);
      if (!active) {
        navigate("/u/premium", { replace: true });
      } else {
        const data = snap.data() ?? {};
        // Try expiresAt first, then fall back to paidAt + 1 month
        let expDate: Date | null = null;
        if (data.expiresAt) {
          expDate = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        } else if (data.paidAt) {
          const paidDate: Date = data.paidAt.toDate ? data.paidAt.toDate() : new Date(data.paidAt);
          expDate = new Date(paidDate);
          expDate.setMonth(expDate.getMonth() + 1);
        }
        if (expDate) {
          setExpiresAt(expDate);
          const now = new Date();
          const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setDaysRemaining(diffDays);
        } else {
          // No date info at all — mark as N/A
          setDaysRemaining(-999);
        }
      }
    });
    return () => unsub();
  }, [userID, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d14" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-amber-400 text-sm font-medium">Verifying membership...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
      {/* Header */}
      <div className="relative px-4 sm:px-6 max-w-5xl mx-auto mb-10">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Crown */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, rgba(251,191,36,0.35) 0%, transparent 70%)" }} />
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #92400e, #b45309, #d97706)" }}>
                <svg className="w-8 h-8 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 19l2-9 4 4 4-8 4 8 4-4 2 9H2zm2-2h16l-1.5-6.5-3.5 3.5-4-8-4 8-3.5-3.5L4 17z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-xs font-bold tracking-widest uppercase"
            style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
            EBSUMSA Premium Member
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">
            Welcome,{" "}
            <span style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fde68a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {userName.split(" ")[0]}
            </span>
          </h1>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            You have full access to all EBSUMSA premium features below. Tap any card to explore.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {[
            { label: "Features", value: `${FEATURES.length} Tools`, color: "#fbbf24" },
            { label: "Status", value: "Active", color: "#34d399" },
            { 
              label: "Renews In", 
              value: daysRemaining === null
                ? "..."
                : daysRemaining === -999
                  ? "N/A"
                  : daysRemaining <= 0
                    ? "Expired"
                    : `${daysRemaining}d`,
              color: daysRemaining !== null && daysRemaining !== -999 && daysRemaining <= 7
                ? "#f87171"
                : daysRemaining !== null && daysRemaining !== -999 && daysRemaining <= 14
                  ? "#fb923c"
                  : "#fbbf24"
            },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Renewal Warning Banner */}
        {daysRemaining !== null && daysRemaining !== -999 && daysRemaining <= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 rounded-2xl p-4"
            style={{
              background: daysRemaining <= 3 
                ? "rgba(239,68,68,0.15)" 
                : "rgba(251,146,60,0.12)",
              border: daysRemaining <= 3 
                ? "1px solid rgba(239,68,68,0.3)" 
                : "1px solid rgba(251,146,60,0.25)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ 
                  background: daysRemaining <= 3 ? "rgba(239,68,68,0.2)" : "rgba(251,146,60,0.2)",
                  border: daysRemaining <= 3 ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(251,146,60,0.3)"
                }}>
                <svg className="w-5 h-5" fill="none" stroke={daysRemaining <= 3 ? "#f87171" : "#fb923c"} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: daysRemaining <= 3 ? "#f87171" : "#fb923c" }}>
                  {daysRemaining <= 0 
                    ? "Subscription Expired" 
                    : daysRemaining === 1 
                      ? "Subscription expires tomorrow!" 
                      : `Subscription expires in ${daysRemaining} days`}
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Your subscription will auto-renew from your wallet balance. Make sure you have at least N500 in your wallet.
                  {expiresAt && (
                    <span className="block mt-1 text-gray-500">
                      Expires: {expiresAt.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </p>
                <Link
                  to="/u/wallet"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90"
                  style={{ 
                    background: daysRemaining <= 3 ? "#ef4444" : "#f59e0b", 
                    color: "#fff" 
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Fund Wallet
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * i }}
              className="rounded-2xl overflow-hidden cursor-pointer group"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)` }}
              onClick={() => setExpanded(expanded === f.id ? null : f.id)}
            >
              {/* Top accent line */}
              <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${f.accent}, transparent)` }} />

              <div className="p-5">
                {/* Icon + tag */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: f.bg, border: `1px solid ${f.accent}30` }}>
                    <svg className="w-5 h-5" fill="none" stroke={f.accent} viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xss px-2 py-0.5 rounded-full font-bold" style={{ background: `${f.accent}18`, color: TAG_COLORS[f.tag] }}>
                      {f.tag}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>

                {/* Expanded detail */}
                <div
                  className="overflow-hidden transition-all duration-200"
                  style={{ maxHeight: expanded === f.id ? "200px" : "0px", opacity: expanded === f.id ? 1 : 0 }}
                >
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{f.detail}</p>
                    <Link
                      to={f.link}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
                      style={{ background: f.accent, color: "#0d0d14" }}
                    >
                      {f.cta}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Expand hint */}
                <div className="flex items-center gap-1 mt-3">
                  <svg
                    className="w-3 h-3 transition-transform duration-200"
                    style={{ color: f.accent, transform: expanded === f.id ? "rotate(180deg)" : "rotate(0deg)" }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-xss" style={{ color: f.accent }}>
                    {expanded === f.id ? "Collapse" : "Learn more"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back to dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-center"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-2xl transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
