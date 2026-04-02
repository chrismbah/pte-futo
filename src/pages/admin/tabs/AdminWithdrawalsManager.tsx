/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";

interface WithdrawalRequest {
  id: string;
  userID: string;
  userEmail: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "pending" | "processed" | "rejected";
  createdAt: any;
  processedAt?: any;
  adminNote?: string;
}

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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  processed: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminWithdrawalsManager() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "processed" | "rejected">("all");
  const [noteModal, setNoteModal] = useState<{ show: boolean; id: string; type: "process" | "reject" }>({ show: false, id: "", type: "process" });
  const [adminNote, setAdminNote] = useState("");
  const [supportPhone, setSupportPhone] = useState("07082039250");
  const [phoneInput, setPhoneInput] = useState("07082039250");
  const [savingPhone, setSavingPhone] = useState(false);

  // Load support number from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "walletSupport"), (snap) => {
      if (snap.exists()) {
        const phone = snap.data().phone || "07082039250";
        setSupportPhone(phone);
        setPhoneInput(phone);
      }
    });
    return () => unsub();
  }, []);

  const handleSavePhone = async () => {
    if (!phoneInput.trim()) return;
    setSavingPhone(true);
    try {
      await setDoc(doc(db, "settings", "walletSupport"), { phone: phoneInput.trim() });
      notifyUser("success", "Support number updated");
    } catch (err) {
      console.error("[AdminWithdrawals] save phone error:", err);
      notifyUser("error", "Failed to update number");
    } finally {
      setSavingPhone(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "withdrawalRequests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WithdrawalRequest, "id">) })));
      setLoading(false);
    }, (err) => {
      console.error("[AdminWithdrawals] snapshot error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openNoteModal = (id: string, type: "process" | "reject") => {
    setAdminNote("");
    setNoteModal({ show: true, id, type });
  };

  const handleProcess = async () => {
    const { id, type } = noteModal;
    setProcessingId(id);
    setNoteModal({ show: false, id: "", type: "process" });
    try {
      const reqRef = doc(db, "withdrawalRequests", id);
      const reqSnap = await getDoc(reqRef);
      if (!reqSnap.exists()) throw new Error("Request not found");
      const data = reqSnap.data() as WithdrawalRequest;

      if (type === "process") {
        // Mark as processed — balance was already deducted when user submitted
        await updateDoc(reqRef, {
          status: "processed",
          processedAt: serverTimestamp(),
          adminNote: adminNote || "Processed by admin",
        });
        // Update the transaction record status
        notifyUser("success", `₦${data.amount.toLocaleString()} withdrawal marked as processed`);
      } else {
        // Reject — refund the balance back to user
        const walletRef = doc(db, "wallets", data.userID);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
          await updateDoc(walletRef, {
            balance: walletSnap.data().balance + data.amount,
            updatedAt: serverTimestamp(),
          });
        }
        await updateDoc(reqRef, {
          status: "rejected",
          processedAt: serverTimestamp(),
          adminNote: adminNote || "Rejected by admin",
        });
        // Log refund transaction
        await addDoc(collection(db, "transactions"), {
          userID: data.userID,
          userEmail: data.userEmail,
          type: "fund",
          amount: data.amount,
          description: `Withdrawal rejected — refunded to wallet. Note: ${adminNote || "Rejected by admin"}`,
          status: "success",
          createdAt: serverTimestamp(),
        });
        notifyUser("success", `Withdrawal rejected and ₦${data.amount.toLocaleString()} refunded to user`);
      }
    } catch (err: any) {
      notifyUser("error", err.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    processed: requests.filter((r) => r.status === "processed").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div>
      {/* Customer Support Number Editor */}
      <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Wallet Customer Support Number</p>
            <p className="text-xs text-gray-500">This WhatsApp number is shown at the bottom of every user's wallet page.</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="e.g. 07082039250"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-colors"
          />
          <button
            onClick={handleSavePhone}
            disabled={savingPhone || phoneInput.trim() === supportPhone}
            className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
          >
            {savingPhone ? (
              <Spinner className="w-4 h-4 text-white" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            Save
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["all", "pending", "processed", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-xl p-4 border text-left transition-all ${
              filter === s ? "ring-2 ring-[#00875a] border-[#00875a]" : "border-gray-200 bg-white hover:border-[#00875a]/40"
            }`}
          >
            <p className={`text-xs font-semibold capitalize mb-1 ${
              s === "pending" ? "text-amber-600" :
              s === "processed" ? "text-green-600" :
              s === "rejected" ? "text-red-600" : "text-gray-600"
            }`}>{s}</p>
            <p className="text-2xl font-bold text-gray-900">{counts[s]}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="w-7 h-7 text-[#00875a]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm font-medium">No {filter === "all" ? "" : filter} withdrawal requests</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req) => (
            <motion.div
              key={req.id}
              variants={fadeInVariants5}
              initial="initial"
              animate="animate"
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{req.userEmail}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Submitted: {formatDate(req.createdAt)}</p>
                  {req.processedAt && (
                    <p className="text-xs text-gray-400">Processed: {formatDate(req.processedAt)}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-lg font-bold text-gray-900">{formatNaira(req.amount)}</span>
                  <span className={`text-xss px-2 py-0.5 rounded-full font-semibold border capitalize ${STATUS_COLORS[req.status]}`}>
                    {req.status}
                  </span>
                </div>
              </div>

              {/* Bank details — clearly shown for admin to act on */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                <p className="text-xss font-bold text-amber-700 uppercase tracking-wide mb-2">Transfer funds to this account before marking processed</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <p className="text-xss text-gray-400 font-semibold uppercase tracking-wide">Bank</p>
                    <p className="text-sm font-semibold text-gray-800">{req.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xss text-gray-400 font-semibold uppercase tracking-wide">Account Number</p>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold text-gray-900">{req.accountNumber}</p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(req.accountNumber); notifyUser("success", "Account number copied"); }}
                        className="text-[#00875a] hover:text-[#006d49] p-0.5"
                        title="Copy account number"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xss text-gray-400 font-semibold uppercase tracking-wide">Account Name</p>
                    <p className="text-sm font-semibold text-gray-800">{req.accountName}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-amber-200 flex items-center gap-2">
                  <p className="text-xs font-bold text-amber-800">Amount to send:</p>
                  <p className="text-sm font-bold text-[#00875a]">{formatNaira(req.amount)}</p>
                </div>
              </div>

              {req.adminNote && (
                <p className="text-xs text-gray-500 italic mb-3 bg-gray-50 rounded-lg px-3 py-2">Note: {req.adminNote}</p>
              )}

              {req.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openNoteModal(req.id, "process")}
                    disabled={processingId === req.id}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#00875a] hover:bg-[#006d49] disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                  >
                    {processingId === req.id ? <Spinner className="w-3.5 h-3.5 text-white" /> : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Mark as Processed
                  </button>
                  <button
                    onClick={() => openNoteModal(req.id, "reject")}
                    disabled={processingId === req.id}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject & Refund
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Note modal */}
      {noteModal.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
          >
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {noteModal.type === "process" ? "Mark as Processed" : "Reject & Refund"}
            </h3>
            {noteModal.type === "process" ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
                <p className="text-xs font-bold text-amber-800 mb-0.5">Have you already sent the money?</p>
                <p className="text-xs text-amber-700">Only click "Confirm Processed" AFTER you have physically transferred the funds to the user's bank account. This action cannot be undone.</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">The amount will be refunded back to the user's wallet immediately.</p>
            )}
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add an optional note for the user..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setNoteModal({ show: false, id: "", type: "process" })}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
                  noteModal.type === "process" ? "bg-[#00875a] hover:bg-[#006d49]" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {noteModal.type === "process" ? "Confirm Processed" : "Confirm Reject"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
