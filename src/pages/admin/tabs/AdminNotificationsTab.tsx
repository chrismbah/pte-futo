/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import { TrashIcon } from "../../../components/icons/general/TrashIcon";
import { motion } from "framer-motion";

type NotificationType = "info" | "success" | "warning" | "announcement" | "update";

interface BroadcastForm {
  title: string;
  message: string;
  type: NotificationType;
  link: string;
}

interface SentNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  createdAt: string;
}

const TYPE_STYLES: Record<NotificationType, { bg: string; border: string; badge: string; badgeText: string; dot: string; ring: string }> = {
  info:         { bg: "bg-blue-50",   border: "border-blue-100",   badge: "bg-blue-100",   badgeText: "text-blue-700",   dot: "bg-blue-500",   ring: "focus:ring-blue-400" },
  success:      { bg: "bg-green-50",  border: "border-green-100",  badge: "bg-green-100",  badgeText: "text-green-700",  dot: "bg-green-500",  ring: "focus:ring-green-400" },
  warning:      { bg: "bg-yellow-50", border: "border-yellow-100", badge: "bg-yellow-100", badgeText: "text-yellow-700", dot: "bg-yellow-500", ring: "focus:ring-yellow-400" },
  announcement: { bg: "bg-purple-50", border: "border-purple-100", badge: "bg-purple-100", badgeText: "text-purple-700", dot: "bg-purple-500", ring: "focus:ring-purple-400" },
  update:       { bg: "bg-teal-50",   border: "border-teal-100",   badge: "bg-teal-100",   badgeText: "text-teal-700",   dot: "bg-teal-500",   ring: "focus:ring-teal-400" },
};

const QUICK_PRESETS: { label: string; type: NotificationType; title: string; message: string; link: string }[] = [
  {
    label: "Exams Postponed",
    type: "warning",
    title: "Exam Postponement Notice",
    message: "The upcoming examinations have been postponed. A new date will be communicated shortly. Please check the academic calendar for updates.",
    link: "/academics",
  },
  {
    label: "New Timetable",
    type: "announcement",
    title: "New Timetable Released",
    message: "The updated examination/lecture timetable has been published. Please visit the academics section to view the schedule.",
    link: "/academics",
  },
  {
    label: "New Resources",
    type: "update",
    title: "New Study Materials Uploaded",
    message: "Fresh learning resources have been added to the portal. Log in and check the Learning Resources section for new handouts and past questions.",
    link: "/u/learning-resources",
  },
  {
    label: "Emergency Notice",
    type: "warning",
    title: "Urgent Notice",
    message: "Please check the notice board for an important update regarding academic activities.",
    link: "/",
  },
  {
    label: "Welcome / Info",
    type: "info",
    title: "Welcome to EBSUMSA Portal",
    message: "Hello! Stay updated with the latest news, timetables, and academic resources right here on the EBSUMSA student portal.",
    link: "/dashboard",
  },
];

interface AdminNotificationsTabProps {
  initialSentNotifications?: SentNotification[];
}

