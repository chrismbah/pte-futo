import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import ProfileModal from "../../../components/community/ProfileModal";
import { useGetOrCreateChat, useUserVerification, useAnyUserVerification } from "../../../hooks/usePrivateChat";
import {
  usePremiumMessages,
  usePostPremiumMessage,
  usePremiumReplies,
  usePostPremiumReply,
  usePremiumLike,
  useAdminPremiumActions,
  type PremiumMessage,
  type PremiumReply,
} from "../../../hooks/usePremiumCommunity";
import {
  ArrowLeft, Send, Heart, MessageSquare, Pin, Megaphone,
  Trash2, ChevronDown, ChevronUp, Crown, Search, X, CheckCircle
} from "lucide-react";

const ADMIN_IDS = ["admin", "chigozie8"];

function Avatar({ name, src, size = 10 }: { name: string; src?: string; size?: number }) {
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  if (src) return <img src={src} alt={name} className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0 ring-2 ring-amber-500/30`} />;
  return (
    <div className={`w-${size} h-${size} rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ring-2 ring-amber-500/30`}
      style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0d0d14" }}>
      {initials}
    </div>
  );
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ── Reply Thread ──────────────────────────────────────────
function ReplyThread({ message, userId, userName, userAvatar, isAdmin, onDeleteReply }:
  { message: PremiumMessage; userId: string; userName: string; userAvatar?: string; isAdmin: boolean; onDeleteReply: (id: string, msgId: string) => void }) {
  const { replies, loading } = usePremiumReplies(message.id);
  const { postReply, posting } = usePostPremiumReply();
  const [text, setText] = useState("");

  const handleReply = async () => {
    if (!text.trim()) return;
    await postReply(message.id, userId, userName, text.trim(), userAvatar);
    setText("");
    toast.success("Reply posted!", { style: { background: "#1a1a2e", color: "#fbbf24", border: "1px solid #fbbf2433" } });
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-3 h-3 border border-amber-500/40 border-t-transparent rounded-full animate-spin" /> Loading replies…</div>
      ) : replies.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No replies yet — be the first!</p>
      ) : (
        replies.map((r: PremiumReply) => (
          <div key={r.id} className="flex gap-2.5 group">
            <Avatar name={r.user_name} src={r.user_avatar} size={7} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-amber-300">{r.user_name}</span>
                <span className="text-xss text-gray-500">{timeAgo(r.created_at)}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed break-words">{r.content}</p>
            </div>
            {(isAdmin || r.user_id === userId) && (
              <button onClick={() => onDeleteReply(r.id, message.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400 p-1 flex-shrink-0">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))
      )}
      {/* Compose reply */}
      <div className="flex gap-2 mt-2">
        <Avatar name={userName} src={userAvatar} size={7} />
        <div className="flex-1 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
            placeholder="Write a reply…"
            className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
          <button onClick={handleReply} disabled={posting || !text.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
            style={{ background: "#f59e0b", color: "#0d0d14" }}>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Message Card ──────────────────────────────────────────
function MessageCard({ msg, userId, userName, userAvatar, isAdmin, likedIds, onLike, onDelete, onPin, onAnnounce, onDeleteReply, onAvatarClick }:
  { msg: PremiumMessage; userId: string; userName: string; userAvatar?: string; isAdmin: boolean; likedIds: Set<string>;
    onLike: (id: string) => void; onDelete: (id: string) => void; onPin: (id: string, cur: boolean) => void;
    onAnnounce: (id: string, cur: boolean) => void; onDeleteReply: (rid: string, mid: string) => void;
    onAvatarClick?: (uid: string, uName: string, uAvatar?: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isLiked = likedIds.has(msg.id);
  const { verification } = useAnyUserVerification(msg.user_id);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${msg.is_announcement
        ? "border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-amber-900/10"
        : msg.is_pinned
        ? "border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-[#1a1a2e]"
        : "border-white/6 bg-white/3 hover:bg-white/5"}`}>

      {/* Badges */}
      {(msg.is_pinned || msg.is_announcement) && (
        <div className="flex gap-2 mb-2">
          {msg.is_announcement && <span className="inline-flex items-center gap-1 text-xss font-bold px-2 py-0.5 rounded-full" style={{ background: "#f59e0b22", color: "#f59e0b" }}><Megaphone className="w-2.5 h-2.5" /> Announcement</span>}
          {msg.is_pinned && <span className="inline-flex items-center gap-1 text-xss font-bold px-2 py-0.5 rounded-full" style={{ background: "#a855f722", color: "#c084fc" }}><Pin className="w-2.5 h-2.5" /> Pinned</span>}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onAvatarClick?.(msg.user_id, msg.user_name, msg.user_avatar)}
          className="flex-shrink-0 focus:outline-none group"
        >
          <Avatar name={msg.user_name} src={msg.user_avatar} size={10} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onAvatarClick?.(msg.user_id, msg.user_name, msg.user_avatar)}
              className="font-semibold text-sm text-amber-300 hover:text-amber-200 transition-colors focus:outline-none"
            >
              {msg.user_name}
            </button>
            {verification?.is_verified && (
              <CheckCircle className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" strokeWidth={2.5} />
            )}
            {ADMIN_IDS.includes(msg.user_id) && (
              <span className="inline-flex items-center gap-1 text-xss font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#f59e0b", color: "#0d0d14" }}><Crown className="w-2.5 h-2.5" /> Admin</span>
            )}
            <span className="text-xss text-gray-500 ml-auto">{timeAgo(msg.created_at)}</span>
          </div>
          <p className="mt-1.5 text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
          {msg.image_url && <img src={msg.image_url} alt="attachment" className="mt-2 rounded-xl max-h-64 object-cover border border-white/10" />}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-white/5 flex-wrap">
        <button onClick={() => onLike(msg.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${isLiked ? "text-rose-400" : "text-gray-500 hover:text-rose-400"}`}>
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-400" : ""}`} />
          <span>{msg.likes_count}</span>
        </button>
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{msg.replies_count} {expanded ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />}</span>
        </button>

        {/* Admin actions */}
        {isAdmin && (
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => onPin(msg.id, msg.is_pinned)} title={msg.is_pinned ? "Unpin" : "Pin"}
              className={`p-1.5 rounded-lg transition-colors text-xs ${msg.is_pinned ? "text-purple-400 bg-purple-500/10" : "text-gray-500 hover:text-purple-400 hover:bg-purple-500/10"}`}>
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onAnnounce(msg.id, msg.is_announcement)} title={msg.is_announcement ? "Remove Announcement" : "Mark as Announcement"}
              className={`p-1.5 rounded-lg transition-colors text-xs ${msg.is_announcement ? "text-amber-400 bg-amber-500/10" : "text-gray-500 hover:text-amber-400 hover:bg-amber-500/10"}`}>
              <Megaphone className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(msg.id)} title="Delete"
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {!isAdmin && msg.user_id === userId && (
          <button onClick={() => onDelete(msg.id)}
            className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Replies */}
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: expanded ? "9999px" : "0px" }}
      >
        {expanded && (
          <ReplyThread message={msg} userId={userId} userName={userName} userAvatar={userAvatar} isAdmin={isAdmin} onDeleteReply={onDeleteReply} />
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function PremiumCommunityPage() {
  const navigate = useNavigate();
  const { userID, studentDetails, user } = useGetUserInfo();
  const userId = userID || "";
  // Use Firestore name if loaded, fall back to Firebase Auth displayName, then email prefix
  const userName = studentDetails
    ? `${studentDetails.firstName} ${studentDetails.lastName}`.trim()
    : user?.displayName || user?.email?.split("@")[0] || "Member";
  const userAvatar = studentDetails?.profileImageURL || user?.photoURL || undefined;
  const isAdmin = ADMIN_IDS.includes(userId);

  const { messages, loading } = usePremiumMessages(60);
  const { post, posting } = usePostPremiumMessage();
  const { toggle: toggleLike, getUserLikes } = usePremiumLike();
  const { deleteMsg, togglePin, toggleAnnouncement, deleteReply } = useAdminPremiumActions();

  // Profile modal
  const [profileTarget, setProfileTarget] = useState<{ userId: string; userName: string; userAvatar?: string } | null>(null);
  const { getOrCreate } = useGetOrCreateChat();
  const { upsertVerification, setOnlineStatus } = useUserVerification(userId);

  useEffect(() => {
    if (userId && userId !== "anon" && userName) {
      upsertVerification(userId, userName, userAvatar);
      setOnlineStatus(userId, "online");
    }
    return () => { if (userId && userId !== "anon") setOnlineStatus(userId, "offline"); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userName]);

  const handleAvatarClick = useCallback((uid: string, uName: string, uAvatar?: string) => {
    setProfileTarget({ userId: uid, userName: uName, userAvatar: uAvatar });
  }, []);

  const handleMessageUser = useCallback(async () => {
    if (!profileTarget || !userId) return;
    try {
      const chatId = await getOrCreate(userId, userName, userAvatar, profileTarget.userId, profileTarget.userName, profileTarget.userAvatar);
      setProfileTarget(null);
      navigate(`/u/chat?chatId=${chatId}&otherId=${profileTarget.userId}&otherName=${encodeURIComponent(profileTarget.userName)}&otherAvatar=${encodeURIComponent(profileTarget.userAvatar ?? "")}`);
    } catch { toast.error("Could not open chat."); }
  }, [profileTarget, userId, userName, userAvatar, getOrCreate, navigate]);

  const [draft, setDraft] = useState("");
  // canPost must come after draft and posting are declared
  const canPost = !!userId && draft.trim().length > 0 && !posting;
  const [asAnnouncement, setAsAnnouncement] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (userId && userId !== "anon") {
      getUserLikes(userId).then((ids) => setLikedIds(new Set(ids)));
    }
  }, [userId, getUserLikes]);

  const handlePost = async () => {
    if (!draft.trim()) return;
    try {
      await post(userId, userName, draft.trim(), userAvatar, isAdmin && asAnnouncement);
      setDraft("");
      setAsAnnouncement(false);
      toast.success("Posted!", { style: { background: "#1a1a1a", color: "#fbbf24", border: "1px solid #fbbf2433" } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post. Try again.";
      toast.error(msg);
    }
  };

  const handleLike = async (msgId: string) => {
    const liked = likedIds.has(msgId);
    const next = new Set(likedIds);
    liked ? next.delete(msgId) : next.add(msgId);
    setLikedIds(next);
    await toggleLike(msgId, userId, liked);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await deleteMsg(id);
    toast.success("Deleted.", { style: { background: "#1a1a1a", color: "#f87171", border: "1px solid #f8717133" } });
  };

  const handleDeleteReply = async (rid: string, mid: string) => {
    if (!confirm("Delete this reply?")) return;
    await deleteReply(rid, mid);
    toast.success("Reply deleted.");
  };

  const filtered = messages.filter((m) =>
    !search || m.content.toLowerCase().includes(search.toLowerCase()) || m.user_name.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.filter((m) => m.is_pinned || m.is_announcement);
  const regular = filtered.filter((m) => !m.is_pinned && !m.is_announcement);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#0d0d14" }}>
      {/* Profile Modal */}
      {profileTarget && (
        <ProfileModal
          targetUserId={profileTarget.userId}
          targetUserName={profileTarget.userName}
          targetUserAvatar={profileTarget.userAvatar}
          viewerUserId={userId}
          onMessage={handleMessageUser}
          onClose={() => setProfileTarget(null)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/8" style={{ background: "rgba(13,13,20,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
            <Crown className="w-4.5 h-4.5 text-[#0d0d14]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-amber-300 leading-tight">Premium Community</h1>
            <p className="text-xss text-gray-500">Exclusive space for premium members</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: "#f59e0b18", color: "#fbbf24", border: "1px solid #f59e0b30" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {messages.length} posts
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search discussions…"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/40 transition-colors" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>}
        </div>

        {/* Composer */}
        <div className="rounded-2xl border border-white/8 p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="flex gap-3">
            <Avatar name={userName} src={userAvatar} size={10} />
            <div className="flex-1 min-w-0">
              <textarea ref={textareaRef} value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
                placeholder="Share something with the premium community…"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/8 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/40 resize-none transition-colors leading-relaxed" />
              <div className="flex items-center justify-between mt-2.5 flex-wrap gap-2">
                {isAdmin && (
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                    <input type="checkbox" checked={asAnnouncement} onChange={(e) => setAsAnnouncement(e.target.checked)} className="rounded accent-amber-500" />
                    Post as Announcement
                  </label>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xss text-gray-600">Ctrl+Enter to post</span>
                  <button onClick={handlePost} disabled={!canPost}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
                    style={{ background: "#f59e0b", color: "#0d0d14" }}>
                    {posting ? <div className="w-3.5 h-3.5 border-2 border-[#0d0d14]/40 border-t-[#0d0d14] rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-amber-500/40 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading community…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#f59e0b15" }}>
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-gray-300 font-semibold">{search ? "No results found" : "Be the first to post!"}</p>
            <p className="text-sm text-gray-600 mt-1">{search ? "Try a different search term." : "Start a discussion for your fellow premium members."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pinned / Announcements */}
            {pinned.length > 0 && (
              <div className="space-y-3">
          {pinned.map((msg) => (
              <MessageCard key={msg.id} msg={msg} userId={userId} userName={userName} userAvatar={userAvatar}
                isAdmin={isAdmin} likedIds={likedIds} onLike={handleLike} onDelete={handleDelete}
                onPin={togglePin} onAnnounce={toggleAnnouncement} onDeleteReply={handleDeleteReply}
                onAvatarClick={handleAvatarClick} />
            ))}
            {regular.length > 0 && <div className="border-t border-white/6 pt-3" />}
          </div>
          )}
          {regular.map((msg) => (
              <MessageCard key={msg.id} msg={msg} userId={userId} userName={userName} userAvatar={userAvatar}
                isAdmin={isAdmin} likedIds={likedIds} onLike={handleLike} onDelete={handleDelete}
                onPin={togglePin} onAnnounce={toggleAnnouncement} onDeleteReply={handleDeleteReply}
                onAvatarClick={handleAvatarClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
