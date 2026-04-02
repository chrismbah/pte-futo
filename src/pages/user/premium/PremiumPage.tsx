/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from "react";
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import { db } from "../../../config/firebase";
import {
  doc, onSnapshot, setDoc, serverTimestamp, collection, addDoc, getDoc, updateDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import { useNavigate } from "react-router-dom";

const PREMIUM_PRICE = 500;
const PAYSTACK_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
  "pk_live_77ab98bc87c205ec76cb2f7d534cff02df034c8e";

const FEATURES = [
  {
    title: "ChatGPT 5nano AI",
    desc: "Powered by the best AI model - summarize textbooks, generate flashcards, MCQs & more instantly.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.15)",
    tag: "Best AI",
  },
  {
    title: "Academic Mentorship",
    desc: "Get paired with senior students and medical professionals for personalised guidance.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    accent: "#34d399",
    glow: "rgba(52,211,153,0.15)",
    tag: "Mentorship",
  },
  {
    title: "Skills Acquisition",
    desc: "Access curated programmes in communication, leadership, and clinical procedures.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    accent: "#fb923c",
    glow: "rgba(251,146,60,0.15)",
    tag: "Skills",
  },
  {
    title: "Tech Skills",
    desc: "Learn web development, data science, AI/ML, and digital health tools.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    accent: "#60a5fa",
    glow: "rgba(96,165,250,0.15)",
    tag: "Tech",
  },
  {
    title: "Udemy Courses",
    desc: "Access curated Udemy courses in medicine, science, and technology at special rates.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    accent: "#f472b6",
    glow: "rgba(244,114,182,0.15)",
    tag: "Courses",
  },
];

// Starfield background canvas
function StarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.4 + Math.random() * 1.2,
      a: Math.random(),
      speed: 0.003 + Math.random() * 0.006,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      stars.forEach((s) => {
        const alpha = 0.2 + 0.6 * ((Math.sin(t * s.speed * 60 + s.phase) + 1) / 2);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,100,${alpha * 0.7})`;
        ctx.fill();
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}

export default function PremiumPage() {
  const navigate = useNavigate();
  const { studentDetails, userID: authUserID, loading: authLoading } = useGetUserInfo();
  
  // Memoize user data to prevent unnecessary re-renders
  const userData = useMemo(() => ({
    userID: studentDetails?.userID || authUserID || "",
    userEmail: studentDetails?.email || "",
    userName: `${studentDetails?.firstName || ""} ${studentDetails?.lastName || ""}`.trim(),
  }), [studentDetails, authUserID]);

  const { userID, userEmail, userName } = userData;

  const [isPremium, setIsPremium] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [balance, setBalance] = useState(0);
  const [walletLoaded, setWalletLoaded] = useState(false);
  const [payMethod, setPayMethod] = useState<"paystack" | "wallet">("paystack");
  const [paying, setPaying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Parallel data fetching: Premium status and Wallet balance together
  useEffect(() => {
    if (!userID) {
      // If auth is done loading but no userID, stop checking
      if (!authLoading) {
        setCheckingStatus(false);
        setWalletLoaded(true);
      }
      return;
    }

    let initialLoad = true;
    const unsubscribers: (() => void)[] = [];

    // Subscribe to premium status
    const premiumUnsub = onSnapshot(
      doc(db, "premiumUsers", userID),
      (snap) => {
        const active = snap.exists() && snap.data()?.active === true;
        setIsPremium(active);
        setCheckingStatus(false);
        if (active && initialLoad) {
          navigate("/u/premium/dashboard", { replace: true });
        }
        initialLoad = false;
      },
      (err) => {
        console.error("[PremiumPage] premium status error:", err);
        setCheckingStatus(false);
      }
    );
    unsubscribers.push(premiumUnsub);

    // Subscribe to wallet balance only (no transactions needed here)
    const walletUnsub = onSnapshot(
      doc(db, "wallets", userID),
      (snap) => {
        if (snap.exists()) {
          setBalance(snap.data().balance ?? 0);
        } else {
          setBalance(0);
        }
        setWalletLoaded(true);
      },
      (err) => {
        console.error("[PremiumPage] wallet error:", err);
        setWalletLoaded(true);
      }
    );
    unsubscribers.push(walletUnsub);

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [userID, authLoading, navigate]);

  const grantPremium = async (reference: string) => {
    // Set expiration to 1 month from now
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    await setDoc(doc(db, "premiumUsers", userID), {
      userID, email: userEmail, name: userName,
      active: true, paidAt: serverTimestamp(), reference, amount: PREMIUM_PRICE,
      expiresAt: expiresAt,
    });
    await addDoc(collection(db, "transactions"), {
      userID, type: "payment", amount: PREMIUM_PRICE,
      description: "EBSUMSA Premium Package", reference,
      status: "success", createdAt: serverTimestamp(),
    });
    notifyUser("success", "Premium unlocked! Welcome to EBSUMSA Premium.");
    setTimeout(() => navigate("/u/premium/dashboard"), 1200);
  };

  const waitForPaystack = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) return resolve(true);
      let tries = 0;
      const id = setInterval(() => {
        tries++;
        if ((window as any).PaystackPop) { clearInterval(id); resolve(true); }
        else if (tries >= 20) { clearInterval(id); resolve(false); }
      }, 250);
    });
  };

  const handlePaystack = async () => {
    setPaying(true);
    const ready = await waitForPaystack();
    setPaying(false);
    if (!ready) {
      notifyUser("error", "Payment processor not loaded. Please refresh and try again.");
      return;
    }
    (window as any).PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: userEmail,
      amount: PREMIUM_PRICE * 100,
      ref: `ebsu_premium_${Date.now()}`,
      metadata: { custom_fields: [{ display_name: "Name", variable_name: "name", value: userName }] },
      callback: async (res: any) => {
        setPaying(true);
        try { await grantPremium(res?.reference || `ref_${Date.now()}`); }
        finally { setPaying(false); }
      },
      onClose: () => {},
    }).openIframe();
  };

  const handleWalletPay = async () => {
    setPaying(true);
    try {
      // Inline wallet payment to avoid loading full useWallet hook
      const walletRef = doc(db, "wallets", userID);
      const walletSnap = await getDoc(walletRef);
      if (!walletSnap.exists()) throw new Error("Wallet not found");
      const currentBalance = walletSnap.data().balance;
      if (currentBalance < PREMIUM_PRICE) throw new Error("Insufficient wallet balance");
      
      await updateDoc(walletRef, {
        balance: currentBalance - PREMIUM_PRICE,
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, "transactions"), {
        userID,
        userEmail,
        type: "payment",
        amount: PREMIUM_PRICE,
        description: "EBSUMSA Premium Package",
        status: "success",
        createdAt: serverTimestamp(),
      });
      
      await grantPremium(`ebsu_premium_wallet_${Date.now()}`);
    } catch (err: any) {
      notifyUser("error", err?.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
      setShowConfirm(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);

  // Show loading only while checking premium status (wallet can load in background)
  if (checkingStatus || authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#08001a" }}>
        <Spinner className="w-8 h-8 text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(160deg, #08001a 0%, #0e0028 50%, #08001a 100%)" }}>
      <StarCanvas />

      {/* Deep purple radial blob */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0,
        background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-24 pb-20">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }} className="text-center mb-10">

          {/* Glowing crown ring */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-28 h-28 rounded-full blur-2xl" style={{ background: "rgba(251,191,36,0.18)" }} />
            <div className="absolute w-20 h-20 rounded-full animate-ping" style={{ background: "rgba(251,191,36,0.05)", animationDuration: "3s" }} />
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(217,119,6,0.1))", border: "1px solid rgba(251,191,36,0.35)", boxShadow: "0 0 40px rgba(251,191,36,0.12), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
              <svg viewBox="0 0 40 32" fill="none" className="w-10 h-10">
                <defs>
                  <linearGradient id="pg1" x1="0" y1="0" x2="40" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="55%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>
                <path d="M4 28l3-15 7.5 7L20 4l5.5 16L34 9l3 19H4z"
                  fill="url(#pg1)" stroke="#fbbf24" strokeWidth="1" strokeLinejoin="round" />
                <circle cx="4" cy="13" r="2.2" fill="#fde68a" />
                <circle cx="20" cy="4" r="2.2" fill="#fff9c4" />
                <circle cx="36" cy="9" r="2.2" fill="#fde68a" />
                <rect x="4" y="28" width="32" height="2.5" rx="1.25" fill="url(#pg1)" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight tracking-tight">
            <span className="text-white">EBSUMSA </span>
            <span style={{ background: "linear-gradient(90deg, #fde68a 0%, #fbbf24 45%, #f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Premium
            </span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-sm mx-auto text-balance">
            Subscribe monthly and unlock an elite suite of academic tools, mentorship, and exclusive resources.
          </p>

          {/* Price pill */}
          <div className="inline-flex items-center gap-3 mt-6 px-5 py-3 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(251,191,36,0.2)", boxShadow: "0 4px 32px rgba(251,191,36,0.06)" }}>
            <div>
              <p className="text-3xl font-black text-white leading-none">₦{PREMIUM_PRICE}</p>
              <p className="text-white/30 text-xss font-medium mt-0.5">per month</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-left">
              <p className="text-yellow-400 font-bold text-xs">Monthly</p>
              <p className="text-white/30 text-xss">Auto-renews from wallet</p>
            </div>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.07 }}
              className="relative rounded-2xl p-4 overflow-hidden group/card"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: isPremium ? `0 0 0 0` : "none",
              }}>
              {/* Hover colour wash */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: f.glow }} />
              {/* Top accent line */}
              <div className="absolute top-0 left-4 right-4 h-px rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)` }} />

              <div className="relative flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                  style={{ background: `${f.glow}`, border: `1px solid ${f.accent}30`, color: f.accent }}>
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-white font-bold text-sm">{f.title}</h3>
                    <span className="text-xss px-1.5 py-px rounded-full font-semibold"
                      style={{ background: `${f.glow}`, color: f.accent }}>
                      {f.tag}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
                </div>
                {!isPremium && (
                  <svg className="w-3.5 h-3.5 text-white/20 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
                {isPremium && (
                  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} style={{ color: f.accent }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Payment / Active section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(251,191,36,0.2)", background: "rgba(255,255,255,0.03)", boxShadow: "0 8px 40px rgba(251,191,36,0.05)" }}>

          {isPremium ? (
            <div className="text-center py-10 px-6">
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full blur-lg" style={{ background: "rgba(52,211,153,0.25)" }} />
                <div className="relative w-full h-full rounded-full flex items-center justify-center"
                  style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.4)" }}>
                  <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-white font-black text-xl mb-2">You are Premium</h3>
              <p className="text-white/40 text-sm max-w-xs mx-auto">All features are unlocked. Thank you for supporting EBSUMSA.</p>
              <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium Member
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Top banner */}
              <div className="text-center mb-6">
                <p className="text-white font-bold text-base mb-0.5">Unlock Everything</p>
                <p className="text-white/40 text-xs">One payment. Instant access. No subscriptions.</p>
              </div>

              {/* Method toggle */}
              <div className="flex gap-2 p-1 rounded-xl mb-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {([
                  { id: "paystack", label: "Paystack", icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.693 0H3.307C1.481 0 0 1.481 0 3.307v17.386C0 22.519 1.481 24 3.307 24h17.386C22.519 24 24 22.519 24 20.693V3.307C24 1.481 22.519 0 20.693 0zm-1.76 9.358h-2.595c-.828 0-1.5.672-1.5 1.5v3.784c0 .828.672 1.5 1.5 1.5h2.596v2.117h-2.596c-1.993 0-3.617-1.624-3.617-3.617V10.858c0-1.993 1.624-3.617 3.617-3.617h2.596v2.117zm-8.618 0H7.721c-.828 0-1.5.672-1.5 1.5v3.784c0 .828.672 1.5 1.5 1.5h2.595v2.117H7.721c-1.993 0-3.617-1.624-3.617-3.617V10.858c0-1.993 1.624-3.617 3.617-3.617h2.595v2.117z" />
                    </svg>
                  )},
                  { id: "wallet", label: walletLoaded ? `Wallet (${fmt(balance)})` : "Wallet (...)", icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )},
                ] as { id: "paystack" | "wallet"; label: string; icon: React.ReactNode }[]).map((m) => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all"
                    style={payMethod === m.id ? {
                      background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(217,119,6,0.15))",
                      border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24",
                    } : {
                      background: "transparent", border: "1px solid transparent", color: "rgba(255,255,255,0.35)",
                    }}>
                    {m.icon}{m.label}
                  </button>
                ))}
              </div>

              {/* Wallet insufficient warning */}
              {payMethod === "wallet" && balance < PREMIUM_PRICE && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-400 text-xs leading-relaxed">
                    Insufficient balance. Fund your wallet first or switch to Paystack.
                  </p>
                </motion.div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => payMethod === "paystack" ? handlePaystack() : setShowConfirm(true)}
                disabled={paying || (payMethod === "wallet" && balance < PREMIUM_PRICE)}
                className="w-full relative overflow-hidden rounded-xl py-4 font-black text-sm tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)", color: "#1a0a00", boxShadow: "0 4px 24px rgba(251,191,36,0.3)" }}
              >
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #fde68a, #fbbf24, #b45309)" }} />
                {paying ? (
                  <Spinner className="relative w-5 h-5 text-amber-900" />
                ) : (
                  <span className="relative flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M2 17l2-9 4.5 4L12 4l3.5 8L20 8l2 9H2z" fill="currentColor" />
                    </svg>
                    Unlock Premium — ₦{PREMIUM_PRICE}
                  </span>
                )}
              </button>

              <p className="text-center text-white/20 text-xss mt-3">Secure payment • Instant unlock • No hidden fees</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Wallet confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: "linear-gradient(145deg, #0e0028, #140038)", border: "1px solid rgba(251,191,36,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-base mb-1">Confirm Wallet Payment</h3>
                <p className="text-white/40 text-xs">
                  <span className="text-yellow-400 font-bold">₦{PREMIUM_PRICE}</span> will be deducted from your wallet balance of <span className="text-white font-semibold">{fmt(balance)}</span>.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} disabled={paying}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                  Cancel
                </button>
                <button onClick={handleWalletPay} disabled={paying}
                  className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)", color: "#1a0a00" }}>
                  {paying ? <Spinner className="w-4 h-4" /> : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
