import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Send, Check, CheckCheck, Loader2, MessageCircle, Search, Image, X, RefreshCw
} from 'lucide-react';
import { useGetUserInfo } from '../../../hooks/auth/useGetUserInfo';
import {
  useConversations,
  useDirectMessages,
  useSendDirectMessage,
  useGetOrCreateConversation,
  useMarkMessagesAsSeen,
  useTypingIndicator,
  useOnlinePresence,
  useUserProfile,
  useUpsertUserProfile,
} from '../../../hooks/useDirectMessages';
import { DirectMessage, Conversation } from '../../../lib/supabase';
import VerifiedBadge from '../../../components/community/VerifiedBadge';
import { supabase } from '../../../lib/supabase';

// Helpers
const AVATAR_COLORS = [
  'from-teal-400 to-cyan-400',
  'from-blue-400 to-indigo-400',
  'from-pink-400 to-rose-400',
  'from-amber-400 to-orange-400',
  'from-emerald-400 to-teal-400',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateChip(date: string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatConvTime(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function groupByDate(msgs: DirectMessage[]) {
  const groups: { date: string; items: DirectMessage[] }[] = [];
  for (const m of msgs) {
    const chip = formatDateChip(m.created_at);
    const last = groups[groups.length - 1];
    if (last && last.date === chip) { last.items.push(m); }
    else { groups.push({ date: chip, items: [m] }); }
  }
  return groups;
}

// Tick component
const Ticks: React.FC<{ msg: DirectMessage; myId: string }> = ({ msg, myId }) => {
  if (msg.sender_id !== myId) return null;
  if (msg.is_seen) return <CheckCheck className="w-3.5 h-3.5" style={{ color: '#53bdeb' }} />;
  if (msg.is_delivered) return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
  return <Check className="w-3.5 h-3.5 text-gray-400" />;
};

// Typing indicator
const TypingIndicator: React.FC = () => (
  <div className="flex items-end gap-1.5 mb-1 wa-msg-in">
    <div className="wa-bubble-in px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center h-4">
        <div className="wa-typing-dot" />
        <div className="wa-typing-dot" />
        <div className="wa-typing-dot" />
      </div>
    </div>
  </div>
);

// Safe Image component
const SafeImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 rounded-lg ${className}`}>
        <span className="text-xs text-slate-400 p-2">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && <div className={`absolute inset-0 wa-skeleton rounded-lg ${className}`} />}
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onLoad={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
      />
    </div>
  );
};

// Conversation list item
const ConvItem: React.FC<{
  conv: Conversation;
  myId: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ conv, myId, isActive, onClick }) => {
  const otherId = conv.participant_a === myId ? conv.participant_b : conv.participant_a;
  const { profile } = useUserProfile(otherId);
  const name = profile?.display_name || otherId;
  const avatar = profile?.avatar_url;
  const gradient = getAvatarColor(name);
  const initials = getInitials(name);
  const [avatarError, setAvatarError] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 wa-conv-item border-b border-[#e9edef] text-left transition-colors ${
        isActive ? 'bg-[#f0fdf4]' : 'bg-white hover:bg-[#f5f5f5]'
      }`}
    >
      <div className="relative flex-shrink-0">
        {avatar && !avatarError ? (
          <img
            src={avatar}
            alt={name}
            crossOrigin="anonymous"
            className="w-12 h-12 rounded-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold`}>
            {initials}
          </div>
        )}
        {profile?.is_online && (
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-semibold text-[#111b21] text-sm truncate">{name}</span>
            {profile?.is_verified && <VerifiedBadge size="sm" />}
          </div>
          <span className="text-[11px] text-[#8696a0] flex-shrink-0 ml-2">{formatConvTime(conv.last_message_at)}</span>
        </div>
        {conv.last_message && (
          <p className="text-xs text-[#667781] truncate mt-0.5">{conv.last_message}</p>
        )}
      </div>
    </button>
  );
};

// Main MessagingPage
const MessagingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { studentDetails, gettingStudentDetails } = useGetUserInfo();
  const myId = studentDetails?.userID || '';
  const myName = studentDetails?.firstName && studentDetails?.lastName
    ? `${studentDetails.firstName} ${studentDetails.lastName}`
    : 'Student';
  const myAvatar = studentDetails?.profileImageURL || undefined;

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeOtherId, setActiveOtherId] = useState<string | null>(null);
  const [activeOtherName, setActiveOtherName] = useState('');
  const [text, setText] = useState('');
  const [convSearch, setConvSearch] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set());

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { conversations, loading: convsLoading } = useConversations(myId);
  const { messages, loading: msgsLoading } = useDirectMessages(activeConvId || undefined);
  const { sendMessage, sending } = useSendDirectMessage();
  const { getOrCreate } = useGetOrCreateConversation();
  const { markSeen } = useMarkMessagesAsSeen();
  const { otherTyping, sendTyping } = useTypingIndicator(activeConvId || '', myId);
  const { upsert: upsertProfile } = useUpsertUserProfile();
  const { profile: otherProfile } = useUserProfile(activeOtherId || undefined);

  // Upsert own profile on mount
  useEffect(() => {
    if (studentDetails?.userID) {
      upsertProfile(studentDetails.userID, myName, myAvatar);
    }
  }, [studentDetails?.userID]);

  // Track online presence
  useOnlinePresence(myId || undefined);

  // Handle ?with=userId&name=... deep-link
  useEffect(() => {
    const withId = searchParams.get('with');
    const withName = searchParams.get('name');
    if (withId && myId && withId !== myId) {
      openConversationWith(withId, withName || withId);
    }
  }, [myId, searchParams.get('with')]);

  const openConversationWith = useCallback(async (otherId: string, otherName: string) => {
    if (!myId || myId === otherId) return;
    const convId = await getOrCreate(myId, otherId);
    if (convId) {
      setActiveConvId(convId);
      setActiveOtherId(otherId);
      setActiveOtherName(otherName);
    } else {
      toast.error('Could not open conversation.');
    }
  }, [myId, getOrCreate]);

  // Mark seen when opening a conversation
  useEffect(() => {
    if (activeConvId && myId) {
      markSeen(activeConvId, myId);
    }
  }, [activeConvId, messages.length]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleSend = useCallback(async () => {
    if (!text.trim() && !imageFile) return;
    if (!activeConvId || !myId || !activeOtherId) return;

    const optimisticText = text.trim();
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    let imgUrl: string | undefined;

    if (imageFile) {
      setUploadingImg(true);
      try {
        const ext = imageFile.name.split('.').pop();
        const path = `dm/${activeConvId}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('community-images').upload(path, imageFile, { upsert: true });
        if (!error) {
          const { data: pub } = supabase.storage.from('community-images').getPublicUrl(path);
          imgUrl = pub.publicUrl;
        }
      } catch {
        toast.error('Image upload failed');
      } finally {
        setUploadingImg(false);
        setImageFile(null);
        setImagePreview(null);
      }
    }

    const result = await sendMessage(activeConvId, myId, activeOtherId, optimisticText || (imgUrl ? 'Image' : ''), imgUrl);
    if (!result) {
      toast.error('Failed to send. Tap to retry.');
    }
  }, [text, imageFile, activeConvId, myId, activeOtherId, sendMessage]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.currentTarget.value = '';
  };

  const groups = groupByDate(messages);

  const filteredConvs = conversations.filter((c) => {
    const otherId = c.participant_a === myId ? c.participant_b : c.participant_a;
    return otherId.toLowerCase().includes(convSearch.toLowerCase()) ||
      (c.last_message || '').toLowerCase().includes(convSearch.toLowerCase());
  });

  if (gettingStudentDetails) {
    return (
      <div className="flex items-center justify-center bg-[#f0f2f5]" style={{ height: '100dvh' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#25D366]" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-white overflow-hidden" style={{ height: '100dvh' }}>

      {/* Sidebar: Conversation List */}
      <div className={`
        border-r border-[#e9edef] flex flex-col bg-white
        ${activeConvId
          ? 'hidden md:flex md:w-[340px] lg:w-[380px] flex-shrink-0'
          : 'flex w-full md:w-[340px] lg:w-[380px] flex-shrink-0'
        }
      `}>

        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)' }}>
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-white font-bold text-base flex-1">Messages</h1>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-[#f0f2f5] border-b border-[#e9edef]">
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2">
            <Search className="w-4 h-4 text-[#8696a0]" />
            <input
              type="text"
              placeholder="Search conversations"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-[#111b21] placeholder-[#8696a0]"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto wa-scroll">
          {convsLoading ? (
            <div className="space-y-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#e9edef]">
                  <div className="w-12 h-12 rounded-full wa-skeleton flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="wa-skeleton h-3.5 w-28 rounded" />
                    <div className="wa-skeleton h-3 w-40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center mb-3">
                <MessageCircle className="w-8 h-8 text-[#25D366]" />
              </div>
              <p className="text-[#111b21] font-semibold text-sm">No conversations yet</p>
              <p className="text-[#8696a0] text-xs mt-1 text-pretty">
                Click on someone&apos;s profile in the Community to start chatting.
              </p>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <ConvItem
                key={conv.id}
                conv={conv}
                myId={myId}
                isActive={conv.id === activeConvId}
                onClick={() => {
                  const otherId = conv.participant_a === myId ? conv.participant_b : conv.participant_a;
                  setActiveConvId(conv.id);
                  setActiveOtherId(otherId);
                  setActiveOtherName(otherId);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeConvId ? (
        <div className="flex-1 flex flex-col min-w-0 w-full">

          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)' }}>
            <button
              onClick={() => { setActiveConvId(null); setActiveOtherId(null); }}
              className="md:hidden p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>

            {/* Other user avatar */}
            {otherProfile?.avatar_url ? (
              <img
                src={otherProfile.avatar_url}
                alt={activeOtherName}
                crossOrigin="anonymous"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/40 flex-shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(activeOtherName)} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/40 flex-shrink-0`}>
                {getInitials(activeOtherName)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-sm truncate">
                  {otherProfile?.display_name || activeOtherName}
                </span>
                {otherProfile?.is_verified && <VerifiedBadge size="sm" />}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {otherTyping ? (
                  <span className="text-green-100 text-xs font-medium">typing...</span>
                ) : otherProfile?.is_online ? (
                  <span className="text-green-100 text-xs">Online</span>
                ) : (
                  <span className="text-green-100/70 text-xs">
                    {otherProfile?.last_seen
                      ? `Last seen ${new Date(otherProfile.last_seen).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}`
                      : 'Offline'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 wa-scroll wa-chat-bg">
            {msgsLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? '' : 'flex-row-reverse'} gap-2`}>
                    <div className={`wa-skeleton rounded-2xl h-10 ${i % 2 === 0 ? 'w-48' : 'w-40'}`} />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <MessageCircle className="w-8 h-8 text-[#25D366]" />
                </div>
                <p className="text-[#54656f] font-semibold text-sm">Say hello!</p>
                <p className="text-[#8696a0] text-xs mt-1">Send your first message below.</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {groups.map((group) => (
                  <div key={group.date}>
                    <div className="flex justify-center my-3">
                      <span className="wa-date-chip">{group.date}</span>
                    </div>
                    {group.items.map((msg, idx) => {
                      const isMe = msg.sender_id === myId;
                      const prevSame = idx > 0 && group.items[idx - 1].sender_id === msg.sender_id;
                      const nextSame = idx < group.items.length - 1 && group.items[idx + 1].sender_id === msg.sender_id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-0.5 ${isMe ? 'wa-msg-out' : 'wa-msg-in'}`}
                        >
                          <div
                            className={`max-w-[80%] sm:max-w-[70%] px-3 py-2 shadow-sm text-sm leading-relaxed ${
                              isMe ? 'wa-bubble-out' : 'wa-bubble-in'
                            } ${isMe ? (nextSame ? 'rounded-br-sm' : '') : (nextSame ? 'rounded-bl-sm' : '')}`}
                          >
                            {/* Image */}
                            {msg.image_url && (
                              <SafeImage
                                src={msg.image_url}
                                alt="attachment"
                                className="rounded-lg max-w-full mb-1"
                              />
                            )}
                            <p className="break-words whitespace-pre-wrap text-[#111b21]">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[10px]" style={{ color: isMe ? '#667781' : '#8696a0' }}>
                                {formatTime(msg.created_at)}
                              </span>
                              <Ticks msg={msg} myId={myId} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {otherTyping && <TypingIndicator />}
                <div ref={bottomRef} className="h-1" />
              </div>
            )}
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-3">
              <div className="relative">
                <img src={imagePreview} alt="preview" className="h-14 w-14 object-cover rounded-xl border border-slate-200" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 flex-1">Ready to send</p>
            </div>
          )}

          {/* Input area */}
          <div
            className="flex-shrink-0 bg-[#f0f2f5] px-3 pt-2.5 flex items-end gap-2"
            style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Image upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImg}
              className="p-2.5 bg-white rounded-full shadow-sm hover:bg-slate-100 transition-colors text-slate-500 disabled:opacity-50 flex-shrink-0"
            >
              {uploadingImg ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#25D366]" />
              ) : (
                <Image className="w-4 h-4" />
              )}
            </button>

            <div className="flex-1 bg-white rounded-2xl px-4 py-2.5 flex items-end gap-2 min-h-[44px] shadow-sm">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => { setText(e.target.value); autoResize(); sendTyping(); }}
                onKeyDown={onKeyDown}
                placeholder="Type a message"
                className="flex-1 text-sm bg-transparent outline-none resize-none placeholder-[#8696a0] text-[#111b21] leading-relaxed"
                style={{ minHeight: '20px', maxHeight: '120px', overflowY: 'auto' }}
                rows={1}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || uploadingImg || (!text.trim() && !imageFile)}
              className="w-11 h-11 rounded-full flex items-center justify-center wa-send-pulse flex-shrink-0 transition-all active:scale-95"
              style={{ background: (text.trim() || imageFile) && !sending ? '#25D366' : '#ccc' }}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4 text-white" style={{ marginLeft: '2px' }} />
              )}
            </button>
          </div>
        </div>
      ) : (
        /* No conversation selected - desktop placeholder */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#f0f2f5]">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm">
            <MessageCircle className="w-12 h-12 text-[#25D366]" />
          </div>
          <h2 className="text-[#41525d] font-semibold text-lg">EBSU Messages</h2>
          <p className="text-[#8696a0] text-sm mt-2 text-center max-w-xs text-pretty">
            Select a conversation from the list, or click &quot;Message&quot; on any student&apos;s profile.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessagingPage;
