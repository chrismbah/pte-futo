/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import { useWallet } from "../../../hooks/wallet/useWallet";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import { db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Exam fee is fixed at 30,000 + 1,000 charge = 31,000 total
const EXAM_FEE_AMOUNT = 30000;
const EXAM_FEE_CHARGE = 1000;

// Other fees have 100 NGN charge
const OTHER_FEE_CHARGE = 100;

// Fee types with their processing charges
const FEE_TYPES = [
  {
    id: "exam",
    name: "Exam Fee",
    description: "Semester examination registration fee",
    fixedAmount: EXAM_FEE_AMOUNT,
    charge: EXAM_FEE_CHARGE,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "#f59e0b",
    bgGlow: "rgba(245, 158, 11, 0.15)",
  },
  {
    id: "department",
    name: "Department Fee",
    description: "Departmental dues and activities",
    fixedAmount: null,
    charge: OTHER_FEE_CHARGE,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: "#3b82f6",
    bgGlow: "rgba(59, 130, 246, 0.15)",
  },
  {
    id: "association",
    name: "Association Fee",
    description: "EBSUMSA association dues",
    fixedAmount: null,
    charge: OTHER_FEE_CHARGE,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: "#10b981",
    bgGlow: "rgba(16, 185, 129, 0.15)",
  },
  {
    id: "lab",
    name: "Laboratory Fee",
    description: "Lab equipment and practical materials",
    fixedAmount: null,
    charge: OTHER_FEE_CHARGE,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: "#8b5cf6",
    bgGlow: "rgba(139, 92, 246, 0.15)",
  },
  {
    id: "library",
    name: "Library Fee",
    description: "Library access and resources",
    fixedAmount: null,
    charge: OTHER_FEE_CHARGE,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: "#ec4899",
    bgGlow: "rgba(236, 72, 153, 0.15)",
  },
  {
    id: "other",
    name: "Other Fees",
    description: "Miscellaneous payments",
    fixedAmount: null,
    charge: OTHER_FEE_CHARGE,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    color: "#06b6d4",
    bgGlow: "rgba(6, 182, 212, 0.15)",
  },
];

export default function FeePaymentPage() {
  const navigate = useNavigate();
  const { studentDetails } = useGetUserInfo();
  const userID = studentDetails?.userID || "";
  const userEmail = studentDetails?.email || "";
  const userName = `${studentDetails?.firstName || ""} ${studentDetails?.lastName || ""}`.trim();

  const { wallet, payWithWallet } = useWallet(userID, userEmail);
  const balance = wallet?.balance ?? 0;

  const [selectedFee, setSelectedFee] = useState(FEE_TYPES[0]);
  const [amount, setAmount] = useState<string>("");
  const [paying, setPaying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");

  // For exam fee, use fixed amount. For others, use user input
  const isExamFee = selectedFee.id === "exam";
  const numericAmount = isExamFee ? EXAM_FEE_AMOUNT : (parseFloat(amount) || 0);
  const processingCharge = selectedFee.charge;
  const totalAmount = numericAmount + processingCharge;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);

  const recordPayment = async (reference: string) => {
    await addDoc(collection(db, "feePayments"), {
      userID,
      userEmail,
      userName,
      feeType: selectedFee.id,
      feeName: selectedFee.name,
      amount: numericAmount,
      processingCharge,
      totalAmount,
      reference,
      paymentMethod: "wallet",
      status: "success",
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "transactions"), {
      userID,
      userEmail,
      type: "payment",
      amount: totalAmount,
      description: `${selectedFee.name} Payment`,
      reference,
      status: "success",
      createdAt: serverTimestamp(),
    });
  };

  const handleWalletPay = async () => {
    if (!isExamFee && numericAmount < 100) {
      notifyUser("error", "Minimum amount is 100 Naira.");
      setShowConfirm(false);
      return;
    }
    if (balance < totalAmount) {
      notifyUser("error", "Insufficient wallet balance.");
      setShowConfirm(false);
      return;
    }
    setPaying(true);
    try {
      const reference = `ebsu_fee_wallet_${selectedFee.id}_${Date.now()}`;
      await payWithWallet(totalAmount, `${selectedFee.name} Payment`);
      await recordPayment(reference);
      setPaymentRef(reference);
      setPaymentSuccess(true);
      notifyUser("success", "Payment successful!");
    } catch (err: any) {
      notifyUser("error", err?.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
      setShowConfirm(false);
    }
  };

  const resetForm = () => {
    setPaymentSuccess(false);
    setPaymentRef("");
    setAmount("");
    setSelectedFee(FEE_TYPES[0]);
  };

  const canPay = isExamFee || numericAmount >= 100;
  const insufficientBalance = balance < totalAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Success State */}
        <AnimatePresence mode="wait">
          {paymentSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl shadow-emerald-500/10 border border-emerald-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-emerald-100">Your payment has been processed successfully</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fee Type</span>
                    <span className="font-semibold text-gray-900">{selectedFee.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-semibold text-gray-900">{fmt(numericAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Processing Fee</span>
                    <span className="font-semibold text-gray-900">{fmt(processingCharge)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold text-gray-700">Total Paid</span>
                    <span className="font-bold text-emerald-600 text-lg">{fmt(totalAmount)}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Payment Reference</p>
                  <code className="text-sm font-mono text-gray-700 bg-white px-3 py-1 rounded-lg border">
                    {paymentRef}
                  </code>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Make Another Payment
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Fee Payment Portal</h1>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Pay your academic fees securely with your EBSUMSA wallet
                </p>
              </div>

              {/* Wallet Balance Banner */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Wallet Balance</p>
                    <p className="text-lg font-bold text-white">{fmt(balance)}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/u/wallet")}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Top Up
                </button>
              </div>

              {/* Main Card */}
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Fee Type Selection */}
                <div className="p-6 border-b border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Fee Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FEE_TYPES.map((fee) => (
                      <button
                        key={fee.id}
                        onClick={() => {
                          setSelectedFee(fee);
                          setAmount("");
                        }}
                        className={`relative p-3 rounded-xl border-2 transition-all text-left group ${
                          selectedFee.id === fee.id
                            ? "border-cyan-500 bg-cyan-50/50"
                            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                          style={{ background: fee.bgGlow, color: fee.color }}
                        >
                          {fee.icon}
                        </div>
                        <p className={`text-sm font-semibold ${selectedFee.id === fee.id ? "text-cyan-700" : "text-gray-700"}`}>
                          {fee.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fee.fixedAmount ? fmt(fee.fixedAmount) : `+${fmt(fee.charge)} charge`}
                        </p>
                        {selectedFee.id === fee.id && (
                          <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input - Only show for non-exam fees */}
                {!isExamFee && (
                  <div className="p-6 border-b border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Enter Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">
                        NGN
                      </span>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-16 pr-4 py-4 text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder:text-gray-300"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Minimum amount: 100 Naira</p>
                  </div>
                )}

                {/* Fixed Amount Display - For exam fee */}
                {isExamFee && (
                  <div className="p-6 border-b border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Exam Fee Amount</label>
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-bold text-amber-600">{fmt(EXAM_FEE_AMOUNT)}</p>
                      <p className="text-xs text-amber-500 mt-1">Fixed examination fee</p>
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                {canPay && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100"
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">{selectedFee.name} Amount</span>
                      <span className="font-semibold text-gray-700">{fmt(numericAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Processing Charge</span>
                      <span className="font-semibold text-gray-700">{fmt(processingCharge)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-700">Total Amount</span>
                      <span className="font-bold text-lg" style={{ color: selectedFee.color }}>
                        {fmt(totalAmount)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Insufficient Balance Warning */}
                {canPay && insufficientBalance && (
                  <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-700">Insufficient Balance</p>
                      <p className="text-xs text-red-500">You need {fmt(totalAmount - balance)} more. Please top up your wallet.</p>
                    </div>
                  </div>
                )}

                {/* Pay Button */}
                <div className="p-6">
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={!canPay || paying || insufficientBalance}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 disabled:shadow-none"
                  >
                    {paying ? (
                      <>
                        <Spinner className="w-5 h-5 text-transparent animate-spin fill-white" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                        </svg>
                        Pay {canPay ? fmt(totalAmount) : ""} with Wallet
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !paying && setShowConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    You are about to pay <span className="font-bold text-gray-900">{fmt(totalAmount)}</span> for <span className="font-semibold">{selectedFee.name}</span>
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Current Balance</span>
                      <span className="font-semibold">{fmt(balance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">After Payment</span>
                      <span className="font-semibold text-cyan-600">{fmt(balance - totalAmount)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex border-t">
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={paying}
                    className="flex-1 py-4 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWalletPay}
                    disabled={paying}
                    className="flex-1 py-4 bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {paying ? (
                      <>
                        <Spinner className="w-4 h-4 text-transparent animate-spin fill-white" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Payment"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
