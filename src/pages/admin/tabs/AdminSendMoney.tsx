/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "../../../config/firebase";
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import { motion, AnimatePresence } from "framer-motion";

interface Bank { id: number; name: string; code: string; }
interface TransferLog {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  amount: number;
  narration: string;
  transferCode: string;
  reference: string;
  status: string;
  createdAt: any;
}

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(n);

const formatDate = (ts: any) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminSendMoney() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [banksError, setBanksError] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankSearch, setBankSearch] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [logs, setLogs] = useState<TransferLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingTransferCode, setPendingTransferCode] = useState("");
  const [pendingLogData, setPendingLogData] = useState<Omit<TransferLog, "id"> | null>(null);
  const [finalizingSend, setFinalizingSend] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(e.target as Node)) {
        setShowBankList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch banks on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/paystack-banks");
        const data = await res.json();
        if (data.banks) {
          setBanks(data.banks);
        } else {
          const msg = data.error || "Failed to load banks";
          setBanksError(msg);
          notifyUser("error", msg);
        }
      } catch (err) {
        const msg = "Failed to reach Paystack API. Ensure PAYSTACK_SECRET_KEY is set in your project Vars.";
        setBanksError(msg);
        notifyUser("error", msg);
      } finally {
        setLoadingBanks(false);
      }
    })();
  }, []);

  // Fetch transfer logs
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "adminTransfers"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as TransferLog)));
      } catch (err) {
        console.error("[AdminSendMoney] fetch logs error:", err);
      } finally {
        setLoadingLogs(false);
      }
    })();
  }, []);

  // Auto-resolve account name when account number is 10 digits and bank is selected
  const resolveAccount = useCallback(async (accNum: string, bankCode: string) => {
    if (accNum.length !== 10 || !bankCode) return;
    setResolvingAccount(true);
    setAccountName("");
    try {
      const url = `/api/paystack-resolve-account?account_number=${accNum}&bank_code=${bankCode}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.account_name) {
        setAccountName(data.account_name);
      } else {
        notifyUser("error", data.error || "Could not resolve account name");
      }
    } catch (err) {
      notifyUser("error", "Account resolution failed");
    } finally {
      setResolvingAccount(false);
    }
  }, []);

  const handleAccountNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(clean);
    setAccountName("");
    if (clean.length === 10 && selectedBank) resolveAccount(clean, selectedBank.code);
  };

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setBankSearch(bank.name);
    setShowBankList(false);
    setAccountName("");
    if (accountNumber.length === 10) resolveAccount(accountNumber, bank.code);
  };

  const isFormValid = selectedBank && accountNumber.length === 10 && accountName && parseFloat(amount) > 0;

  const handleSend = async () => {
    if (!isFormValid) return;
    setSending(true);
    setShowConfirm(false);
    try {
      const res = await fetch("/api/paystack-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_number: accountNumber,
          bank_code: selectedBank!.code,
          account_name: accountName,
          amount: parseFloat(amount),
          narration: narration || "EBSUMSA Admin Transfer",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        notifyUser("error", data.error || "Transfer failed");
        setSending(false);
        return;
      }
      // If OTP is required
      if (data.status === "otp") {
        setPendingTransferCode(data.transfer_code);
        setPendingLogData({
          accountName,
          accountNumber,
          bankName: selectedBank!.name,
          amount: parseFloat(amount),
          narration: narration || "EBSUMSA Admin Transfer",
          transferCode: data.transfer_code,
          reference: data.reference,
          status: "otp",
          createdAt: new Date(),
        });
        setOtpRequired(true);
        setSending(false);
        notifyUser("info", "OTP sent to your registered phone number. Please enter it to complete the transfer.");
        return;
      }
      // Transfer successful (no OTP required)
      const logEntry = {
        accountName,
        accountNumber,
        bankName: selectedBank!.name,
        amount: parseFloat(amount),
        narration: narration || "EBSUMSA Admin Transfer",
        transferCode: data.transfer_code,
        reference: data.reference,
        status: data.status,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "adminTransfers"), logEntry);
      setLogs(prev => [{ id: docRef.id, ...logEntry, createdAt: new Date() }, ...prev]);
      notifyUser("success", `Transfer of ${formatNaira(parseFloat(amount))} to ${accountName} initiated!`);
      // Reset form
      setSelectedBank(null);
      setBankSearch("");
      setAccountNumber("");
      setAccountName("");
      setAmount("");
      setNarration("");
    } catch (err) {
      console.error("[AdminSendMoney] transfer error:", err);
      notifyUser("error", "Transfer failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp || otp.length < 4) {
      notifyUser("error", "Please enter a valid OTP");
      return;
    }
    setFinalizingSend(true);
    try {
      const res = await fetch("/api/paystack-finalize-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transfer_code: pendingTransferCode, otp }),
      });
      const data = await res.json();
      if (!data.success) {
        notifyUser("error", data.error || "OTP verification failed");
        setFinalizingSend(false);
        return;
      }
      // Save to Firestore
      if (pendingLogData) {
        const finalLogEntry = { ...pendingLogData, status: data.status, createdAt: serverTimestamp() };
        const docRef = await addDoc(collection(db, "adminTransfers"), finalLogEntry);
        setLogs(prev => [{ id: docRef.id, ...finalLogEntry, createdAt: new Date() }, ...prev]);
      }
      notifyUser("success", "Transfer completed successfully!");
      // Reset everything
      setOtpRequired(false);
      setOtp("");
      setPendingTransferCode("");
      setPendingLogData(null);
      setSelectedBank(null);
      setBankSearch("");
      setAccountNumber("");
      setAccountName("");
      setAmount("");
      setNarration("");
    } catch (err) {
      console.error("[AdminSendMoney] OTP finalize error:", err);
      notifyUser("error", "OTP verification failed. Please try again.");
    } finally {
      setFinalizingSend(false);
    }
  };

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));

  const statusColor: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
    otp: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-indigo-900">Send Money via Paystack</p>
          <p className="text-xs text-indigo-600">Transfers are sent directly from your Paystack balance to any Nigerian bank account.</p>
        </div>
      </div>

      {/* Config error banner */}
      {banksError && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-red-800">Paystack Not Configured</p>
            <p className="text-xs text-red-700 mt-0.5 leading-5">
              <span className="font-semibold">PAYSTACK_SECRET_KEY</span> is missing. To fix this:
            </p>
            <ol className="text-xs text-red-700 mt-1.5 leading-6 list-decimal list-inside space-y-0.5">
              <li>Open <span className="font-semibold">Project Settings</span> (top-right gear icon)</li>
              <li>Go to the <span className="font-semibold">Vars</span> tab</li>
              <li>Add <span className="font-mono font-semibold bg-red-100 px-1 rounded">PAYSTACK_SECRET_KEY</span> with your secret key from the Paystack dashboard</li>
              <li>Redeploy or refresh the page</li>
            </ol>
          </div>
        </div>
      )}

      {/* Transfer Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">New Transfer</h3>

        <div className="flex flex-col gap-4">
          {/* Bank Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bank</label>
            <div className="relative" ref={bankDropdownRef}>
              <input
                type="text"
                value={bankSearch}
                onChange={e => { setBankSearch(e.target.value); setShowBankList(true); }}
                onClick={() => setShowBankList(true)}
                placeholder={loadingBanks ? "Loading banks..." : "Type to search banks..."}
                disabled={loadingBanks}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
              />
              {loadingBanks && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner className="w-4 h-4 text-indigo-500" />
                </div>
              )}
              {showBankList && filteredBanks.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredBanks.map(bank => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => handleBankSelect(bank)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Account Number</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={e => handleAccountNumberChange(e.target.value)}
                placeholder="10-digit account number"
                maxLength={10}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
              />
              {resolvingAccount && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner className="w-4 h-4 text-indigo-500" />
                </div>
              )}
            </div>
            {accountName && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {accountName}
              </motion.div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount (NGN)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">₦</span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
              />
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Narration <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={narration}
              onChange={e => setNarration(e.target.value)}
              placeholder="e.g. Welfare payment, Dues refund..."
              maxLength={100}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!isFormValid || sending}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {sending ? <Spinner className="w-4 h-4 text-white" /> : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Money
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transfer History */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Transfer History</h3>
        {loadingLogs ? (
          <div className="flex justify-center py-6"><Spinner className="w-5 h-5 text-indigo-500" /></div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm bg-white border border-gray-100 rounded-2xl">No transfers yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {logs.map(log => (
              <div key={log.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-900 truncate">{log.accountName}</p>
                    <p className="text-sm font-bold text-indigo-700 flex-shrink-0">{formatNaira(log.amount)}</p>
                  </div>
                  <p className="text-xs text-gray-500">{log.bankName} &bull; {log.accountNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{log.narration}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xss font-semibold px-2 py-0.5 rounded-full ${statusColor[log.status] || "bg-gray-100 text-gray-600"}`}>
                      {log.status}
                    </span>
                    <span className="text-xss text-gray-400">{formatDate(log.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Confirm Transfer</p>
                  <p className="text-xs text-gray-500">This will debit your Paystack balance.</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-4 flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">To:</span><span className="font-semibold text-gray-800">{accountName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Bank:</span><span className="font-semibold text-gray-800">{selectedBank?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Account:</span><span className="font-semibold text-gray-800">{accountNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Amount:</span><span className="font-bold text-indigo-700">{formatNaira(parseFloat(amount || "0"))}</span></div>
                {narration && <div className="flex justify-between"><span className="text-gray-500">Note:</span><span className="text-gray-700 truncate max-w-[60%] text-right">{narration}</span></div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleSend} disabled={sending} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  {sending ? <Spinner className="w-4 h-4 text-white" /> : "Confirm & Send"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* OTP Modal */}
      <AnimatePresence>
        {otpRequired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">OTP Required</p>
                  <p className="text-xs text-gray-500">Paystack sent an OTP to your registered phone number.</p>
                </div>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter OTP"
                maxLength={6}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors mb-4 text-center tracking-widest text-lg font-bold"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setOtpRequired(false); setOtp(""); setPendingTransferCode(""); setPendingLogData(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOtpSubmit}
                  disabled={finalizingSend || otp.length < 4}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {finalizingSend ? <Spinner className="w-4 h-4 text-white" /> : "Verify & Send"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
