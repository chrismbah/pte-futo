import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PORTAL_URL = "https://portal.ebsu.edu.ng";

export default function SchoolFeesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    toast(
      (t) => (
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-gray-900 text-sm">School Fee Remita — Network Issues</p>
          <p className="text-xs text-gray-600">
            Remita is currently experiencing network issues for fee payment.
            Please visit the EBSU portal directly.
          </p>
          <a
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => toast.dismiss(t.id)}
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 underline underline-offset-2"
          >
            Go to portal.ebsu.edu.ng
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      ),
      {
        duration: 10000,
        icon: "⚠️",
        style: { maxWidth: "360px" },
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Top banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-white font-bold text-sm">Service Notice</p>
        </div>

        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">Remita Network Issues</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            School fee payment via Remita is currently experiencing network issues.
            Please visit the EBSU student portal directly to complete your payment.
          </p>

          {/* Portal link button */}
          <a
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm py-3.5 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit portal.ebsu.edu.ng
          </a>

          <button
            onClick={() => navigate(-1)}
            className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
