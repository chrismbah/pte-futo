import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Send, Search, Smile, X, Loader2, Paperclip, Users,
  MessageSquare, RefreshCw, Lock,
} from 'lucide-react';
import { useGetUserInfo } from '../../../hooks/auth/useGetUserInfo';
import {
  useCommunityBySlug, useCommunityMembership,
  useCommunityPosts, usePostToCommunity,
} from '../../../hooks/useCommunities';
import { useDeleteMessage, useEditMessage } from '../../../hooks/useCommunity';
import { useImageUpload } from '../../../hooks/useCommunityFeatures';
import { useGetOrCreateChat } from '../../../hooks/usePrivateChat';
import MessageCard from '../../../components/community/MessageCard';
import ProfileModal from '../../../components/community/ProfileModal';
import { StickerPicker } from '../../../components/community/StickerPicker';
import { playSound } from '../../../hooks/useSound';

// helpers
function fmtDateChip(date: string) {
  const d = new Date(date);
  const now = new Date();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

type Post = ReturnType<typeof useCommunityPosts>['posts'][number];
type MsgGroup = { date: string; messages: Post[] };

function groupByDate(msgs: Post[]): MsgGroup[] {
  const map = new Map<string, Post[]>();
  for (const m of msgs) {
    const key = new Date(m.created_at).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries()).map(([date, messages]) => ({ date, messages }));
}

const COLORS = ['#25D366','#075E54','#128C7E','#34B7F1','#6B7280','#EF4444','#F59E0B','#8B5CF6'];
function colorFor(s: string) { return COLORS[s.charCodeAt(0) % COLORS.length]; }
function initFor(name: string) {
  const p = name.trim().split(' ');
  return (p[0]?.[0] ?? '') + (p[1]?.[0] ?? '');
}

const CommunityPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { studentDetails, gettingStudentDetails, userID } = useGetUserInfo();
  const userId   = userID ?? '';
  const userName = studentDetails
    ? `${studentDetails.firstName} ${studentDetails.lastName}` : 'Student';
  const userAvatar = studentDetails?.profileImageURL ?? undefined;

  const [newMessage,    setNewMessage]    = useState('');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [showStickers,  setShowStickers]  = useState(false);
  const [profileTarget, setProfileTarget] = useState<{ userId: string; userName: string; userAvatar?: string } | null>(null);
  const [imageUrls,     setImageUrls]     = useState<string[]>([]);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const feedRef      = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { community: comm, loading: loadingComm } = useCommunityBySlug(slug ?? '');
  const { isMember, toggling, toggle } = useCommunityMembership(comm?.id ?? '', userId);
  const { posts, loading: loadingPosts, error: postsError } = useCommunityPosts(comm?.id ?? null);
  const { post, posting } = usePostToCommunity();
  const { deleteMessage } = useDeleteMessage();
  const { editMessage }   = useEditMessage();
  const { uploading, uploadImages } = useImageUpload();
  const { getOrCreateChat } = useGetOrCreateChat();

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [posts.length]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (imageUrls.length + files.length > 4) {
      toast.error('Max 4 images per post');
      return;
    }
    const urls = await uploadImages(files);
    setImageUrls((prev) => [...prev, ...urls]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [imageUrls.length, uploadImages]);

  const removeImageUrl = (i: number) =>
    setImageUrls((prev) => prev.filter((_, idx) => idx !== i));

  const canPost = (newMessage.trim().length > 0 || imageUrls.length > 0) && !posting && isMember;

  const handlePost = async () => {
    if (!canPost || !comm) return;
    const text = newMessage.trim();
    setNewMessage('');
    setImageUrls([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      await post({
        communityId: comm.id,
        userId,
        userName,
        userAvatar,
        message: text || ' ',
        imageUrls,
      });
      playSound('send');
    } catch {
      toast.error('Failed to post. Please try again.');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  const handleMessageUser = async (targetId: string, targetName: string) => {
    setProfileTarget(null);
    try {
      const chat = await getOrCreateChat(userId, targetId, userName, targetName, userAvatar);
      if (chat?.id) navigate(`/u/chat/${chat.id}`);
    } catch {
      toast.error('Could not open chat');
    }
  };

  const handleAvatarClick = (uid: string, uname: string, uavatar?: string) => {
    if (uid !== userId) setProfileTarget({ userId: uid, userName: uname, userAvatar: uavatar });
  };

  const filteredPosts = searchQuery.trim()
    ? posts.filter((p) =>
        p.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts;

  const pinnedPosts  = filteredPosts.filter((p) => p.is_pinned);
  const regularPosts = filteredPosts.filter((p) => !p.is_pinned);
  const grouped      = groupByDate([...pinnedPosts, ...regularPosts].slice().reverse());

  const communityColor = comm?.color ?? '#075E54';

  if (gettingStudentDetails || loadingComm) {
    return (
      <div className="flex items-center justify-center bg-[#f0f2f5]" style={{ height: '100dvh' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: communityColor }} />
          <p className="text-slate-500 text-sm">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!comm) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 bg-[#f0f2f5]" style={{ height: '100dvh' }}>
        <p className="text-[#111b21] font-semibold text-lg">Community not found</p>
        <button
          onClick={() => navigate('/u/community')}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-full text-white"
          style={{ background: communityColor }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Communities
        </button>
      </div>
    );
  }

  const g0 = colorFor(userName);
  const g1 = colorFor(userName.split('').reverse().join(''));
  const initials = initFor(userName);

  return (
    <React.Fragment>
      <StickerPicker
        userId={userId}
        isOpen={showStickers}
        onClose={() => setShowStickers(false)}
        onSelectSticker={(s) => {
          setNewMessage((p) => p + ` ${s.image_url} `);
          setShowStickers(false);
        }}
      />

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

      <div
        className="flex flex-col overflow-hidden"
        style={{ height: '100dvh', background: '#f0f2f5' }}
      >
        {/* HEADER */}
        <header
          className="flex-shrink-0 flex items-center gap-3 px-3 py-2.5 z-20 shadow-sm"
          style={{ background: communityColor }}
        >
          <button
            onClick={() => navigate('/u/community')}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            {comm.icon}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[15px] leading-tight truncate">{comm.name}</p>
            <p className="text-white/70 text-[11px] truncate">
              <Users className="w-3 h-3 inline mr-0.5" />
              {comm.member_count.toLocaleString()} members
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              disabled={toggling}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 disabled:opacity-60"
              style={
                isMember
                  ? { background: 'rgba(255,255,255,0.15)', color: '#fff' }
                  : { background: '#fff', color: communityColor }
              }
            >
              {toggling ? '...' : isMember ? 'Joined' : 'Join'}
            </button>

            <button
              onClick={() => setSearchVisible((v) => !v)}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              {searchVisible
                ? <X className="w-5 h-5 text-white" />
                : <Search className="w-5 h-5 text-white" />
              }
            </button>
          </div>
        </header>

        {/* Search bar */}
        {searchVisible && (
          <div className="flex-shrink-0 px-3 py-2 bg-white border-b border-gray-100">
            <div className="flex items-center gap-2 bg-[#f0f2f5] rounded-full px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="flex-1 bg-transparent outline-none text-sm text-[#111b21] placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">

          {/* COMPOSER */}
          <div className="flex-shrink-0 bg-[#f0f2f5]">
            {imageUrls.length > 0 && (
              <div className="flex gap-2 px-3 pt-2 pb-1 overflow-x-auto scrollbar-hide">
                {imageUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 shadow-sm group"
                    style={{ borderColor: `${communityColor}30` }}
                  >
                    <img
                      src={url}
                      alt=""
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.style.display = 'none';
                      }}
                    />
                    <button
                      onClick={() => removeImageUrl(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 px-2 py-2">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  crossOrigin="anonymous"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 self-end mb-0.5"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold self-end mb-0.5"
                  style={{ background: `linear-gradient(135deg, ${g0}, ${g1})` }}
                >
                  {initials}
                </div>
              )}

              <div className="flex-1 flex items-end gap-1 rounded-3xl px-2 py-1.5 min-h-[42px] shadow-sm bg-white">
                <button
                  onClick={() => setShowStickers(true)}
                  className="p-1.5 rounded-full hover:bg-[#f0f2f5] transition-colors flex-shrink-0 self-end mb-0.5"
                  aria-label="Stickers"
                >
                  <Smile className="w-5 h-5 text-[#8696a0]" />
                </button>

                {isMember ? (
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); autoResize(); }}
                    onKeyDown={onKeyDown}
                    placeholder="Share something with the community..."
                    className="flex-1 bg-transparent resize-none outline-none text-[15px] leading-relaxed py-1 self-end text-[#111b21] placeholder:text-gray-400"
                    style={{ minHeight: '24px', maxHeight: '140px', overflowY: 'auto' }}
                    rows={1}
                  />
                ) : (
                  <div className="flex-1 flex items-center gap-1.5 py-1 self-end">
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-400 select-none">Join this community to post</span>
                  </div>
                )}

                <div className="flex items-center flex-shrink-0 self-end mb-0.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading || imageUrls.length >= 4 || !isMember}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || imageUrls.length >= 4 || !isMember}
                    className="p-1.5 rounded-full hover:bg-[#f0f2f5] transition-colors disabled:opacity-40"
                    aria-label="Attach image"
                  >
                    {uploading
                      ? <Loader2 className="w-5 h-5 text-[#8696a0] animate-spin" />
                      : <Paperclip className="w-5 h-5 text-[#8696a0]" />
                    }
                  </button>
                </div>
              </div>

              <button
                onClick={handlePost}
                disabled={!canPost}
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 self-end transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
                style={{
                  background: canPost ? communityColor : '#aebbc1',
                  boxShadow: canPost ? `0 2px 10px ${communityColor}66` : 'none',
                }}
                aria-label="Post"
              >
                {posting
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Send className="w-5 h-5 text-white" style={{ marginLeft: 2 }} />
                }
              </button>
            </div>
          </div>

          {/* FEED */}
          <div
            ref={feedRef}
            className="flex-1 overflow-y-auto"
            style={{
              background: '#e5ddd5',
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          >
            {loadingPosts && (
              <div className="flex flex-col gap-3 p-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-2 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-300 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-300 rounded w-24" />
                      <div className="h-10 bg-white rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingPosts && postsError && (
              <div className="flex flex-col items-center justify-center h-40 gap-3 px-4 text-center">
                <p className="text-sm text-gray-500">{postsError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-white"
                  style={{ background: communityColor }}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            {!loadingPosts && !postsError && filteredPosts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-60 gap-3 px-6 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: `${communityColor}18` }}
                >
                  {comm.icon}
                </div>
                <p className="font-semibold text-[#111b21]">
                  {searchQuery ? 'No posts match your search' : `No posts yet in ${comm.name}`}
                </p>
                {!searchQuery && isMember && (
                  <p className="text-sm text-gray-500">Be the first to post something above!</p>
                )}
                {!searchQuery && !isMember && (
                  <button
                    onClick={toggle}
                    disabled={toggling}
                    className="mt-1 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
                    style={{ background: communityColor }}
                  >
                    {toggling ? '...' : 'Join and Post'}
                  </button>
                )}
              </div>
            )}

            {!loadingPosts && !postsError && grouped.map(({ date, messages }) => (
              <div key={date}>
                <div className="flex justify-center py-3">
                  <span className="bg-white/80 backdrop-blur-sm text-[#54656f] text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                    {fmtDateChip(messages[0].created_at)}
                  </span>
                </div>
                {messages.map((msg, idx) => {
                  const prev = messages[idx - 1];
                  const isGrouped = !!prev &&
                    prev.user_id === msg.user_id &&
                    new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60_000;
                  return (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      isOwn={msg.user_id === userId}
                      prevSameUser={isGrouped}
                      onThreadClick={() => navigate(`/u/community/${slug}/post/${msg.id}`)}
                      onDelete={() => deleteMessage(msg.id)}
                      onEdit={(id, text) => editMessage(id, text)}
                      onAvatarClick={handleAvatarClick}
                      onProfileClick={handleAvatarClick}
                    />
                  );
                })}
              </div>
            ))}

            <div className="h-4" />
          </div>

          {/* Guest join CTA */}
          {!isMember && !loadingPosts && (
            <div
              className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-t"
              style={{ background: '#fff', borderColor: '#e9edef' }}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-500">Join to post and reply in this community</p>
              </div>
              <button
                onClick={toggle}
                disabled={toggling}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
                style={{ background: communityColor }}
              >
                {toggling ? '...' : 'Join'}
              </button>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default CommunityPage;
