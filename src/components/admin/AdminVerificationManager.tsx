import React, { useState, useMemo } from 'react';
import { Search, ShieldCheck, ShieldOff, Loader, RefreshCw } from 'lucide-react';
import { useAllUserProfiles, useToggleVerification } from '../../hooks/useDirectMessages';
import VerifiedBadge from '../community/VerifiedBadge';
import toast from 'react-hot-toast';

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

const AdminVerificationManager: React.FC = () => {
  const { profiles, loading, refetch } = useAllUserProfiles();
  const { toggle } = useToggleVerification();
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const matchSearch = p.display_name.toLowerCase().includes(search.toLowerCase()) ||
        p.user_id.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'all' ||
        (filter === 'verified' && p.is_verified) ||
        (filter === 'unverified' && !p.is_verified);
      return matchSearch && matchFilter;
    });
  }, [profiles, search, filter]);

  const handleToggle = async (userId: string, current: boolean) => {
    setToggling(userId);
    const ok = await toggle(userId, current);
    if (ok) {
      toast.success(current ? 'Verification removed.' : 'User verified!', {
        style: { background: current ? '#ef4444' : '#25D366', color: '#fff', fontWeight: '600' },
      });
      refetch();
    } else {
      toast.error('Failed to update verification.');
    }
    setToggling(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#53bdeb]" />
            Verification Manager
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Assign or remove the verified badge from users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{profiles.length} users synced</span>
          <button
            onClick={refetch}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or user ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'verified', 'unverified'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                filter === f
                  ? 'bg-[#25D366] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-900">{profiles.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Users</p>
        </div>
        <div className="bg-[#f0fdf4] rounded-xl p-3 text-center border border-[#25D366]/20">
          <p className="text-xl font-bold text-[#128C7E]">{profiles.filter((p) => p.is_verified).length}</p>
          <p className="text-xs text-[#128C7E] mt-0.5">Verified</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-600">{profiles.filter((p) => !p.is_verified).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unverified</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader className="w-6 h-6 animate-spin text-[#25D366]" />
            <p className="text-sm text-gray-500">Loading profiles…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <ShieldCheck className="w-10 h-10 text-gray-200" />
            <p className="text-sm text-gray-500">No profiles found.</p>
            <p className="text-xs text-gray-400">Users appear here once they log into the community.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-6">User</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-3 text-right">Action</div>
            </div>

            {filtered.map((profile) => {
              const gradient = getAvatarColor(profile.display_name);
              const initials = getInitials(profile.display_name);
              return (
                <div
                  key={profile.user_id}
                  className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors"
                >
                  {/* User */}
                  <div className="col-span-6 flex items-center gap-3 min-w-0">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name}
                        crossOrigin="anonymous"
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-gray-100`}>
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">{profile.display_name}</p>
                        {profile.is_verified && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{profile.user_id.slice(0, 16)}…</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      profile.is_verified
                        ? 'bg-[#e8f8f0] text-[#128C7E]'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {profile.is_verified ? (
                        <><ShieldCheck className="w-3 h-3" /> Verified</>
                      ) : (
                        <><ShieldOff className="w-3 h-3" /> None</>
                      )}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="col-span-3 flex justify-end">
                    <button
                      onClick={() => handleToggle(profile.user_id, profile.is_verified)}
                      disabled={toggling === profile.user_id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                        profile.is_verified
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                          : 'bg-[#f0fdf4] text-[#128C7E] hover:bg-[#dcf8c6] border border-[#25D366]/30'
                      }`}
                    >
                      {toggling === profile.user_id ? (
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : profile.is_verified ? (
                        <><ShieldOff className="w-3.5 h-3.5" /> Revoke</>
                      ) : (
                        <><ShieldCheck className="w-3.5 h-3.5" /> Verify</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationManager;
