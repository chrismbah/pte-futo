import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../../config/firebase";
import { collection, getDocs, doc, setDoc, query, orderBy, getDoc } from "firebase/firestore";
import { Crown, UserCheck, UserX, Search, X, RefreshCw, Calendar, Shield, TrendingUp, Users, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

type PremiumMember = {
  id: string;
  active: boolean;
  grantedAt?: string;
  reference?: string;
  amount?: number;
  email?: string;
  name?: string;
  expiresAt?: Date | { toDate: () => Date };
  revokedAt?: Date | { toDate: () => Date };
  revokeReason?: string;
};

function timeAgo(date: string) {
  if (!date) return "unknown";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const days = Math.floor(s / 86400);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPremiumMembersManager() {
  const [members, setMembers] = useState<PremiumMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "expiring">("all");
  const [granting, setGranting] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [manualUid, setManualUid] = useState("");
  const [manualGranting, setManualGranting] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // Avoid orderBy to prevent index errors with mixed field types
      const snap = await getDocs(collection(db, "premiumUsers"));
      const data: PremiumMember[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PremiumMember));
      // Sort client-side: active first, then by grantedAt desc
      data.sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        const aTime = a.grantedAt ? new Date(a.grantedAt).getTime() : 0;
        const bTime = b.grantedAt ? new Date(b.grantedAt).getTime() : 0;
        return bTime - aTime;
      });
      setMembers(data);
    } catch (e) {
      console.error("[v0] Failed to fetch premium members:", e);
      toast.error("Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleGrant = async (uid: string) => {
    setGranting(uid);
    try {
      await setDoc(doc(db, "premiumUsers", uid), { active: true, grantedAt: new Date().toISOString(), grantedByAdmin: true }, { merge: true });
      setMembers((prev) => prev.map((m) => m.id === uid ? { ...m, active: true } : m));
      toast.success("Premium access granted!");
    } catch {
      toast.error("Failed to grant access.");
    } finally {
      setGranting(null);
    }
  };

  const handleRevoke = async (uid: string) => {
    if (!confirm(`Revoke premium access for user ${uid}?`)) return;
    setRevoking(uid);
    try {
      await setDoc(doc(db, "premiumUsers", uid), { active: false }, { merge: true });
      setMembers((prev) => prev.map((m) => m.id === uid ? { ...m, active: false } : m));
      toast.success("Premium access revoked.");
    } catch {
      toast.error("Failed to revoke access.");
    } finally {
      setRevoking(null);
    }
  };

  const handleManualGrant = async () => {
    const uid = manualUid.trim();
    if (!uid) {
      toast.error("Please enter a valid User ID.");
      return;
    }
    setManualGranting(true);
    setManualSuccess(false);
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const payload = {
        active: true,
        grantedAt: new Date().toISOString(),
        grantedByAdmin: true,
        manual: true,
        expiresAt,
        userID: uid,
      };

      await setDoc(doc(db, "premiumUsers", uid), payload, { merge: true });

      // Verify it was written
      const check = await getDoc(doc(db, "premiumUsers", uid));
      if (!check.exists() || check.data()?.active !== true) {
        throw new Error("Write verification failed");
      }

      toast.success(`Premium granted to ${uid}`);
      setManualSuccess(true);
      setManualUid("");
      setTimeout(() => setManualSuccess(false), 3000);
      await fetchMembers();
    } catch (e: any) {
      console.error("[v0] Manual grant error:", e);
      toast.error(`Failed to grant access: ${e?.message || "Unknown error"}`);
    } finally {
      setManualGranting(false);
    }
  };

  const getExpirationDate = (m: PremiumMember): Date | null => {
    if (!m.expiresAt) return null;
    return (m.expiresAt as any).toDate ? (m.expiresAt as any).toDate() : new Date(m.expiresAt as any);
  };
  
  const isExpiringSoon = (m: PremiumMember): boolean => {
    const expDate = getExpirationDate(m);
    if (!expDate || !m.active) return false;
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };
  
  const filtered = members.filter((m) => {
    const matchesSearch = !search || m.id.toLowerCase().includes(search.toLowerCase()) || (m.name || "").toLowerCase().includes(search.toLowerCase()) || (m.email || "").toLowerCase().includes(search.toLowerCase());
    if (filter === "active") return matchesSearch && m.active;
    if (filter === "inactive") return matchesSearch && !m.active;
    if (filter === "expiring") return matchesSearch && isExpiringSoon(m);
    return matchesSearch;
  });

  const activeCount = members.filter((m) => m.active).length;
  const inactiveCount = members.filter((m) => !m.active).length;
  const expiringCount = members.filter((m) => isExpiringSoon(m)).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{members.length}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Total</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><UserCheck className="w-3 h-3" /> Active</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{expiringCount}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" /> Expiring</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{inactiveCount}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><UserX className="w-3 h-3" /> Inactive</p>
        </div>
      </div>

      {/* Manual Grant */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Manually Grant Premium Access</h3>
          {manualSuccess && (
            <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Granted successfully
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <input
            value={manualUid}
            onChange={(e) => setManualUid(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !manualGranting && handleManualGrant()}
            placeholder="Enter Firebase User ID (UID)…"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            onClick={handleManualGrant}
            disabled={manualGranting || !manualUid.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {manualGranting
              ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Crown className="w-4 h-4" />}
            {manualGranting ? "Granting…" : "Grant"}
          </button>
        </div>
        <p className="text-xss text-gray-500 mt-2">
          Paste the user's Firebase UID (found in Firebase Console → Authentication → Users → copy UID).
        </p>
      </div>

      {/* Search + Filter + Refresh */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by UID, name or email…"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="flex gap-2">
          {(["all", "active", "expiring", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filter === f ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f}
            </button>
          ))}
          <button onClick={fetchMembers} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition-all" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading premium members…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Crown className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No members found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xss font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-3">User ID</div>
            <div className="col-span-2">Granted</div>
            <div className="col-span-2">Expires</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <AnimatePresence>
            {filtered.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                {/* UID */}
                <div className="col-span-3 flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xss font-bold"
                    style={{ background: m.active ? "#f59e0b1a" : "#f3f4f6", color: m.active ? "#d97706" : "#9ca3af" }}>
                    {m.id.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-medium text-gray-700 truncate">{m.id}</p>
                    {m.email && <p className="text-xss text-gray-400 truncate">{m.email}</p>}
                  </div>
                </div>
                {/* Granted at */}
                <div className="col-span-2">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    {m.grantedAt ? timeAgo(m.grantedAt) : "—"}
                  </p>
                </div>
                {/* Expires at */}
                <div className="col-span-2">
                  {(() => {
                    const expDate = getExpirationDate(m);
                    if (!expDate) return <span className="text-xss text-gray-400 italic">No expiry</span>;
                    const now = new Date();
                    const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const isExpired = daysLeft <= 0;
                    const isExpiringSoonNow = daysLeft > 0 && daysLeft <= 7;
                    return (
                      <div>
                        <p className={`text-xs flex items-center gap-1 ${isExpired ? "text-red-500" : isExpiringSoonNow ? "text-orange-500" : "text-gray-600"}`}>
                          <Clock className={`w-3 h-3 flex-shrink-0 ${isExpired ? "text-red-400" : isExpiringSoonNow ? "text-orange-400" : "text-gray-400"}`} />
                          {isExpired ? "Expired" : `${daysLeft}d left`}
                        </p>
                        <p className="text-xss text-gray-400 mt-0.5">{expDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                      </div>
                    );
                  })()}
                </div>
                {/* Amount */}
                <div className="col-span-2">
                  {m.amount ? (
                    <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />₦{(m.amount).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-xss text-gray-400 italic">{(m as any).grantedByAdmin ? "Manual" : "—"}</span>
                  )}
                </div>
                {/* Status */}
                <div className="col-span-1 flex justify-center">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${m.active ? "bg-green-100" : "bg-gray-100"}`}>
                    {m.active ? <UserCheck className="w-3 h-3 text-green-600" /> : <UserX className="w-3 h-3 text-gray-400" />}
                  </span>
                </div>
                {/* Actions */}
                <div className="col-span-2 flex justify-end gap-1.5">
                  {m.active ? (
                    <button onClick={() => handleRevoke(m.id)} disabled={revoking === m.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xss font-semibold bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition-all">
                      {revoking === m.id ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <UserX className="w-3 h-3" />}
                      Revoke
                    </button>
                  ) : (
                    <button onClick={() => handleGrant(m.id)} disabled={granting === m.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xss font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 transition-all">
                      {granting === m.id ? <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" /> : <Crown className="w-3 h-3" />}
                      Grant
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Footer count */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xss text-gray-400">Showing {filtered.length} of {members.length} members</p>
          </div>
        </div>
      )}
    </div>
  );
}
