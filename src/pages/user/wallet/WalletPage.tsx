/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import { useWallet } from "../../../hooks/wallet/useWallet";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";
import { Spinner } from "../../../components/loaders/Spinner";
import { notifyUser } from "../../../helpers/notifyUser";
import { db } from "../../../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type Tab = "overview" | "fund" | "transfer" | "withdraw" | "history";

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_live_77ab98bc87c205ec76cb2f7d534cff02df034c8e";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(ts: any) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const txnIcon = (type: string) => {
  switch (type) {
    case "fund":
      return (
        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      );
    case "payment":
      return (
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
      );
    case "transfer_out":
      return (
        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </div>
      );
    case "transfer_in":
      return (
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      );
    case "withdrawal_request":
      return (
        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      );
  }
};

// ─── Fund Wallet Tab ─────────────────────────────────────────────────────────
function FundTab({ userEmail, userName, onSuccess }: { userEmail: string; userName: string; onSuccess: (amount: number, ref: string) => void }) {
  const [amount, setAmount] = useState("");
  const presets = [500, 1000, 2000, 5000, 10000];
  const amountInKobo = Math.round(parseFloat(amount || "0") * 100);
  const isValid = amountInKobo >= 10000; // min ₦100

  const handlePay = () => {
    if (!isValid) return;
    if (!(window as any).PaystackPop) {
      alert("Paystack is not loaded yet. Please refresh and try again.");
      return;
    }
    const handler = (window as any).PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: userEmail,
      amount: amountInKobo,
      ref: `ebsu_${Date.now()}`,
      metadata: { custom_fields: [{ display_name: "Name", variable_name: "name", value: userName }] },
      callback: (response: any) => {
        const reference = response?.reference || response?.trxref || `ref_${Date.now()}`;
        onSuccess(parseFloat(amount), reference);
        setAmount("");
      },
      onClose: () => {},
    });
    handler.openIframe();
  };

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-base font-bold text-gray-900 mb-1">Fund Your Wallet</h3>
      <p className="text-sm text-gray-500 mb-5">Add money to your EBSUMSA wallet securely via Paystack.</p>

      {/* Quick amount presets */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(String(p))}
            className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
              amount === String(p)
                ? "bg-[#00875a] text-white border-[#00875a]"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#00875a] hover:text-[#00875a]"
            }`}
          >
            ₦{p.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₦</span>
        <input
          type="number"
          min="100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (min ₦100)"
          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
        />
      </div>

      <button
        onClick={handlePay}
        disabled={!isValid || !PAYSTACK_KEY}
        className="w-full py-3 rounded-xl font-bold text-sm text-white bg-[#00875a] hover:bg-[#006d49] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Pay {amount && parseFloat(amount) >= 100 ? formatNaira(parseFloat(amount)) : ""} via Paystack
      </button>
      {!PAYSTACK_KEY && (
        <p className="text-xs text-rose-500 text-center mt-2">Paystack public key not configured. Add VITE_PAYSTACK_PUBLIC_KEY to your environment variables.</p>
      )}
      <p className="text-xs text-gray-400 text-center mt-3">Secured by Paystack. Your card details are never stored.</p>
    </div>
  );
}

// ─── Transfer Tab ────────────────────────────────────────────────────────────
function TransferTab({ balance, onTransfer }: { balance: number; onTransfer: (email: string, amount: number) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);

  const amt = parseFloat(amount);
  const isValid = email.trim().length > 3 && email.includes("@") && amt > 0 && amt <= balance;

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !email.includes("@")) return setError("Enter a valid email address");
    if (!amt || amt <= 0) return setError("Enter a valid amount");
    if (amt > balance) return setError(`Insufficient balance. Available: ${formatNaira(balance)}`);
    setConfirming(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await onTransfer(email.trim(), amt);
      setSuccess(true);
      setConfirming(false);
      setEmail("");
      setAmount("");
    } catch (err: any) {
      setConfirming(false);
      setError(err.message || "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center py-8 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900">Transfer Successful</h3>
        <p className="text-sm text-gray-500 text-center">
          {formatNaira(amt)} has been sent successfully.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-2.5 rounded-xl bg-[#00875a] text-white text-sm font-bold hover:bg-[#006d49] transition-colors"
        >
          New Transfer
        </button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="max-w-md mx-auto">
        <h3 className="text-base font-bold text-gray-900 mb-1">Confirm Transfer</h3>
        <p className="text-sm text-gray-500 mb-5">Please review the details before sending.</p>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 mb-5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Recipient</span>
            <span className="text-sm font-semibold text-gray-800 truncate max-w-[60%] text-right">{email.trim()}</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Amount</span>
            <span className="text-lg font-bold text-[#00875a]">{formatNaira(amt)}</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Balance after</span>
            <span className="text-sm font-semibold text-gray-700">{formatNaira(balance - amt)}</span>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => { setConfirming(false); setError(""); }}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-[#00875a] text-white text-sm font-bold hover:bg-[#006d49] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Spinner className="w-4 h-4 text-white" /> : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            )}
            {loading ? "Sending..." : "Confirm & Send"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-base font-bold text-gray-900 mb-1">Transfer Funds</h3>
      <p className="text-sm text-gray-500 mb-5">Send money to another EBSUMSA registered student by their email address.</p>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}
      <form onSubmit={handlePreview} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Recipient Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="student@email.com"
            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Must be a registered EBSUMSA student email.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₦)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₦</span>
            <input
              type="number"
              min="1"
              max={balance}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
              required
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Available balance: {formatNaira(balance)}</p>
        </div>
        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-[#00875a] hover:bg-[#006d49] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Review Transfer
        </button>
      </form>
    </div>
  );
}

// ─── Withdraw Tab ────────────────────────────────────────────────────────────
function WithdrawTab({ balance, onWithdraw }: { balance: number; onWithdraw: (amount: number, bank: string, acct: string, name: string) => Promise<void> }) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return notifyUser("error", "Enter a valid amount");
    if (amt > balance) return notifyUser("error", "Insufficient wallet balance");
    setLoading(true);
    try {
      await onWithdraw(amt, bankName, accountNumber, accountName);
      notifyUser("success", "Withdrawal request submitted. Processing may take up to 24 hours.");
      setAmount(""); setBankName(""); setAccountNumber(""); setAccountName("");
    } catch (err: any) {
      notifyUser("error", err.message || "Withdrawal request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-base font-bold text-gray-900 mb-1">Request Withdrawal</h3>
      <p className="text-sm text-gray-500 mb-2">Submit a withdrawal request. The admin will review and transfer the funds to your account.</p>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex gap-3">
        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-xs font-bold text-amber-800 mb-0.5">Please note — processing may take up to 24 hours</p>
          <p className="text-xs text-amber-700 leading-relaxed">Withdrawal requests are reviewed and processed manually by the admin. Your balance is deducted immediately when the request is submitted. You will be contacted once your funds have been sent.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₦)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₦</span>
            <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a]"
              required />
          </div>
          <p className="text-xs text-gray-400 mt-1">Available: {formatNaira(balance)}</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Name</label>
          <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. First Bank" required
            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Account Number</label>
          <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="10-digit account number" required maxLength={10}
            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Account Name</label>
          <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account holder's name" required
            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a]" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
          {loading ? <Spinner className="w-4 h-4 text-white" /> : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
          {loading ? "Submitting..." : "Submit Withdrawal Request"}
        </button>
      </form>
    </div>
  );
}

// ─── Transaction History Tab ──────────────────────────────────────────────────
function HistoryTab({ transactions, loading, onRefresh }: { transactions: any[]; loading: boolean; onRefresh: () => void }) {
  const typeLabel: Record<string, string> = {
    fund: "Wallet Funded",
    payment: "Payment",
    transfer_out: "Transfer Sent",
    transfer_in: "Transfer Received",
    withdrawal_request: "Withdrawal Request",
  };
  const isCredit = (type: string) => ["fund", "transfer_in"].includes(type);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">Transaction History</h3>
        <button onClick={onRefresh} className="text-xs text-[#00875a] font-semibold hover:underline flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16"><Spinner className="w-7 h-7 text-[#00875a]" /></div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 font-medium">No transactions yet</p>
          <p className="text-xs text-gray-400 mt-1">Fund your wallet to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((txn) => (
            <div key={txn.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-colors">
              {txnIcon(txn.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{typeLabel[txn.type] || txn.type}</p>
                <p className="text-xs text-gray-500 truncate">{txn.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(txn.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-sm font-bold ${isCredit(txn.type) ? "text-green-600" : "text-rose-600"}`}>
                  {isCredit(txn.type) ? "+" : "-"}{formatNaira(txn.amount)}
                </span>
                <span className={`text-xss px-2 py-0.5 rounded-full font-semibold ${
                  txn.status === "success" ? "bg-green-100 text-green-700"
                  : txn.status === "pending" ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
                }`}>
                  {txn.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main WalletPage ──────────────────────────────────────────────────────────
export default function WalletPage() {
  const { user, userID, studentDetails } = useGetUserInfo();
  const userEmail = user?.email || "";
  const userName = studentDetails ? `${studentDetails.firstName} ${studentDetails.lastName}` : userEmail;

  const {
    wallet,
    loadingWallet,
    transactions,
    loadingTransactions,
    fetchTransactions,
    fundWallet,
    transferToUser,
    requestWithdrawal,
  } = useWallet(userID, userEmail);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [supportNumber, setSupportNumber] = useState("+15792583013");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "walletSupport"), (snap) => {
      if (snap.exists()) {
        setSupportNumber(snap.data().phone || "+15792583013");
      }
    });
    return () => unsub();
  }, []);

  const handleFundSuccess = useCallback(async (amount: number, reference: string) => {
    try {
      await fundWallet(amount, reference);
      notifyUser("success", `Wallet funded with ${formatNaira(amount)}`);
      setActiveTab("overview");
    } catch (err: any) {
      notifyUser("error", err.message || "Failed to credit wallet");
    }
  }, [fundWallet]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
    { id: "fund", label: "Fund", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> },
    { id: "transfer", label: "Transfer", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
    { id: "withdraw", label: "Withdraw", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { id: "history", label: "History", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  ];

  if (loadingWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-8 h-8 text-[#00875a]" />
          <p className="text-sm text-gray-500 font-medium">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-3 sm:px-6" style={{ isolation: "auto" }}>
      <div className="max-w-2xl mx-auto">
        {/* Wallet Card */}
        <motion.div
          variants={fadeInVariants5}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          custom={1}
          className="relative overflow-hidden rounded-2xl bg-[#00875a] text-white p-6 mb-6 shadow-lg"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-10 -translate-x-10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-xs font-medium tracking-wide uppercase">EBSUMSA Wallet</p>
                <p className="text-sm font-semibold text-white/90 mt-0.5">{userName}</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-white/60 text-xs mb-1">Available Balance</p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold tracking-tight">
                  {balanceVisible ? formatNaira(balance) : "₦ ••••••"}
                </p>
                <button onClick={() => setBalanceVisible((v) => !v)} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  {balanceVisible ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {/* Premium auto-renewal note */}
              <p className="text-white/40 text-xss mt-2 flex items-center gap-1">
                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                Premium auto-renews from wallet (N500/mo)
              </p>
            </div>

            {/* Quick action buttons on the card */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "fund", label: "Fund" },
                { id: "transfer", label: "Transfer" },
                { id: "withdraw", label: "Withdraw" },
                { id: "history", label: "History" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveTab(btn.id as Tab)}
                  className="flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20 rounded-xl py-2.5 transition-colors"
                >
                  <span className="text-xss font-semibold text-white">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 bg-white border border-gray-100 rounded-2xl mb-6 shadow-sm overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-1 justify-center transition-all ${
                activeTab === tab.id
                  ? "bg-[#00875a] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
          >
            {activeTab === "overview" && (
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4">Wallet Overview</h3>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-xs text-green-600 font-semibold mb-1">Balance</p>
                    <p className="text-lg font-bold text-green-700">{formatNaira(balance)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Transactions</p>
                    <p className="text-lg font-bold text-blue-700">{transactions.length}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-6">
                  {[
                    { label: "Fund Wallet", desc: "Add money via Paystack", tab: "fund" as Tab, color: "bg-green-50 border-green-100", iconColor: "text-green-600" },
                    { label: "Transfer Funds", desc: "Send to another student", tab: "transfer" as Tab, color: "bg-orange-50 border-orange-100", iconColor: "text-orange-600" },
                    { label: "Withdraw", desc: "Request bank withdrawal", tab: "withdraw" as Tab, color: "bg-rose-50 border-rose-100", iconColor: "text-rose-600" },
                    { label: "Transaction History", desc: "View all your transactions", tab: "history" as Tab, color: "bg-gray-50 border-gray-100", iconColor: "text-gray-500" },
                  ].map((item) => (
                    <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                      className={`flex items-center justify-between p-3 rounded-xl border ${item.color} hover:opacity-80 transition-opacity text-left`}>
                      <div>
                        <p className={`text-sm font-semibold ${item.iconColor}`}>{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <svg className={`w-4 h-4 ${item.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
                {/* Recent transactions preview */}
                {transactions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Recent Transactions</p>
                      <button onClick={() => setActiveTab("history")} className="text-xs text-[#00875a] font-semibold hover:underline">See all</button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {transactions.slice(0, 3).map((txn) => {
                        const isCredit = ["fund", "transfer_in"].includes(txn.type);
                        const typeLabel: Record<string, string> = { fund: "Wallet Funded", payment: "Payment", transfer_out: "Transfer Sent", transfer_in: "Transfer Received", withdrawal_request: "Withdrawal Request" };
                        return (
                          <div key={txn.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            {txnIcon(txn.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{typeLabel[txn.type] || txn.type}</p>
                              <p className="text-xs text-gray-400">{formatDate(txn.createdAt)}</p>
                            </div>
                            <span className={`text-sm font-bold flex-shrink-0 ${isCredit ? "text-green-600" : "text-rose-600"}`}>
                              {isCredit ? "+" : "-"}{formatNaira(txn.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "fund" && (
              <FundTab userEmail={userEmail} userName={userName} onSuccess={handleFundSuccess} />
            )}
            {activeTab === "transfer" && (
              <TransferTab balance={balance} onTransfer={transferToUser} />
            )}
            {activeTab === "withdraw" && (
              <WithdrawTab balance={balance} onWithdraw={requestWithdrawal} />
            )}
            {activeTab === "history" && (
              <HistoryTab transactions={transactions} loading={loadingTransactions} onRefresh={fetchTransactions} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Customer Support */}
        <a
          href={`https://wa.me/${supportNumber.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-3 p-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800">Customer Support</p>
            <p className="text-xs text-gray-500">Chat with us on WhatsApp</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-[#25D366]">{supportNumber}</p>
          </div>
        </a>
      </div>
    </div>
  );
}
