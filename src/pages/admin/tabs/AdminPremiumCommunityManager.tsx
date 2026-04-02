import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  usePremiumMessages,
  usePremiumReplies,
  usePostPremiumMessage,
  useAdminPremiumActions,
  type PremiumMessage,
  type PremiumReply,
} from "../../../hooks/usePremiumCommunity";
import { Crown, Pin, Megaphone, Trash2, MessageSquare, ChevronDown, ChevronUp, Send, Search, X, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function Avatar({ name, src }: { name: string; src?: string }) {
  const init = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  if (src) return <img src={src} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
      style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0d0d14" }}>{init}</div>
  );
}

function RepliesPanel({ msgId, onDeleteReply }: { msgId: string; onDeleteReply: (rid: string) => void }) {
  const { replies, loading } = usePremiumReplies(msgId);
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      {loading ? <p className="text-xs text-gray-400">Loading replies…</p>
        : replies.length === 0 ? <p className="text-xs text-gray-400 italic">No replies.</p>
        : replies.map((r: PremiumReply) => (
          <div key={r.id} className="flex items-start gap-2 group bg-gray-50 rounded-lg p-2">
            <Avatar name={r.user_name} src={r.user_avatar} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-gray-700">{r.user_name}</span>
              <span className="text-xss text-gray-400 ml-1">{timeAgo(r.created_at)}</span>
              <p className="text-xs text-gray-600 mt-0.5 break-words">{r.content}</p>
            </div>
            <button onClick={() => onDeleteReply(r.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
    </div>
  );
}

export default function AdminPremiumCommunityManager() {
  const { messages, loading } = usePremiumMessages(100);
  const { post, posting } = usePostPremiumMessage();
  const { deleteMsg, togglePin, toggleAnnouncement, deleteReply } = useAdminPremiumActions();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned" | "announcements">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adminDraft, setAdminDraft] = useState("");
  const [asAnnouncement, setAsAnnouncement] = useState(false);

  const filtered = messages.filter((m) => {
    const matchesSearch = !search || m.content.toLowerCase().includes(search.toLowerCase()) || m.user_name.toLowerCase().includes(search.toLowerCase());
    if (filter === "pinned") return matchesSearch && m.is_pinned;
    if (filter === "announcements") return matchesSearch && m.is_announcement;
    return matchesSearch;
  });

  const stats = {
    total: messages.length,
    pinned: messages.filter((m) => m.is_pinned).length,
    announcements: messages.filter((m) => m.is_announcement).length,
    totalReplies: messages.reduce((a, m) => a + (m.replies_count || 0), 0),
    totalLikes: messages.reduce((a, m) => a + (m.likes_count || 0), 0),
  };

  const handleAdminPost = async () => {
    if (!adminDraft.trim()) return;
    await post("admin", "Admin", adminDraft.trim(), undefined, asAnnouncement);
    setAdminDraft("");
    setAsAnnouncement(false);
    toast.success("Admin message posted!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message and all its replies?")) return;
    await deleteMsg(id);
    toast.success("Message deleted.");
  };

  const handleDeleteReply = async (rid: string) => {
    if (!confirm("Delete this reply?")) return;
    // Find parent message id from expanded state
    await deleteReply(rid, expanded || "");
    toast.success("Reply deleted.");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Posts", value: stats.total, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Pinned", value: stats.pinned, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Announcements", value: stats.announcements, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Replies", value: stats.totalReplies, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Likes", value: stats.totalLikes, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Admin Composer */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#f59e0b" }}>
            <Crown className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Post as Admin</h3>
        </div>
        <textarea value={adminDraft} onChange={(e) => setAdminDraft(e.target.value)} rows={3}
          placeholder="Write a message or announcement to the premium community…"
          className="w-full px-4 py-3 rounded-xl text-sm border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={asAnnouncement} onChange={(e) => setAsAnnouncement(e.target.checked)} className="rounded accent-amber-500" />
            Mark as Announcement
          </label>
          <button onClick={handleAdminPost} disabled={posting || !adminDraft.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 transition-all">
            <Send className="w-3.5 h-3.5" />
            {posting ? "Posting…" : "Post Message"}
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages or users…"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="flex gap-2">
          {(["all", "pinned", "announcements"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${filter === f ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading messages…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No messages found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((msg: PremiumMessage) => (
              <motion.div key={msg.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${msg.is_announcement ? "border-amber-300 bg-amber-50/40" : msg.is_pinned ? "border-purple-200 bg-purple-50/20" : "border-gray-100"}`}>

                {/* Badges */}
                {(msg.is_pinned || msg.is_announcement) && (
                  <div className="flex gap-1.5 mb-2">
                    {msg.is_announcement && <span className="inline-flex items-center gap-1 text-xss font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"><Megaphone className="w-2.5 h-2.5" /> Announcement</span>}
                    {msg.is_pinned && <span className="inline-flex items-center gap-1 text-xss font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700"><Pin className="w-2.5 h-2.5" /> Pinned</span>}
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Avatar name={msg.user_name} src={msg.user_avatar} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">{msg.user_name}</span>
                      <span className="text-xss text-gray-400">{timeAgo(msg.created_at)}</span>
                      <div className="ml-auto flex items-center gap-1.5 text-xss text-gray-400">
                        <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />{msg.likes_count}</span>
                        <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{msg.replies_count}</span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-sm text-gray-700 break-words whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-100 flex-wrap">
                  <button onClick={() => togglePin(msg.id, msg.is_pinned)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${msg.is_pinned ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"}`}>
                    <Pin className="w-3 h-3" />{msg.is_pinned ? "Unpin" : "Pin"}
                  </button>
                  <button onClick={() => toggleAnnouncement(msg.id, msg.is_announcement)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${msg.is_announcement ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"}`}>
                    <Megaphone className="w-3 h-3" />{msg.is_announcement ? "Unmark" : "Announce"}
                  </button>
                  <button onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all">
                    <MessageSquare className="w-3 h-3" />
                    Replies ({msg.replies_count})
                    {expanded === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <button onClick={() => handleDelete(msg.id)}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>

                {/* Replies Panel */}
                <AnimatePresence>
                  {expanded === msg.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <RepliesPanel msgId={msg.id} onDeleteReply={handleDeleteReply} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
