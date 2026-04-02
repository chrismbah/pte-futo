import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../config/supabase";
import Footer from "../../components/footer/Footer";

// ─── Payment account details ──────────────────────────────────────────────────
const ACCOUNT = {
  accountNumber: "8022854664",
  bankName: "Palmpay",
  accountName: "Eze Happiness Ajah",
};

// ─── Predefined payment purposes ─────────────────────────────────────────────
const PURPOSES = [
  "EBSUMSA Dues",
  "ID Card Fee",
  "Event Ticket",
  "Welfare Levy",
  "Departmental Fine",
  "Exam Clearance Fee",
  "Project Supervision Fee",
  "Association Form",
  "Other",
];

// ─── Steps ────────────────────────────────────────────────────────────────────
type Step = "form" | "bank" | "confirm" | "success";

interface FormData {
  fullName: string;
  matricNo: string;
  email: string;
  phone: string;
  purpose: string;
  customPurpose: string;
  amount: string;
  note: string;
}

// ─── Copy button helper ───────────────────────────────────────────────────────
function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green1">Copied</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ─── Detail row ───────────────────────────────────────────────────────────────
function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${highlight ? "bg-green1/5" : ""}`}>
      <div>
        <p className="text-xss font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        <p className={`font-bold ${highlight ? "text-green1 text-lg tracking-widest" : "text-gray-900 text-sm"}`}>
          {value}
        </p>
      </div>
      <CopyBtn value={value} />
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "form", label: "Details" },
    { id: "bank", label: "Pay" },
    { id: "confirm", label: "Confirm" },
    { id: "success", label: "Done" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.id} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? "bg-green1 text-white" : active ? "bg-green1 text-white ring-4 ring-green1/20" : "bg-gray-100 text-gray-400"
              }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xss font-medium ${active ? "text-green1" : done ? "text-green1" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 rounded-full ${i < currentIdx ? "bg-green1" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PaymentPortal() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>({
    fullName: "",
    matricNo: "",
    email: "",
    phone: "",
    purpose: "",
    customPurpose: "",
    amount: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const update = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.purpose) newErrors.purpose = "Please select a payment purpose";
    if (form.purpose === "Other" && !form.customPurpose.trim())
      newErrors.customPurpose = "Please describe the payment purpose";
    if (!form.amount.trim() || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      newErrors.amount = "Please enter a valid amount";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let receiptUrl: string | null = null;

      // Upload receipt to Supabase storage if provided
      if (receiptFile) {
        const ext = receiptFile.name.split(".").pop();
        const filePath = `receipts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("payment-receipts")
          .upload(filePath, receiptFile, { upsert: false });
        if (!uploadErr && uploadData) {
          const { data: urlData } = supabase.storage
            .from("payment-receipts")
            .getPublicUrl(filePath);
          receiptUrl = urlData?.publicUrl ?? null;
        }
      }

      const { data, error } = await supabase
        .from("payments")
        .insert({
          full_name: form.fullName.trim(),
          matric_no: form.matricNo.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          purpose: form.purpose === "Other" ? form.customPurpose.trim() : form.purpose,
          custom_purpose: form.purpose === "Other" ? form.customPurpose.trim() : null,
          amount: parseFloat(form.amount),
          payment_method: "bank_transfer",
          receipt_url: receiptUrl,
          note: form.note.trim() || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;
      setPaymentId(data?.id ?? null);
      setStep("success");
    } catch (e) {
      console.error("[v0] Payment submit error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const purposeLabel = form.purpose === "Other" ? form.customPurpose || "Other" : form.purpose;
  const amountFormatted = form.amount
    ? `₦${Number(form.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-green3 pt-24 pb-10 px-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-balance">
          EBSUMSA Payment Portal
        </h1>
        <p className="text-green-200 text-sm mt-2 max-w-md mx-auto text-pretty">
          Pay for dues, events, fees, and more — securely and conveniently via bank transfer.
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            {/* ── STEP 1: Form ── */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Payment Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Fill in your information and what you are paying for.</p>
                </div>

                {/* Full name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="e.g. Chisom Ronkwo"
                    className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green1/30 focus:border-green1 transition-colors ${errors.fullName ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Matric number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Matric Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.matricNo}
                    onChange={(e) => update("matricNo", e.target.value)}
                    placeholder="e.g. 2022/1311123"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green1/30 focus:border-green1 transition-colors"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@email.com"
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green1/30 focus:border-green1 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="08012345678"
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green1/30 focus:border-green1 transition-colors"
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Payment Purpose <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PURPOSES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => update("purpose", p)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all text-center ${
                          form.purpose === p
                            ? "border-green1 bg-green1/10 text-green1"
                            : "border-gray-100 bg-gray-50 text-gray-600 hover:border-green1/40"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  {errors.purpose && <p className="text-xs text-red-500 mt-1">{errors.purpose}</p>}
                </div>

                {/* Custom purpose if "Other" selected */}
                {form.purpose === "Other" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Describe Purpose <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.customPurpose}
                      onChange={(e) => update("customPurpose", e.target.value)}
                      placeholder="e.g. Printing of departmental materials"
                      className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green1/30 focus:border-green1 transition-colors ${errors.customPurpose ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors.customPurpose && <p className="text-xs text-red-500 mt-1">{errors.customPurpose}</p>}
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Amount (₦) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₦</span>
                    <input
                      type="number"
                      min="0"
                      value={form.amount}
                      onChange={(e) => update("amount", e.target.value)}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green1/30 focus:border-green1 transition-colors ${errors.amount ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                    />
                  </div>
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Additional Note <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.note}
                    onChange={(e) => update("note", e.target.value)}
                    placeholder="Any extra information about this payment..."
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green1/30 focus:border-green1 transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={() => { if (validate()) setStep("bank"); }}
                  className="w-full bg-green1 hover:bg-green2 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Payment
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: Bank Details ── */}
            {step === "bank" && (
              <motion.div
                key="bank"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Make Transfer</h2>
                  <p className="text-sm text-gray-500 mt-1">Send {amountFormatted} to the account below, then proceed.</p>
                </div>

                {/* Amount banner */}
                <div className="bg-green3 rounded-2xl px-6 py-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Amount to Transfer</p>
                  <p className="text-4xl font-extrabold">{amountFormatted}</p>
                  <p className="text-green-200 text-xs mt-1.5">{purposeLabel}</p>
                </div>

                {/* Account details */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  <DetailRow label="Bank Name" value={ACCOUNT.bankName} />
                  <DetailRow label="Account Number" value={ACCOUNT.accountNumber} highlight />
                  <DetailRow label="Account Name" value={ACCOUNT.accountName} />
                </div>

                {/* Notice */}
                <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Use <strong>{form.fullName}</strong> as the transfer description or narration. After payment, click the button below.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("form")}
                    className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("confirm")}
                    className="flex-2 flex-1 bg-green1 hover:bg-green2 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    I Have Paid
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Upload Receipt & Confirm ── */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Upload Receipt</h2>
                  <p className="text-sm text-gray-500 mt-1">Attach your payment receipt as proof of transfer, then submit.</p>
                </div>

                {/* Summary card */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xss font-bold uppercase tracking-wider text-gray-400 mb-2">Payment Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Name</span>
                    <span className="font-semibold text-gray-900">{form.fullName}</span>
                  </div>
                  {form.matricNo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Matric No.</span>
                      <span className="font-semibold text-gray-900">{form.matricNo}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Purpose</span>
                    <span className="font-semibold text-gray-900">{purposeLabel}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-green1 text-base">{amountFormatted}</span>
                  </div>
                </div>

                {/* Receipt upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Receipt <span className="text-gray-400 font-normal">(optional but recommended)</span>
                  </label>
                  {receiptPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                      <img src={receiptPreview} alt="Receipt" className="w-full max-h-48 object-contain bg-gray-50" />
                      <button
                        onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-green1/40 hover:bg-green1/5 transition-all">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Click to upload receipt</p>
                        <p className="text-xss text-gray-400 mt-0.5">JPG, PNG, or PDF</p>
                      </div>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleReceiptChange} />
                    </label>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("bank")}
                    disabled={submitting}
                    className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-green1 hover:bg-green2 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Payment
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Success ── */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-center space-y-5 py-4"
              >
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 bg-green1/10 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Submitted!</h2>
                  <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto text-pretty">
                    Your payment record has been submitted. The EBSUMSA team will verify and confirm your payment shortly.
                  </p>
                </div>

                {paymentId && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xss font-semibold uppercase tracking-wider text-gray-400 mb-1">Reference ID</p>
                    <p className="font-mono text-xs text-gray-700 break-all">{paymentId}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Name</span>
                    <span className="font-semibold text-gray-900">{form.fullName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Purpose</span>
                    <span className="font-semibold text-gray-900">{purposeLabel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-green1">{amountFormatted}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStep("form");
                      setForm({ fullName: "", matricNo: "", email: "", phone: "", purpose: "", customPurpose: "", amount: "", note: "" });
                      setReceiptFile(null);
                      setReceiptPreview(null);
                      setPaymentId(null);
                    }}
                    className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-semibold text-sm transition-colors"
                  >
                    New Payment
                  </button>
                  <a
                    href="/"
                    className="flex-1 bg-green1 hover:bg-green2 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center"
                  >
                    Go Home
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contact */}
        <div className="mt-4 flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4">
          <div className="w-9 h-9 rounded-full bg-green1/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Questions about your payment?</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Contact the financial officer:{" "}
              <a href="tel:07025336321" className="text-green1 font-bold hover:underline">07025336321</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
