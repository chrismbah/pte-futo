import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Loader2, MessageCircle, CheckCheck, Check, Smile, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

interface CommunityReply {
  id: string;
  message_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  reply: string;
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
}

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

interface ThreadViewerProps {
  messageId: string;
  onClose: () => void;
  userId: string;
  userName: string;
  userAvatar?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const GRADS = [
  ['#00897b', '#26a69a'],
  ['#1976d2', '#42a5f5'],
  ['#e91e63', '#f06292'],
  ['#f57c00', '#ffb74d'],
  ['#388e3c', '#66bb6a'],
  ['#7b1fa2', '#ba68c8'],
];

function grad(name: string): [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return GRADS[h % GRADS.length] as [string, string];
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase();
}

function fmtTime(date: string) {
  return new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtDateChip(date: string) {
  const d = new Date(date);
  const now = new Date();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString())  return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupByDate(replies: CommunityReply[]) {
  const groups: { date: string; items: CommunityReply[] }[] = [];
  for (const r of replies) {
    const chip = fmtDateChip(r.created_at);
    const last = groups[groups.length - 1];
    if (last && last.date === chip) last.items.push(r);
    else groups.push({ date: chip, items: [r] });
  }
  return groups;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const Ticks: React.FC<{ seen?: boolean; optimistic?: boolean }> = ({ seen, optimistic }) => {
  if (optimistic) return <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#8696a0' }} />;
  return seen
    ? <CheckCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#53bdeb' }} />
    : <CheckCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#8696a0' }} />;
};

const TypingBubble: React.FC<{ name: string }> = ({ name }) => {
  const [c0, c1] = grad(name);
  return (
    <div className="flex items-end gap-1.5 px-3 py-1 wa-msg-in">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${c0}, ${c1})` }}
      >
        {initials(name)}
      </div>
      <div
        className="flex items-center gap-1 px-3.5 py-3 rounded-2xl rounded-bl-none shadow-sm"
        style={{ background: '#fff', maxWidth: '80px' }}
      >
        <div className="wa-typing-dot" />
        <div className="wa-typing-dot" />
        <div className="wa-typing-dot" />
      </div>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const BubbleSkeleton: React.FC<{ right?: boolean }> = ({ right }) => (
  <div className={`flex items-end gap-2 px-3 py-1 ${right ? 'flex-row-reverse' : ''}`}>
    {!right && <div className="w-7 h-7 rounded-full wa-skeleton flex-shrink-0" />}
    <div className={`wa-skeleton rounded-2xl ${right ? 'rounded-br-none' : 'rounded-bl-none'} h-11 ${right ? 'w-36' : 'w-44'}`} />
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const ThreadViewer: React.FC<ThreadViewerProps> = ({
  messageId, onClose, userId, userName, userAvatar,
}) => {
  const [replies,    setReplies]    = useState<CommunityReply[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [replyText,  setReplyText]  = useState('');
  const [posting,    setPosting]    = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const typingTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    // Firebase realtime listener for replies
    const q = query(
      collection(db, 'community_replies'),
      where('message_id', '==', messageId),
      where('is_deleted', '==', false),
      orderBy('created_at', 'asc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!mounted) return;
        setReplies(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              message_id: data.message_id as string,
              user_id: data.user_id as string,
              user_name: (data.user_name as string) || 'Unknown',
              user_avatar: data.user_avatar as string | undefined,
              reply: (data.reply as string) || '',
              created_at: toIso(data.created_at),
              is_edited: (data.is_edited as boolean) || false,
              is_deleted: (data.is_deleted as boolean) || false,
            };
          })
        );
        setLoading(false);
      },
      () => {
        if (mounted) {
          toast.error('Failed to load replies');
          setLoading(false);
        }
      }
    );

    // Typing indicator via Firestore document
    const typingDocRef = doc(db, 'typing_indicators', `thread_${messageId}`);
    const typingUnsub = onSnapshot(typingDocRef, (snap) => {
      if (!mounted || !snap.exists()) return;
      const data = snap.data();
      const typingUsers = (data.users as Record<string, number>) || {};
      const now = Date.now();
      const otherTypingUser = Object.entries(typingUsers).find(
        ([uid, ts]) => uid !== userId && now - ts < 4000
      );
      if (otherTypingUser) {
        setTypingUser(otherTypingUser[0] === userId ? null : 'Someone');
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTypingUser(null), 3000);
      }
    });

    return () => {
      mounted = false;
      unsub();
      typingUnsub();
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [messageId, userId]);

  // Auto-scroll to bottom on new messages or typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: replies.length <= 1 ? 'auto' : 'smooth' });
  }, [replies, typingUser]);

  const sendReply = useCallback(async () => {
    const text = replyText.trim();
    if (!text || posting) return;
    setPosting(true);

    const optId = `opt-${Date.now()}`;
    const optimistic: CommunityReply = {
      id: optId,
      message_id: messageId,
      user_id: userId,
      user_name: userName,
      user_avatar: userAvatar,
      reply: text,
      created_at: new Date().toISOString(),
      is_edited: false,
      is_deleted: false,
    };

    setReplies((p) => [...p, optimistic]);
    setReplyText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      await addDoc(collection(db, 'community_replies'), {
        message_id: messageId,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar || null,
        reply: text,
        is_edited: false,
        is_deleted: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Increment reply_count on parent message
      const msgRef = doc(db, 'community_messages', messageId);
      const msgSnap = await getDoc(msgRef);
      if (msgSnap.exists()) {
        const current = (msgSnap.data().reply_count as number) || 0;
        await updateDoc(msgRef, { reply_count: current + 1 });
      }

      setReplies((p) => p.filter((r) => r.id !== optId));
    } catch {
      toast.error('Failed to send. Please retry.');
      setReplies((p) => p.filter((r) => r.id !== optId));
      setReplyText(text);
    } finally {
      setPosting(false);
    }
  }, [replyText, posting, messageId, userId, userName, userAvatar]);

  const emitTyping = async () => {
    try {
      const typingDocRef = doc(db, 'typing_indicators', `thread_${messageId}`);
      const snap = await getDoc(typingDocRef);
      if (snap.exists()) {
        await updateDoc(typingDocRef, { [`users.${userId}`]: Date.now() });
      } else {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(typingDocRef, { users: { [userId]: Date.now() } });
      }
    } catch {
      // non-critical
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  const groups = groupByDate(replies);
  const [mg0, mg1] = grad(userName);
  const canSend = replyText.trim().length > 0 && !posting;

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Sheet ── */}
      <div
        className="wa-modal w-full sm:max-w-md flex flex-col overflow-hidden shadow-2xl"
        style={{
          height: '88dvh',
          maxHeight: '720px',
          background: '#fff',
          borderRadius: '20px 20px 0 0',
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-4 py-0"
          style={{
            background: '#075E54',
            height: '58px',
            borderRadius: '20px 20px 0 0',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Icon */}
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[15px] leading-tight">Thread replies</p>
            <p className="text-[12px] leading-tight" style={{ color: '#25D366' }}>
              {loading ? '…' : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
            </p>
          </div>
        </div>

        {/* ── Chat area ───────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto wa-scroll"
          style={{
            background: '#e5ddd5',
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        >
          {loading ? (
            /* Skeletons */
            <div className="space-y-1 pt-3">
              {[false, true, false, false, true].map((r, i) => (
                <BubbleSkeleton key={i} right={r} />
              ))}
            </div>

          ) : replies.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-sm"
                style={{ background: 'rgba(255,255,255,0.85)' }}
              >
                <MessageCircle className="w-8 h-8" style={{ color: '#25D366' }} />
              </div>
              <p className="font-semibold text-[15px]" style={{ color: '#54656f' }}>No replies yet</p>
              <p className="text-[13px] mt-1" style={{ color: '#8696a0' }}>Start the conversation!</p>
            </div>

          ) : (
            /* Messages */
            <div className="py-2 space-y-px">
              {groups.map((group) => (
                <div key={group.date}>
                  {/* Date chip */}
                  <div className="flex justify-center my-2">
                    <span
                      className="text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm"
                      style={{ background: 'rgba(225,245,254,0.9)', color: '#54656f' }}
                    >
                      {group.date}
                    </span>
                  </div>

                  {group.items.map((reply, idx) => {
                    const isMe       = reply.user_id === userId;
                    const isOpt      = reply.id.startsWith('opt-');
                    const prevSame   = idx > 0 && group.items[idx - 1].user_id === reply.user_id;
                    const nextSame   = idx < group.items.length - 1 && group.items[idx + 1].user_id === reply.user_id;
                    const [rc0, rc1] = grad(reply.user_name);

                    // Bubble corner radii — group consecutive messages
                    const br = isMe
                      ? nextSame ? '16px 4px 16px 16px' : '16px 0px 16px 16px'
                      : nextSame ? '4px 16px 16px 16px' : '0px 16px 16px 16px';

                    return (
                      <div
                        key={reply.id}
                        className={`flex items-end gap-1.5 px-3 ${isMe ? 'flex-row-reverse' : ''} ${isMe ? 'wa-msg-out' : 'wa-msg-in'}`}
                        style={{ marginTop: prevSame ? '2px' : '6px', opacity: isOpt ? 0.75 : 1 }}
                      >
                        {/* Avatar — show only on last of incoming group */}
                        <div className="w-7 flex-shrink-0 self-end">
                          {!isMe && !nextSame ? (
                            reply.user_avatar ? (
                              <img
                                src={reply.user_avatar}
                                alt={reply.user_name}
                                crossOrigin="anonymous"
                                className="w-7 h-7 rounded-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                                style={{ background: `linear-gradient(135deg, ${rc0}, ${rc1})` }}
                              >
                                {initials(reply.user_name)}
                              </div>
                            )
                          ) : null}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {/* Sender name — first in group (incoming only) */}
                          {!isMe && !prevSame && (
                            <span
                              className="text-[11px] font-bold px-1 pb-0.5 leading-tight"
                              style={{ color: rc0 }}
                            >
                              {reply.user_name}
                            </span>
                          )}

                          <div
                            className="relative shadow-sm"
                            style={{
                              background: isMe ? '#dcf8c6' : '#ffffff',
                              borderRadius: br,
                              padding: '7px 12px 5px 12px',
                              maxWidth: '100%',
                            }}
                          >
                            {/* Message text */}
                            <p
                              className="text-[14px] leading-relaxed break-words whitespace-pre-wrap"
                              style={{ color: '#111b21' }}
                            >
                              {reply.reply}
                            </p>

                            {/* Time + tick */}
                            <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[10px] leading-none" style={{ color: '#8696a0' }}>
                                {fmtTime(reply.created_at)}
                              </span>
                              {isMe && <Ticks seen={false} optimistic={isOpt} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {typingUser && <TypingBubble name={typingUser} />}
              <div ref={bottomRef} className="h-1" />
            </div>
          )}
        </div>

        {/* ── Composer ─────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 flex items-end gap-2 px-2 py-2"
          style={{ background: '#f0f2f5' }}
        >
          {/* My avatar */}
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              crossOrigin="anonymous"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end mb-0.5"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 self-end mb-0.5"
              style={{ background: `linear-gradient(135deg, ${mg0}, ${mg1})` }}
            >
              {initials(userName)}
            </div>
          )}

          {/* Input capsule */}
          <div
            className="flex-1 flex items-end gap-1 rounded-3xl px-2 py-1.5 min-h-[42px] shadow-sm"
            style={{ background: '#fff' }}
          >
            <button className="p-1.5 rounded-full hover:bg-[#f0f2f5] transition-colors flex-shrink-0 self-end mb-0.5">
              <Smile className="w-5 h-5" style={{ color: '#8696a0' }} />
            </button>
            <textarea
              ref={textareaRef}
              value={replyText}
              onChange={(e) => { setReplyText(e.target.value); autoResize(); emitTyping(); }}
              onKeyDown={onKeyDown}
              placeholder="Message"
              className="flex-1 bg-transparent resize-none outline-none text-[15px] leading-relaxed py-1 self-end"
              style={{
                color: '#111b21',
                minHeight: '24px',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
              rows={1}
            />
          </div>

          {/* Send */}
          <button
            onClick={sendReply}
            disabled={!canSend}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 self-end transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
            style={{
              background: canSend ? '#25D366' : '#aebbc1',
              boxShadow: canSend ? '0 2px 10px rgba(37,211,102,0.45)' : 'none',
            }}
            aria-label="Send reply"
          >
            {posting
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : <Send className="w-5 h-5 text-white" style={{ marginLeft: '1px' }} />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreadViewer;
