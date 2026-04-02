import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Send, Smile, Loader2, Heart, MessageSquare,
  Pin, CheckCheck, Check, MoreVertical, Trash2, Edit2,
} from 'lucide-react';
import { supabase, Community, CommunityReply } from '../../../lib/supabase';
import { useGetUserInfo } from '../../../hooks/auth/useGetUserInfo';
import { useCommunityReplies, usePostReply, useLikeMessage } from '../../../hooks/useCommunity';
import { useAnyUserVerification } from '../../../hooks/usePrivateChat';
import VerifiedBadge from '../../../components/community/VerifiedBadge';

// ── helpers ───────────────────────────────────────────────────────────────
const GRADS = [
  ['#00897b', '#26a69a'], ['#1976d2', '#42a5f5'], ['#e91e63', '#f06292'],
  ['#f57c00', '#ffb74d'], ['#388e3c', '#66bb6a'], ['#7b1fa2', '#ba68c8'],
];
function grad(name: string): [string, string] {
  let h = 0; for (const c of name) h += c.charCodeAt(0);
  return GRADS[h % GRADS.length] as [string, string];
}
function initials(name: string) {
  return name.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase();
}
function fmtTime(date: string) {
  return new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
}
function fmtFull(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

// ── Typing indicator ──────────────────────────────────────────────────────
const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 px-3 py-2 bg-white rounded-2xl rounded-bl-none shadow-sm w-14">
    {[0, 1, 2].map((i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

// ── Ticks ─────────────────────────────────────────────────────────────────
const Ticks: React.FC<{ seen?: boolean; optimistic?: boolean }> = ({ seen, optimistic }) => {
  if (optimistic) return <Check className="w-3 h-3 text-[#8696a0]" />;
  return seen
    ? <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
    : <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />;
};

// ── Avatar ────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string; avatar?: string; size?: number }> = ({ name, avatar, size = 36 }) => {
  const [g0, g1] = grad(name);
  return avatar ? (
    <img src={avatar} alt={name} crossOrigin="anonymous"
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
  ) : (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${g0}, ${g1})`, fontSize: size * 0.3 }}>
      {initials(name)}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────
const CommentSkeleton: React.FC<{ right?: boolean }> = ({ right }) => (
  <div className={`flex items-end gap-2 px-4 py-1 ${right ? 'flex-row-reverse' : ''}`}>
    {!right && <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />}
    <div className={`h-12 bg-gray-200 animate-pulse rounded-2xl ${right ? 'rounded-br-none w-40' : 'rounded-bl-none w-52'}`} />
  </div>
);

// ── Post detail (original message) ───────────────────────────────────────
const PostDetail: React.FC<{
  post: Community;
  isOwn: boolean;
  likeCount: number;
  liked: boolean;
  onLike: () => void;
  replyCount: number;
}> = ({ post, isOwn, likeCount, liked, onLike, replyCount }) => {
  const [g0, g1] = grad(post.user_name);
  const { verification } = useAnyUserVerification(post.user_id);

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-4">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={post.user_name} avatar={post.user_avatar} size={42} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#111b21] text-[15px] truncate">{post.user_name}</span>
            {verification?.is_verified && <VerifiedBadge size={14} />}
            {isOwn && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                style={{ background: '#25D366' }}>You</span>
            )}
          </div>
          <p className="text-xs text-gray-400">{fmtFull(post.created_at)}{post.is_edited ? ' · edited' : ''}</p>
        </div>
        {post.is_pinned && (
          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
            <Pin className="w-3.5 h-3.5" /> Pinned
          </div>
        )}
      </div>

      {/* Message body */}
      <p className="text-[15px] text-[#111b21] leading-relaxed whitespace-pre-wrap break-words mb-3">
        {post.message}
      </p>

      {/* Images */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className={`grid gap-1.5 mb-3 ${post.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.image_urls.slice(0, 4).map((url, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden bg-gray-100"
              style={{ aspectRatio: post.image_urls!.length === 1 ? '16/9' : '1' }}>
              <img src={url} alt="" crossOrigin="anonymous"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.background = '#f3f4f6'; }} />
            </div>
          ))}
        </div>
      )}

      {/* Topic chip */}
      {post.topic && post.topic !== 'General' && (
        <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#075E54]/10 text-[#075E54] mb-3">
          {post.topic}
        </span>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <button onClick={onLike}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors active:scale-95"
          style={{ color: liked ? '#e91e63' : '#8696a0' }}>
          <Heart className={`w-4.5 h-4.5 ${liked ? 'fill-current' : ''}`} style={{ width: 18, height: 18 }} />
          {likeCount > 0 && <span>{likeCount}</span>}
          <span>{liked ? 'Liked' : 'Like'}</span>
        </button>
        <div className="flex items-center gap-1.5 text-sm text-[#8696a0]">
          <MessageSquare style={{ width: 18, height: 18 }} />
          <span>{replyCount} {replyCount === 1 ? 'comment' : 'comments'}</span>
        </div>
      </div>
    </div>
  );
};

