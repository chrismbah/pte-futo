/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import { useWallet } from "../../../hooks/wallet/useWallet";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import { db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ID_CARD_PRICE = 2500;

export default function IDCardPayment() {
  const navigate = useNavigate();
  const { studentDetails, userID, loading: authLoading } = useGetUserInfo();
  const userEmail = studentDetails?.email || "";
  const userName = `${studentDetails?.firstName || ""} ${studentDetails?.lastName || ""}`.trim();

  const { wallet, payWithWallet, loadingWallet } = useWallet(userID, userEmail);
  const balance = wallet?.balance ?? 0;

  const [paying, setPaying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);

  const recordPayment = async (reference: string) => {
    // Log transaction
    await addDoc(collection(db, "transactions"), {
      userID,
      userEmail,
      type: "payment",
      amount: ID_CARD_PRICE,
      description: "EBSUMSA ID Card Registration Fee",
      reference,
      status: "success",
      createdAt: serverTimestamp(),
    });

    // Log ID card payment record
    await addDoc(collection(db, "idCardPayments"), {
      userID,
      userEmail,
      userName,
      amount: ID_CARD_PRICE,
      reference,
      method: "wallet",
      status: "success",
      createdAt: serverTimestamp(),
    });
  };

  const handleWalletPay = async () => {
    if (!userID || !userEmail) {
      notifyUser("error", "Please log in to continue.");
      return;
    }

    if (balance < ID_CARD_PRICE) {
      notifyUser("error", "Insufficient wallet balance. Please fund your wallet first.");
      return;
    }

    setPaying(true);
    try {
      await payWithWallet(ID_CARD_PRICE, "EBSUMSA ID Card Registration Fee");
      const reference = `ebsu_idcard_wallet_${Date.now()}`;
      await recordPayment(reference);
      notifyUser("success", "Payment successful! Redirecting to registration form...");
      setTimeout(() => {
        navigate("/u/id-card", {
          state: { paymentVerified: true, payerName: userName, reference, amount: ID_CARD_PRICE },
        });
      }, 1200);
    } catch (error: any) {
      console.error("Wallet payment error:", error);
      notifyUser("error", error?.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
      setShowConfirm(false);
    }
  };

  const insufficientBalance = balance < ID_CARD_PRICE;

  if (authLoading || loadingWallet) {
    return (
      <div className="bg-gray-50 min-h-screen pt-[80px] ss:pt-[90px] sm:pt-[105px] pb-10 flex items-center justify-center">
        <Spinner className="w-8 h-8 text-[#b45309]" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-[80px] ss:pt-[90px] sm:pt-[105px] pb-10">
      <div className="max-w-xl mx-auto px-4">
        <motion.div
          variants={fadeInVariants5}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          custom={1}
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#fcd34d]/30 mb-4">
              <svg
                className="w-7 h-7 text-[#b45309]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-balance">
              ID Card Registration Payment
            </h1>
            <p className="text-sm text-gray-500 mt-1 text-pretty">
              Pay securely using your EBSUMSA wallet to proceed with your ID card registration.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#b45309] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <span className="text-sm font-medium text-gray-700">Make Payment</span>
            </div>
            <div className="flex-1 h-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <span className="text-sm text-gray-400">Submit Registration</span>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            {/* Amount banner */}
            <div className="bg-[#b45309] px-6 py-5 text-white">
              <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">
                Amount to Pay
              </p>
              <p className="text-3xl font-bold">
                {fmt(ID_CARD_PRICE)}
              </p>
              <p className="text-xs opacity-75 mt-1">EBSUMSA ID Card Registration Fee</p>
            </div>

            {/* Wallet Payment Section */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-800">Pay with Wallet</p>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{fmt(balance)}</span>
                </div>
              </div>

              {/* Wallet balance warning */}
              {insufficientBalance && (
                <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">Insufficient Balance</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      You need {fmt(ID_CARD_PRICE - balance)} more. Please fund your wallet.
                    </p>
                    <button
                      onClick={() => navigate("/u/wallet")}
                      className="mt-2 text-xs font-medium text-red-700 underline underline-offset-2 hover:text-red-900"
                    >
                      Fund Wallet
                    </button>
                  </div>
                </div>
              )}

              {/* Wallet balance sufficient */}
              {!insufficientBalance && (
                <div className="flex gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">Wallet Ready</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Balance after payment: {fmt(balance - ID_CARD_PRICE)}
                    </p>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={() => setShowConfirm(true)}
                disabled={paying || insufficientBalance || !userID}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <Spinner className="w-5 h-5 text-transparent animate-spin fill-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay {fmt(ID_CARD_PRICE)} from Wallet
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-green-800">Need help with payment?</p>
              <p className="text-xs text-green-700 mt-0.5">
                Contact the ID card officer:{" "}
                <a
                  href="tel:07025336321"
                  className="font-bold underline underline-offset-2"
                >
                  07025336321
                </a>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400">
            After payment, you will be redirected to complete your ID card registration.
          </p>
        </motion.div>
      </div>

      {/* Wallet Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
          >
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Payment</h3>
              <p className="text-sm text-gray-500">
                You are about to pay <span className="font-semibold text-gray-900">{fmt(ID_CARD_PRICE)}</span> from your wallet for ID Card registration.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Current Balance</span>
                <span className="font-medium text-gray-900">{fmt(balance)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Payment Amount</span>
                <span className="font-medium text-red-600">-{fmt(ID_CARD_PRICE)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Balance After</span>
                  <span className="font-bold text-gray-900">{fmt(balance - ID_CARD_PRICE)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={paying}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWalletPay}
                disabled={paying}
                className="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <Spinner className="w-4 h-4 text-transparent animate-spin fill-white" />
                    <span>Paying...</span>
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
