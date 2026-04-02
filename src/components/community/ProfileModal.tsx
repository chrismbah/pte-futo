import React, { useEffect, useRef, useState } from 'react';
import { X, MessageCircle, CheckCircle, Clock, User, Shield, Loader2 } from 'lucide-react';
import { useAnyUserVerification } from '../../hooks/usePrivateChat';

interface ProfileModalProps {
  targetUserId: string;
  targetUserName: string;
  targetUserAvatar?: string;
  viewerUserId: string;
  onMessage: () => void;
  onClose: () => void;
  currentUserId?: string;
  onMessageClick?: (userId: string, userName: string) => void;
}

function timeAgoFromISO(iso?: string): string {
  if (!iso) return 'Unknown';
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const AVATAR_COLORS = [
  ['#00897b', '#26a69a'],
  ['#1976d2', '#42a5f5'],
  ['#e91e63', '#f06292'],
  ['#f57c00', '#ffb74d'],
  ['#388e3c', '#66bb6a'],
  ['#7b1fa2', '#ba68c8'],
];

function getAvatarGradient(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] as [string, string];
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  targetUserId,
  targetUserName,
  targetUserAvatar,
  viewerUserId,
  onMessage,
  onClose,
  currentUserId,
  onMessageClick,
}) => {
  const { verification, loading } = useAnyUserVerification(targetUserId);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 150);
  };

  const isOnline = verification?.online_status === 'online';
  const isVerified = verification?.is_verified;
  const [g0, g1] = getAvatarGradient(targetUserName);
  const initials = getInitials(targetUserName);
  const isSelf = targetUserId === viewerUserId || targetUserId === currentUserId;

  const handleMessageClick = () => {
    if (onMessageClick) {
      onMessageClick(targetUserId, targetUserName);
    } else {
      onMessage();
    }
  };

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      {/* Card */}
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          animation: isClosing ? 'none' : 'wa-modal-in 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header banner with gradient */}
        <div 
          className="h-28 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${g0} 0%, ${g1} 100%)` }}
        >
          {/* Decorative pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar (overlapping banner) */}
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              {targetUserAvatar && !imageError ? (
                <img
                  src={targetUserAvatar}
                  alt={targetUserName}
                  crossOrigin="anonymous"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg text-white text-2xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${g0}, ${g1})` }}
                >
                  {initials}
                </div>
              )}
              {/* Online dot */}
              <span
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-white ${
                  isOnline ? 'bg-[#25D366]' : 'bg-slate-300'
                }`}
                style={{ borderWidth: '3px' }}
              />
            </div>

            {/* Verified badge (large) */}
            {isVerified && (
              <div className="flex items-center gap-1.5 bg-[#e8f5fe] px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4 text-[#53bdeb]" strokeWidth={2.5} />
                <span className="text-xs font-semibold text-[#0b93d5]">Verified</span>
              </div>
            )}
          </div>

          {/* Name + badge */}
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{targetUserName}</h2>
            {isVerified && (
              <CheckCircle className="w-5 h-5 text-[#53bdeb] flex-shrink-0" strokeWidth={2.5} />
            )}
          </div>

          {/* Online / last seen */}
          <div className="flex items-center gap-1.5 text-sm mb-4">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                <span className="text-slate-400">Loading...</span>
              </div>
            ) : isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <span className="text-[#25D366] font-medium">Online now</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Last seen {timeAgoFromISO(verification?.last_seen)}</span>
              </>
            )}
          </div>

          {/* Bio */}
          {loading ? (
            <div className="space-y-2 mb-4">
              <div className="h-4 w-3/4 bg-slate-100 rounded wa-skeleton" />
              <div className="h-4 w-1/2 bg-slate-100 rounded wa-skeleton" />
            </div>
          ) : verification?.bio ? (
            <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 mb-4">
              <p className="text-sm text-slate-600 leading-relaxed">{verification.bio}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic mb-4">No bio yet.</p>
          )}

          {/* Verified badge notice */}
          {isVerified && (
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#e8f5fe] to-[#f0fdf4] border border-[#bce8f1] rounded-xl px-4 py-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#53bdeb]/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-[#53bdeb]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0b93d5]">Verified EBSU Student</p>
                <p className="text-xs text-slate-500">Identity confirmed by admin</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isSelf ? (
            <button
              onClick={handleMessageClick}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-[#25D366]/25 active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              Send Message
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm">
              <User className="w-4 h-4" />
              This is your profile
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