// ── Comment bubble ────────────────────────────────────────────────────────
const CommentBubble: React.FC<{
  reply: CommunityReply;
  isOwn: boolean;
  isOpt?: boolean;
  prevSame: boolean;
  nextSame: boolean;
}> = ({ reply, isOwn, isOpt, prevSame, nextSame }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [g0] = grad(reply.user_name);

  const br = isOwn
    ? nextSame ? '16px 4px 16px 16px' : '16px 0px 16px 16px'
    : nextSame ? '4px 16px 16px 16px' : '0px 16px 16px 16px';

  return (
    <div
      className={`flex items-end gap-2 px-4 ${isOwn ? 'flex-row-reverse' : ''}`}
      style={{ marginTop: prevSame ? '2px' : '8px', opacity: isOpt ? 0.7 : 1 }}
    >
      {/* Avatar — only on last of group */}
      <div className="w-8 flex-shrink-0 self-end">
        {!isOwn && !nextSame && (
          <Avatar name={reply.user_name} avatar={reply.user_avatar} size={32} />
        )}
      </div>

      <div className={`max-w-[78%] sm:max-w-[65%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Name on first of incoming group */}
        {!isOwn && !prevSame && (
          <span className="text-[11px] font-bold px-1 pb-0.5" style={{ color: g0 }}>
            {reply.user_name}
          </span>
        )}

        <div className="relative shadow-sm group"
          style={{ background: isOwn ? '#dcf8c6' : '#fff', borderRadius: br, padding: '7px 12px 5px 12px' }}>
          <p className="text-[14px] text-[#111b21] leading-relaxed break-words whitespace-pre-wrap">
            {reply.reply}
          </p>
          <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-[#8696a0]">{fmtTime(reply.created_at)}</span>
            {reply.is_edited && <span className="text-[10px] text-[#8696a0]">· edited</span>}
            {isOwn && <Ticks seen={false} optimistic={isOpt} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────
const PostDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug, postId } = useParams<{ slug: string; postId: string }>();

  const { studentDetails, userID } = useGetUserInfo();
  const userId = userID ?? 'anonymous';
  const userName = studentDetails?.firstName && studentDetails?.lastName
    ? `${studentDetails.firstName} ${studentDetails.lastName}` : 'Student';
  const userAvatar = studentDetails?.profileImageURL || undefined;

  const [post, setPost] = useState<Community | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [optimisticReplies, setOptimisticReplies] = useState<CommunityReply[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const { replies, loading: loadingReplies } = useCommunityReplies(postId ?? '');
  const { likeMessage, unlikeMessage } = useLikeMessage();

  // Fetch post + like status
  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      setLoadingPost(true);
      const { data } = await supabase
        .from('community_messages')
        .select('*')
        .eq('id', postId)
        .single();
      if (data) {
        setPost(data as Community);
        setLikeCount(data.likes_count ?? 0);
      }
      setLoadingPost(false);
    };
    fetchPost();
  }, [postId]);

  // Check if current user already liked this post
  useEffect(() => {
    if (!postId || !userId || userId === 'anonymous') return;
    supabase
      .from('community_likes')
      .select('id')
      .eq('message_id', postId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [postId, userId]);

  // Typing broadcast
  useEffect(() => {
    if (!postId) return;
    broadcastRef.current = supabase.channel(`post-typing:${postId}`, {
      config: { broadcast: { self: false } },
    });
    broadcastRef.current
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === userId) return;
        setTypingUser(payload.userName || 'Someone');
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTypingUser(null), 3000);
      })
      .subscribe();
    return () => {
      broadcastRef.current?.unsubscribe();
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [postId, userId]);

  // Auto-scroll on new replies
  useEffect(() => {
    if (!loadingReplies) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [replies, loadingReplies]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const emitTyping = () => {
    broadcastRef.current?.send({
      type: 'broadcast', event: 'typing', payload: { userId, userName },
    });
  };

  const handleLike = useCallback(async () => {
    if (userId === 'anonymous' || !postId) return;
    if (liked) {
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      await unlikeMessage(postId, userId);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await likeMessage(postId, userId);
    }
  }, [liked, postId, userId, likeMessage, unlikeMessage]);

  const handleSend = useCallback(async () => {
    const text = replyText.trim();
    if (!text || posting || !postId) return;
    setPosting(true);
    const optId = `opt-${Date.now()}`;
    const optimistic: CommunityReply = {
      id: optId,
      message_id: postId,
      user_id: userId,
      user_name: userName,
      user_avatar: userAvatar,
      reply: text,
      created_at: new Date().toISOString(),
      is_edited: false,
      is_deleted: false,
    };
    setOptimisticReplies((p) => [...p, optimistic]);
    setReplyText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      const { error } = await supabase.from('community_replies').insert([{
        message_id: postId,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        reply: text,
        created_at: optimistic.created_at,
      }]);
      if (error) throw error;
    } catch {
      toast.error('Failed to post comment. Try again.');
      setOptimisticReplies((p) => p.filter((r) => r.id !== optId));
      setReplyText(text);
    } finally {
      setOptimisticReplies((p) => p.filter((r) => r.id !== optId));
      setPosting(false);
    }
  }, [replyText, posting, postId, userId, userName, userAvatar]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend();
  };

  // Merge confirmed + optimistic replies, dedup
  const confirmedIds = new Set(replies.map((r) => r.id));
  const allReplies = [
    ...replies,
    ...optimisticReplies.filter((r) => !confirmedIds.has(r.id)),
  ];

  const canSend = replyText.trim().length > 0 && !posting;

  const [g0, g1] = grad(userName);
  const myInitials = userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: '#f0f2f5' }}>

      {/* HEADER */}
      <header className="flex-shrink-0 z-20 shadow-md" style={{ background: '#075E54' }}>
        <div className="flex items-center h-14 px-3 gap-2.5">
          <button onClick={() => navigate(slug ? `/u/community/${slug}` : -1 as any)}
            className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors text-white flex-shrink-0"
            aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-[15px] leading-tight truncate">Post</p>
              <p className="text-white/70 text-xs">
                {loadingReplies ? 'loading...' : `${allReplies.length} comment${allReplies.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* SCROLL AREA */}
      <div className="flex-1 overflow-y-auto"
        style={{
          background: '#e5ddd5',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {/* Post detail card */}
        {loadingPost ? (
          <div className="bg-white border-b border-gray-100 p-4 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
              <div className="h-4 bg-gray-100 rounded w-3/5" />
            </div>
          </div>
        ) : post ? (
          <PostDetail
            post={post}
            isOwn={post.user_id === userId}
            likeCount={likeCount}
            liked={liked}
            onLike={handleLike}
            replyCount={allReplies.length}
          />
        ) : (
          <div className="bg-white p-8 text-center text-gray-400">
            Post not found.
          </div>
        )}

        {/* Comments section */}
        <div className="py-2">
          {/* Comments header chip */}
          <div className="flex justify-center my-3">
            <span className="px-4 py-1 rounded-full text-xs font-semibold shadow-sm text-[#54656f]"
              style={{ background: 'rgba(255,255,255,0.85)' }}>
              {allReplies.length > 0 ? 'Comments' : 'Be the first to comment'}
            </span>
          </div>

          {/* Skeletons */}
          {loadingReplies && (
            <div className="space-y-1">
              {[false, true, false, false].map((r, i) => <CommentSkeleton key={i} right={r} />)}
            </div>
          )}

          {/* Comment bubbles */}
          {!loadingReplies && allReplies.map((reply, idx) => {
            const prev = allReplies[idx - 1];
            const next = allReplies[idx + 1];
            const prevSame = !!prev && prev.user_id === reply.user_id &&
              (new Date(reply.created_at).getTime() - new Date(prev.created_at).getTime()) < 5 * 60 * 1000;
            const nextSame = !!next && next.user_id === reply.user_id &&
              (new Date(next.created_at).getTime() - new Date(reply.created_at).getTime()) < 5 * 60 * 1000;
            return (
              <CommentBubble
                key={reply.id}
                reply={reply}
                isOwn={reply.user_id === userId}
                isOpt={reply.id.startsWith('opt-')}
                prevSame={prevSame}
                nextSame={nextSame}
              />
            );
          })}

          {/* Typing indicator */}
          {typingUser && (
            <div className="flex items-end gap-2 px-4 mt-2">
              <div className="w-8 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold px-1 pb-0.5 block" style={{ color: grad(typingUser)[0] }}>
                  {typingUser}
                </span>
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* COMPOSER */}
      <div
        className="flex-shrink-0 flex items-end gap-2 px-2 py-2"
        style={{ background: '#f0f2f5', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Avatar */}
        {userAvatar ? (
          <img src={userAvatar} alt={userName} crossOrigin="anonymous"
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 self-end mb-0.5"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end mb-0.5"
            style={{ background: `linear-gradient(135deg, ${g0}, ${g1})` }}>
            {myInitials}
          </div>
        )}

        {/* Input capsule */}
        <div className="flex-1 flex items-end gap-1 rounded-3xl px-3 py-1.5 min-h-[42px] shadow-sm bg-white">
          <button className="p-1.5 rounded-full hover:bg-[#f0f2f5] transition-colors flex-shrink-0 self-end mb-0.5">
            <Smile className="w-5 h-5 text-[#8696a0]" />
          </button>
          <textarea
            ref={textareaRef}
            value={replyText}
            onChange={(e) => { setReplyText(e.target.value); autoResize(); emitTyping(); }}
            onKeyDown={onKeyDown}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent resize-none outline-none text-[15px] leading-relaxed py-1 self-end text-[#111b21] placeholder-[#8696a0]"
            style={{ minHeight: '24px', maxHeight: '120px', overflowY: 'auto' }}
            rows={1}
          />
        </div>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 self-end transition-all active:scale-95 disabled:cursor-not-allowed"
          style={{
            background: canSend ? '#25D366' : '#aebbc1',
            boxShadow: canSend ? '0 2px 10px rgba(37,211,102,0.45)' : 'none',
          }}
          aria-label="Post comment"
        >
          {posting
            ? <Loader2 className="w-5 h-5 text-white animate-spin" />
            : <Send className="w-5 h-5 text-white" style={{ marginLeft: '1px' }} />
          }
        </button>
      </div>
    </div>
  );
};

export default PostDetailPage;
