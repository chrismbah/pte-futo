import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import emailjs from "@emailjs/browser";

interface Subscriber {
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  regNo: string;
  level: string;
  timeStamp: any;
}

export default function AdminNewsletterTab() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "service_2avshb4";
  const templateId = import.meta.env.VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID || "template_wpwl9lf";
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || "fpJNbTUq8_NZhbKw1";
  const isConfigured = !!(serviceId && templateId && publicKey);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "suscribedUsers"), orderBy("timeStamp", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ userID: d.id, ...d.data() })) as Subscriber[];
      setSubscribers(list);
    } catch {
      notifyUser("error", "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  const sendNewsletter = async () => {
    if (!subject.trim() || !message.trim()) {
      notifyUser("error", "Please fill in both subject and message");
      return;
    }
    if (subscribers.length === 0) {
      notifyUser("error", "No subscribers to send to");
      return;
    }
    if (!isConfigured) {
      notifyUser("error", "EmailJS is not configured. Add the environment variables in Project Settings → Vars.");
      return;
    }

    setSending(true);
    setSentCount(0);
    setProgress(0);

    let sent = 0;
    const errors: string[] = [];

    for (let i = 0; i < subscribers.length; i++) {
      const sub = subscribers[i];
      try {
        await emailjs.send(
          serviceId,
          templateId,
          {
            to_name: `${sub.firstName} ${sub.lastName}`,
            to_email: sub.email,
            subject: subject.trim(),
            message: message.trim(),
          },
          publicKey
        );
        sent++;
        setSentCount(sent);
        setProgress(Math.round(((i + 1) / subscribers.length) * 100));
        // Small delay to avoid hitting EmailJS rate limits
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        errors.push(sub.email);
      }
    }

    setSending(false);

    if (errors.length === 0) {
      notifyUser("success", `Newsletter sent to all ${sent} subscriber${sent !== 1 ? "s" : ""}!`);
      setSubject("");
      setMessage("");
      setSentCount(0);
      setProgress(0);
    } else {
      notifyUser(
        "info",
        `Sent to ${sent} subscriber${sent !== 1 ? "s" : ""}. Failed for ${errors.length}.`
      );
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "—";
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">

      {/* EmailJS config warning */}
      {!isConfigured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">EmailJS Not Configured</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-5">
              The following environment variables are missing. Add them in <span className="font-semibold">Project Settings → Vars</span> then redeploy:
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {[
                { key: "VITE_EMAILJS_SERVICE_ID", val: serviceId },
                { key: "VITE_EMAILJS_PUBLIC_KEY", val: publicKey },
                { key: "VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID", val: templateId },
              ].map(({ key, val }) => (
                <li key={key} className="flex items-center gap-2 text-xs text-amber-700">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${val ? "bg-green-500" : "bg-red-400"}`} />
                  <span className="font-mono font-semibold bg-amber-100 px-1 rounded">{key}</span>
                  <span>{val ? "OK" : "Missing"}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-600 mt-2">
              Get these values from your <a href="https://dashboard.emailjs.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">EmailJS dashboard</a>.
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Subscribers</p>
          <p className="text-3xl font-bold text-gray-900">{loading ? "—" : subscribers.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Latest Subscriber</p>
          <p className="text-sm font-semibold text-gray-700 truncate">
            {loading || subscribers.length === 0
              ? "—"
              : `${subscribers[0].firstName} ${subscribers[0].lastName}`}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email Service</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isConfigured ? "bg-green-500" : "bg-red-400"}`} />
            <p className="text-sm font-semibold text-gray-700">
              {isConfigured ? "EmailJS Connected" : "Not Configured"}
            </p>
          </div>
        </div>
      </div>

      {/* Compose newsletter */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-base font-bold text-gray-900 mb-1">Compose Weekly Newsletter</h3>
        <p className="text-xs text-gray-500 mb-5">
          This will send an email to all <strong>{subscribers.length}</strong> subscriber{subscribers.length !== 1 ? "s" : ""}.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. EBSUMSA Weekly Update — March 2026"
              disabled={sending}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Message Body</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your weekly update here. Include blog highlights, event reminders, important announcements..."
              disabled={sending}
              rows={8}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors resize-none disabled:opacity-50"
            />
            <p className="text-xss text-gray-400 mt-1">{message.length} characters</p>
          </div>

          {/* Progress bar */}
          {sending && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Sending to subscribers...</span>
                <span>{sentCount} / {subscribers.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={sendNewsletter}
            disabled={sending || loading || !subject.trim() || !message.trim() || !isConfigured}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <>
                <Spinner className="w-4 h-4 fill-white" />
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send to {subscribers.length} Subscriber{subscribers.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subscriber list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Subscriber List</h3>
          <button
            onClick={fetchSubscribers}
            className="text-xs font-semibold text-green-700 hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6 fill-green-700" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400 font-medium">No subscribers yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {subscribers.map((sub) => (
              <div key={sub.userID} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-green-700">
                      {sub.firstName?.[0]?.toUpperCase()}{sub.lastName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {sub.firstName} {sub.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{sub.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="hidden sm:block text-xs text-gray-400 font-medium">{sub.level}</span>
                  <span className="text-xs text-gray-400">{formatDate(sub.timeStamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
