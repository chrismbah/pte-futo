import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TELEGRAM_LINK = "https://t.me/Udemy_Free_Courses4";

const COURSES = [
  {
    title: "Complete Anatomy & Physiology",
    category: "Basic Sciences",
    rating: 4.8,
    students: "12,400",
    accent: "#38bdf8",
    icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
  },
  {
    title: "USMLE Step 1 Prep — High Yield",
    category: "Exams",
    rating: 4.9,
    students: "28,600",
    accent: "#a78bfa",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
  },
  {
    title: "Clinical Pharmacology Made Easy",
    category: "Pharmacology",
    rating: 4.7,
    students: "9,800",
    accent: "#34d399",
    icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  },
  {
    title: "Medical Research & Statistics",
    category: "Research",
    rating: 4.6,
    students: "5,200",
    accent: "#fb923c",
    icon: "M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z",
  },
  {
    title: "Clinical Communication Skills",
    category: "Professional",
    rating: 4.8,
    students: "14,300",
    accent: "#f472b6",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
  {
    title: "Python for Medical Data Science",
    category: "Tech",
    rating: 4.7,
    students: "7,100",
    accent: "#60a5fa",
    icon: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
  },
];

export default function UdemyPage() {
  const navigate = useNavigate();

  const openTelegram = () => {
    window.open(TELEGRAM_LINK, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen pb-20 pt-20" style={{ background: "linear-gradient(135deg, #0d0d14 0%, #12101e 50%, #0a1218 100%)" }}>
      <div className="max-w-2xl mx-auto px-4">

        {/* Back */}
        <button
          onClick={() => navigate("/u/premium/dashboard")}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.3)" }}>
              <svg className="w-6 h-6" fill="none" stroke="#f472b6" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.89L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Free Udemy Courses</h1>
              <p className="text-xs text-gray-400 mt-0.5">Premium members get access to free Udemy courses via our Telegram group</p>
            </div>
          </div>

          {/* Telegram CTA card */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(38,166,209,0.07)", border: "1px solid rgba(38,166,209,0.25)" }}>
            <div className="flex items-center gap-2 mb-3">
              {/* Telegram icon */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#26a8d1">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 13.794l-2.968-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.896.765z" />
              </svg>
              <h2 className="text-sm font-bold text-[#26a8d1]">Join Our Telegram Group</h2>
            </div>

            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              All free Udemy courses are shared directly in our Telegram group. Join to browse and enrol in hundreds of free courses updated regularly — medical, tech, and professional development.
            </p>

            <button
              onClick={openTelegram}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-98 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #26a8d1, #1a85a8)", color: "#fff", boxShadow: "0 4px 20px rgba(38,168,209,0.3)" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 13.794l-2.968-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.896.765z" />
              </svg>
              Open Telegram Group
            </button>
          </div>

          {/* How it works */}
          <div className="rounded-xl px-4 py-4 mb-8 space-y-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-bold text-white mb-1">How it works</p>
            {[
              "Tap the button above to open the Telegram group",
              "Browse free Udemy course links shared in the group",
              "Click any course link to enrol for free on Udemy",
              "New free courses are added regularly — stay active",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xss font-bold"
                  style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6" }}>
                  {i + 1}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          {/* Recommended course categories */}
          <h2 className="text-base font-bold text-white mb-4">Courses Available in the Group</h2>
          <div className="space-y-3">
            {COURSES.map((c, i) => (
              <motion.div key={c.title}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.35 }}
                className="flex items-center gap-4 rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${c.accent}18`, border: `1px solid ${c.accent}30` }}>
                  <svg className="w-4 h-4" fill="none" stroke={c.accent} viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xss px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${c.accent}18`, color: c.accent }}>
                      {c.category}
                    </span>
                    <span className="text-xss text-gray-500">⭐ {c.rating} · {c.students} students</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
