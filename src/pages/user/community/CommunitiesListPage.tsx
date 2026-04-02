import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import { useCommunities } from '../../../hooks/useCommunities';
import { useGetUserInfo } from '../../../hooks/auth/useGetUserInfo';
import { CommunityGroup } from '../../../lib/supabase';

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 animate-pulse">
    <div className="w-14 h-14 rounded-2xl bg-gray-200 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-32" />
      <div className="h-3 bg-gray-100 rounded w-48" />
      <div className="flex gap-3">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    </div>
    <div className="w-20 h-8 bg-gray-200 rounded-full flex-shrink-0" />
  </div>
);

const CommunityCard: React.FC<{ community: CommunityGroup; userId: string; onEnter: (c: CommunityGroup) => void }> = ({
  community,
  onEnter,
}) => {
  return (
    <button
      onClick={() => onEnter(community)}
      className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:border-[#25D366]/40 hover:shadow-md active:scale-[0.98] transition-all text-left"
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl shadow-sm"
        style={{ background: `${community.color}18`, border: `2px solid ${community.color}30` }}
      >
        {community.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#111b21] text-[15px] leading-tight truncate">{community.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 leading-snug">{community.description}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <Users className="w-3 h-3" />
            {community.member_count.toLocaleString()} members
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <MessageSquare className="w-3 h-3" />
            {community.post_count.toLocaleString()} posts
          </span>
        </div>
      </div>

      {/* CTA */}
      <div
        className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold text-white"
        style={{ background: community.color }}
      >
        Open
      </div>
    </button>
  );
};

const CommunitiesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { communities, loading, error, refetch } = useCommunities();
  const { userID } = useGetUserInfo();
  const userId = userID ?? 'anonymous';

  const handleEnter = (community: CommunityGroup) => {
    navigate(`/u/community/${community.slug}`, { state: { community } });
  };

  return (
    <div className="flex flex-col bg-[#f0f2f5]" style={{ height: '100dvh' }}>

      {/* Header */}
      <header className="flex-shrink-0 z-20 shadow-md" style={{ background: '#075E54' }}>
        <div className="flex items-center h-14 px-3 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors text-white flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-[16px] leading-tight">Communities</p>
            <p className="text-[#a8edbc] text-xs leading-tight">
              {loading ? 'loading...' : `${communities.length} communities`}
            </p>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-3 max-w-2xl mx-auto">

          {/* Intro card */}
          <div className="rounded-2xl p-4 text-center" style={{ background: '#075E54' }}>
            <div className="text-3xl mb-2">🎓</div>
            <p className="text-white font-bold text-base">EBSU Student Communities</p>
            <p className="text-[#a8edbc] text-[13px] mt-1 leading-snug">
              Join a community, meet your coursemates and share ideas with fellow EBSU students.
            </p>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-red-100">
              <p className="text-red-500 text-sm font-medium mb-3">{error}</p>
              <button
                onClick={refetch}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: '#25D366' }}
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          )}

          {/* Communities list */}
          {!loading && !error && communities.map((c) => (
            <CommunityCard
              key={c.id}
              community={c}
              userId={userId}
              onEnter={handleEnter}
            />
          ))}

          {/* Empty */}
          {!loading && !error && communities.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">No communities yet. Check back soon.</p>
            </div>
          )}

          <div className="pb-6" />
        </div>
      </div>
    </div>
  );
};

export default CommunitiesListPage;
