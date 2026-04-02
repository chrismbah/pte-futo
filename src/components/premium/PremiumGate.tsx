/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, onSnapshot, setDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useGetUserInfo } from "../../hooks/auth/useGetUserInfo";
import { useWallet } from "../../hooks/wallet/useWallet";
import { notifyUser } from "../../helpers/notifyUser";
import { useNavigate } from "react-router-dom";
import { useSubscriptionManager } from "../../hooks/premium/useSubscriptionManager";

const PREMIUM_PRICE = 500;

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: "ChatGPT 5nano AI",
    desc: "The best AI model - upload PDFs, images, or PowerPoints for instant summaries",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    label: "Flashcards & MCQs",
    desc: "Auto-generate revision flashcards and MCQ exam questions from your notes",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: "Mnemonics & Key Points",
    desc: "Memory aids, acronyms, timelines, and glossaries — all AI-generated",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    label: "Theory Questions",
    desc: "Practice long-answer questions with detailed model answers from your docs",
  },
];

interface PremiumGateProps {
  children: React.ReactNode;
  featureName?: string;
}

export function PremiumGate({ children, featureName = "AI Notes" }: PremiumGateProps) {
  const navigate = useNavigate();
  const { studentDetails, userID } = useGetUserInfo();
  const userEmail = studentDetails?.email || "";
  const userName = `${studentDetails?.firstName || ""} ${studentDetails?.lastName || ""}`.trim();

  const { wallet, payWithWallet } = useWallet(userID, userEmail);
  const balance = wallet?.balance ?? 0;

  // Auto-renewal hook - checks subscription status and attempts renewal if expired
  useSubscriptionManager({ userID, userEmail, userName });

  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);

  useEffect(() => {
    if (!userID) return;
    const unsub = onSnapshot(doc(db, "premiumUsers", userID), (snap) => {
      setIsPremium(snap.exists() && snap.data()?.active === true);
      setChecking(false);
    });
    return () => unsub();
  }, [userID]);

  const grantPremium = async (reference: string) => {
    if (!userID) return;
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
  };

  const handleWalletPay = async () => {
    if (balance < PREMIUM_PRICE) {
      notifyUser("error", `Insufficient balance. You need ${fmt(PREMIUM_PRICE)} but have ${fmt(balance)}.`);
      setShowConfirm(false);
      return;
    }
    setPaying(true);
    try {
      await payWithWallet(PREMIUM_PRICE, "EBSUMSA Premium Package");
      await grantPremium(`ebsu_premium_wallet_${Date.now()}`);
      setShowConfirm(false);
      setUnlocking(true);
      setTimeout(() => {
        setUnlocking(false);
        notifyUser("success", "Premium unlocked! Enjoy your AI Notes.");
      }, 2200);
    } catch (err: any) {
      notifyUser("error", err?.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  // Loading skeleton
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#00875a]/20 border-t-[#00875a] animate-spin" />
          <p className="text-sm text-gray-500">Checking access...</p>
        </div>
      </div>
    );
  }

  // Unlock animation overlay
  if (unlocking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="w-24 h-24 rounded-full bg-[#00875a] flex items-center justify-center shadow-2xl shadow-[#00875a]/30"
          >
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </svg>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center">
            <p className="text-2xl font-black text-gray-900">Premium Unlocked!</p>
            <p className="text-gray-500 text-sm mt-1">Welcome to {featureName}</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Premium — show feature content
  if (isPremium) {
    return <>{children}</>;
  }

  // Paywall
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blurred preview background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
        <div className="opacity-10 blur-sm scale-105 min-h-screen bg-white" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8 pb-20">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Hero lock card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{
            background: "linear-gradient(135deg, #064e3b 0%, #00875a 55%, #059669 100%)",
            boxShadow: "0 20px 60px rgba(0,135,90,0.3)",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-8 w-20 h-20 rounded-full bg-white/5 -translate-y-1/2" />

          <div className="relative p-8 text-center">
            {/* Lock icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur mb-4 mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 mb-3">
              <svg className="w-3.5 h-3.5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-300 text-xs font-bold tracking-wide">PREMIUM FEATURE</span>
            </div>

            <h1 className="text-3xl font-black text-white mb-2 text-balance">
              {featureName}
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto">
              Transform your study materials into smart summaries, flashcards, MCQs, and more — powered by ChatGPT 5nano.
            </p>

            {/* Price tag */}
            <div className="inline-flex items-center gap-3 mt-5 px-5 py-3 rounded-2xl bg-white/10 border border-white/20">
              <div>
                <p className="text-2xl font-black text-white leading-none">{fmt(PREMIUM_PRICE)}</p>
                <p className="text-white/50 text-xs mt-0.5">per month · auto-renews</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-yellow-300 font-bold text-xs">All Features</p>
                <p className="text-white/50 text-xs">Auto-renews monthly</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-6 shadow-sm"
        >
          <div className="px-5 py-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">What you unlock</p>
          </div>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="flex items-start gap-4 px-5 py-4"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-[#00875a]">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
              <svg className="w-4 h-4 text-[#00875a] flex-shrink-0 mt-1 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          ))}
        </motion.div>

        {/* Wallet payment card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4"
        >
          <div className="px-5 pt-5 pb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Pay with Wallet</p>

            {/* Wallet balance row */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00875a]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#00875a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Wallet Balance</p>
                  <p className="text-base font-black text-gray-900">{fmt(balance)}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${balance >= PREMIUM_PRICE ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"}`}>
                {balance >= PREMIUM_PRICE ? "Sufficient" : "Insufficient"}
              </span>
            </div>

            {balance < PREMIUM_PRICE && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mb-4">
                <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-amber-700">Balance too low</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    You need {fmt(PREMIUM_PRICE - balance)} more. Fund your wallet first.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => balance >= PREMIUM_PRICE ? setShowConfirm(true) : navigate("/u/wallet")}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: balance >= PREMIUM_PRICE
                  ? "linear-gradient(135deg, #00875a, #059669)"
                  : "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "white",
                boxShadow: balance >= PREMIUM_PRICE
                  ? "0 4px 20px rgba(0,135,90,0.3)"
                  : "0 4px 20px rgba(245,158,11,0.3)",
              }}
            >
              {balance >= PREMIUM_PRICE ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Unlock Premium — {fmt(PREMIUM_PRICE)}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Fund Wallet to Continue
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Alternative CTA */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-400"
        >
          Already premium?{" "}
          <button
            onClick={() => navigate("/u/premium")}
            className="text-[#00875a] font-semibold hover:underline"
          >
            Manage your subscription
          </button>
        </motion.p>
      </div>

      {/* Confirm payment modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => !paying && setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#00875a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-gray-900">Confirm Payment</h3>
                <p className="text-sm text-gray-500 mt-1">This will deduct from your wallet balance</p>
              </div>

              {/* Details */}
              <div className="mx-6 mb-5 rounded-2xl bg-gray-50 border border-gray-100 divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Package</span>
                  <span className="text-sm font-semibold text-gray-900">EBSUMSA Premium</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-sm font-bold text-[#00875a]">{fmt(PREMIUM_PRICE)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Balance after</span>
                  <span className="text-sm font-semibold text-gray-900">{fmt(balance - PREMIUM_PRICE)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={paying}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWalletPay}
                  disabled={paying}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #00875a, #059669)", boxShadow: "0 4px 16px rgba(0,135,90,0.3)" }}
                >
                  {paying ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm & Pay
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