export default function AdminNotificationsTab({ initialSentNotifications = [] }: AdminNotificationsTabProps) {
  const [broadcastForm, setBroadcastForm] = useState<BroadcastForm>({
    title: "",
    message: "",
    type: "info",
    link: "",
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>(initialSentNotifications);
  const [loadingSentNotifications, setLoadingSentNotifications] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSentNotifications();
  }, []);

  const fetchSentNotifications = async () => {
    setLoadingSentNotifications(true);
    try {
      const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list: SentNotification[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.userId === "global") {
          list.push({
            id: d.id,
            title: data.title,
            message: data.message,
            type: data.type,
            link: data.link,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate().toISOString()
              : data.createdAt ?? new Date().toISOString(),
          });
        }
      });
      setSentNotifications(list);
    } catch (err) {
      console.error("Error fetching sent notifications:", err);
      notifyUser("error", "Could not load sent notifications");
    } finally {
      setLoadingSentNotifications(false);
    }
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[number]) => {
    setBroadcastForm({
      title: preset.title,
      message: preset.message,
      type: preset.type,
      link: preset.link,
    });
    // Scroll compose form into view on mobile
    document.getElementById("compose-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sendBroadcastNotification = async () => {
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      notifyUser("error", "Please fill in the title and message");
      return;
    }
    setSendingBroadcast(true);
    try {
      await addDoc(collection(db, "notifications"), {
        userId: "global",
        title: broadcastForm.title.trim(),
        message: broadcastForm.message.trim(),
        type: broadcastForm.type,
        link: broadcastForm.link.trim() || null,
        createdAt: serverTimestamp(),
        read: false,
      });
      notifyUser("success", "Notification sent to all users!");
      setBroadcastForm({ title: "", message: "", type: "info", link: "" });
      fetchSentNotifications();
    } catch (err) {
      console.error("Error sending broadcast:", err);
      notifyUser("error", "Failed to send notification");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const deleteSentNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      setSentNotifications((prev) => prev.filter((n) => n.id !== id));
      notifyUser("success", "Notification deleted");
    } catch (err) {
      console.error("Error deleting notification:", err);
      notifyUser("error", "Failed to delete notification");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const styles = TYPE_STYLES[broadcastForm.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Broadcast Notifications</h1>
          <p className="text-xs text-gray-500">Send urgent announcements directly to every student's bell icon in real-time.</p>
        </div>
      </div>

      {/* Quick-send presets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset) => {
            const s = TYPE_STYLES[preset.type];
            return (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:shadow-sm active:scale-95 ${s.bg} ${s.border} ${s.badgeText}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">Click a preset to auto-fill the compose form below, then edit if needed.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Compose Form */}
        <div id="compose-form" className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Compose Message</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Exam Timetable Released"
                maxLength={80}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{broadcastForm.title.length}/80</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Write your notification message here..."
                rows={4}
                maxLength={300}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{broadcastForm.message.length}/300</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
              <select
                value={broadcastForm.type}
                onChange={(e) => setBroadcastForm((p) => ({ ...p, type: e.target.value as NotificationType }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              >
                <option value="info">Info (blue)</option>
                <option value="success">Success (green)</option>
                <option value="warning">Warning (yellow)</option>
                <option value="announcement">Announcement (purple)</option>
                <option value="update">Update (teal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Link <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={broadcastForm.link}
                onChange={(e) => setBroadcastForm((p) => ({ ...p, link: e.target.value }))}
                placeholder="e.g. /u/learning-resources"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            {/* Live preview */}
            {(broadcastForm.title || broadcastForm.message) && (
              <div className={`rounded-xl p-3 border ${styles.bg} ${styles.border}`}>
                <p className="text-xs font-semibold text-gray-500 mb-1">Preview</p>
                <div className="flex items-start gap-2">
                  <span className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${styles.dot}`} />
                  <div>
                    {broadcastForm.title && (
                      <p className="text-sm font-bold text-gray-900">{broadcastForm.title}</p>
                    )}
                    {broadcastForm.message && (
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{broadcastForm.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={sendBroadcastNotification}
              disabled={sendingBroadcast || !broadcastForm.title.trim() || !broadcastForm.message.trim()}
              className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold text-sm hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sendingBroadcast ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              {sendingBroadcast ? "Sending..." : "Send to All Users"}
            </button>
          </div>
        </div>

        {/* Sent Notifications List */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Sent Notifications</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {sentNotifications.length} broadcast{sentNotifications.length !== 1 ? "s" : ""} sent
              </p>
            </div>
            <button
              onClick={fetchSentNotifications}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh"
              aria-label="Refresh sent notifications"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {loadingSentNotifications ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="w-6 h-6" />
            </div>
          ) : sentNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm font-medium">No notifications sent yet</p>
              <p className="text-xs mt-1">Use a quick preset or compose a message above</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {sentNotifications.map((notif) => {
                const s = TYPE_STYLES[notif.type] ?? TYPE_STYLES.info;
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-3 p-4 rounded-xl border ${s.bg} ${s.border}`}
                  >
                    <span className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900 text-pretty">{notif.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${s.badge} ${s.badgeText}`}>
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                      {notif.link && (
                        <p className="text-xs text-gray-400 mt-1">
                          Link: <span className="font-mono">{notif.link}</span>
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleString("en-GB", {
                                day: "numeric", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })
                            : "Just now"}
                        </p>
                        <button
                          onClick={() => setConfirmDeleteId(notif.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Delete notification"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <TrashIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Notification</h3>
                <p className="text-xs text-gray-500">This will remove the broadcast for all students.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteSentNotification(confirmDeleteId)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
