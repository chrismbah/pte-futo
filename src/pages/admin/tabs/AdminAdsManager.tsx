/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { db } from "../../../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { supabase, supabaseAdmin, STORAGE_BUCKETS } from "../../../config/supabase";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";
import { TrashIcon } from "../../../components/icons/general/TrashIcon";

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  placement: "dashboard" | "home" | "both" | "all";
  imageUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  ctaLabel: "",
  ctaUrl: "",
  bgColor: "#00875a",
  textColor: "#ffffff",
  isActive: true,
  placement: "dashboard" as "dashboard" | "home" | "both" | "all",
  imageUrl: "",
};

const PRESET_COLORS = [
  { bg: "#00875a", text: "#ffffff", label: "EBSUMSA Green" },
  { bg: "#1d4ed8", text: "#ffffff", label: "Royal Blue" },
  { bg: "#b45309", text: "#ffffff", label: "Amber" },
  { bg: "#7c3aed", text: "#ffffff", label: "Violet" },
  { bg: "#be123c", text: "#ffffff", label: "Rose" },
  { bg: "#0f172a", text: "#ffffff", label: "Slate Dark" },
  { bg: "#f0fdf4", text: "#166534", label: "Mint Light" },
  { bg: "#eff6ff", text: "#1e40af", label: "Sky Light" },
];

export default function AdminAdsManager() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string; title: string }>({ show: false, id: "", title: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "advertisements"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Advertisement[];
      setAds(data);
    } catch (err) {
      console.error("Error fetching ads:", err);
      notifyUser("error", "Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setImagePreview("");
    setImageMode("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notifyUser("error", "Image must be under 5MB");
      return;
    }
    setUploadingImage(true);
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `ads/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.ADVERTISEMENTS)
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabaseAdmin.storage
        .from(STORAGE_BUCKETS.ADVERTISEMENTS)
        .getPublicUrl(fileName);
      setImagePreview(data.publicUrl);
      setForm((p) => ({ ...p, imageUrl: data.publicUrl }));
      notifyUser("success", "Image uploaded successfully");
    } catch (err: any) {
      console.error("Supabase image upload failed:", err?.message, err);
      setImagePreview("");
      setForm((p) => ({ ...p, imageUrl: "" }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      notifyUser("error", "Image upload failed. Please try again or paste an image URL.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setForm((p) => ({ ...p, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      notifyUser("error", "Title and description are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "advertisements", editingId), {
          title: form.title.trim(),
          description: form.description.trim(),
          ctaLabel: form.ctaLabel.trim(),
          ctaUrl: form.ctaUrl.trim(),
          bgColor: form.bgColor,
          textColor: form.textColor,
          isActive: form.isActive,
          placement: form.placement,
          imageUrl: form.imageUrl.trim() || null,
          updatedAt: serverTimestamp(),
        });
        notifyUser("success", "Advertisement updated");
      } else {
        await addDoc(collection(db, "advertisements"), {
          title: form.title.trim(),
          description: form.description.trim(),
          ctaLabel: form.ctaLabel.trim(),
          ctaUrl: form.ctaUrl.trim(),
          bgColor: form.bgColor,
          textColor: form.textColor,
          isActive: form.isActive,
          placement: form.placement,
          imageUrl: form.imageUrl.trim() || null,
          createdAt: serverTimestamp(),
        });
        notifyUser("success", "Advertisement created");
      }
      resetForm();
      fetchAds();
    } catch (err) {
      console.error("Error saving ad:", err);
      notifyUser("error", "Failed to save advertisement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setForm({
      title: ad.title,
      description: ad.description,
      ctaLabel: ad.ctaLabel || "",
      ctaUrl: ad.ctaUrl || "",
      bgColor: ad.bgColor || "#00875a",
      textColor: ad.textColor || "#ffffff",
      isActive: ad.isActive,
      placement: ad.placement || "dashboard",
      imageUrl: ad.imageUrl || "",
    });
    setEditingId(ad.id);
    setImagePreview(ad.imageUrl || "");
    setImageMode(ad.imageUrl ? "upload" : "upload");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (ad: Advertisement) => {
    setTogglingId(ad.id);
    try {
      await updateDoc(doc(db, "advertisements", ad.id), {
        isActive: !ad.isActive,
        updatedAt: serverTimestamp(),
      });
      setAds((prev) =>
        prev.map((a) => (a.id === ad.id ? { ...a, isActive: !ad.isActive } : a))
      );
      notifyUser("success", ad.isActive ? "Ad paused" : "Ad activated");
    } catch (err) {
      console.error("Error toggling ad:", err);
      notifyUser("error", "Failed to update ad status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return;
    setDeletingId(confirmDelete.id);
    try {
      await deleteDoc(doc(db, "advertisements", confirmDelete.id));
      setAds((prev) => prev.filter((a) => a.id !== confirmDelete.id));
      notifyUser("success", "Advertisement deleted");
    } catch (err) {
      console.error("Error deleting ad:", err);
      notifyUser("error", "Failed to delete advertisement");
    } finally {
      setDeletingId(null);
      setConfirmDelete({ show: false, id: "", title: "" });
    }
  };

  const activeCount = ads.filter((a) => a.isActive).length;
  const pausedCount = ads.filter((a) => !a.isActive).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-gray-500 text-sm font-medium">Total Ads</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{ads.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 shadow-sm p-4">
          <p className="text-green-600 text-sm font-medium">Active</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4">
          <p className="text-amber-600 text-sm font-medium">Paused</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{pausedCount}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <motion.div
          variants={fadeInVariants5}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          custom={1}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl border-2 border-green-200 shadow-sm p-5 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? "Edit Advertisement" : "New Advertisement"}
              </h3>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Live Preview */}
            <div
              className="rounded-xl p-4 mb-5 relative overflow-hidden border border-black/10"
              style={{ backgroundColor: form.bgColor, color: form.textColor }}
            >
              <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Preview</p>
              <p className="font-bold text-sm leading-tight mb-1">
                {form.title || "Advertisement Title"}
              </p>
              <p className="text-xs opacity-80 line-clamp-2 mb-3">
                {form.description || "Your advertisement description will appear here."}
              </p>
              {form.ctaLabel && (
                <span
                  className="inline-block px-3 py-1 rounded-lg text-xs font-semibold border"
                  style={{
                    borderColor: form.textColor,
                    color: form.bgColor,
                    backgroundColor: form.textColor,
                  }}
                >
                  {form.ctaLabel}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. EBSUMSA Week 2025"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short message for students..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                />
              </div>

              {/* CTA Label */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Button Label <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.ctaLabel}
                  onChange={(e) => setForm((p) => ({ ...p, ctaLabel: e.target.value }))}
                  placeholder="e.g. Register Now"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                />
              </div>

              {/* CTA URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Button Link <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="url"
                  value={form.ctaUrl}
                  onChange={(e) => setForm((p) => ({ ...p, ctaUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                />
              </div>

              {/* Image — Upload or URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Image <span className="text-gray-400">(optional)</span>
                </label>
                {/* Mode toggle */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-3">
                  {(["upload", "url"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setImageMode(mode); handleRemoveImage(); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        imageMode === mode
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {mode === "upload" ? "Upload from device" : "Paste URL"}
                    </button>
                  ))}
                </div>

                {imageMode === "upload" ? (
                  <div>
                    {/* Hidden file input — accepts images from gallery/files */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="ad-image-upload"
                    />
                    {imagePreview || form.imageUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                          src={imagePreview || form.imageUrl}
                          alt="Ad preview"
                          className="w-full h-32 object-cover"
                        />
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                            <Spinner className="w-5 h-5 text-white" />
                            <span className="text-white text-xs font-medium">Uploading...</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                          x
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="ad-image-upload"
                        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors ${
                          uploadingImage
                            ? "border-[#00875a]/50 bg-green-50"
                            : "border-gray-200 hover:border-[#00875a]/50 hover:bg-green-50"
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <Spinner className="w-6 h-6 text-[#00875a]" />
                            <span className="text-xs text-[#00875a] font-medium">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-500 font-medium">Tap to upload from your phone</span>
                            <span className="text-xss text-gray-400">JPG, PNG, WebP — max 5MB</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => { setForm((p) => ({ ...p, imageUrl: e.target.value })); setImagePreview(e.target.value); }}
                    placeholder="https://... (paste an image link)"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                  />
                )}
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Color Theme
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.bg}
                      type="button"
                      title={preset.label}
                      onClick={() => setForm((p) => ({ ...p, bgColor: preset.bg, textColor: preset.text }))}
                      className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
                      style={{
                        backgroundColor: preset.bg,
                        borderColor: form.bgColor === preset.bg ? preset.text : "transparent",
                        boxShadow: form.bgColor === preset.bg ? `0 0 0 2px ${preset.bg}` : "none",
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xss text-gray-500 mb-1">Background</label>
                    <input
                      type="color"
                      value={form.bgColor}
                      onChange={(e) => setForm((p) => ({ ...p, bgColor: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xss text-gray-500 mb-1">Text</label>
                    <input
                      type="color"
                      value={form.textColor}
                      onChange={(e) => setForm((p) => ({ ...p, textColor: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Placement */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Placement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["dashboard", "home", "both", "all"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, placement: p }))}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        form.placement === p
                          ? "bg-[#00875a] text-white border-[#00875a]"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {p === "dashboard" && "Dashboard Only"}
                      {p === "home" && "Home Page Only"}
                      {p === "both" && "Dashboard + Home"}
                      {p === "all" && "All Pages"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-semibold text-gray-700">Active (visible to students)</span>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    form.isActive ? "bg-[#00875a]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      form.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-[#00875a] text-white text-sm font-semibold hover:bg-[#00875a]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Spinner className="w-4 h-4 text-white" />
                    {editingId ? "Updating..." : "Creating..."}
                  </>
                ) : editingId ? (
                  "Update Advertisement"
                ) : (
                  "Create Advertisement"
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Ads List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              {ads.length} advertisement{ads.length !== 1 ? "s" : ""} total
            </p>
            <button
              onClick={fetchAds}
              disabled={loading}
              className="px-4 py-2 bg-[#00875a] text-white rounded-xl text-sm font-medium hover:bg-[#00875a]/90 disabled:opacity-50 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex items-center justify-center">
              <Spinner className="w-8 h-8" />
            </div>
          ) : ads.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
              <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <p className="text-gray-500 text-sm">No advertisements yet. Create one using the form.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad, idx) => (
                <motion.div
                  key={ad.id}
                  variants={fadeInVariants5}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  custom={idx + 1}
                  className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Banner preview strip */}
                  <div
                    className="px-4 py-4 flex items-start gap-4"
                    style={{ backgroundColor: ad.bgColor, color: ad.textColor }}
                  >
                    {ad.imageUrl && (
                      <img
                        src={ad.imageUrl}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-white/20"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm leading-tight">{ad.title}</p>
                      <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{ad.description}</p>
                      {ad.ctaLabel && (
                        <span
                          className="inline-block mt-2 px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: ad.textColor, color: ad.bgColor }}
                        >
                          {ad.ctaLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xss font-semibold border ${
                        ad.isActive
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}>
                        {ad.isActive ? "Active" : "Paused"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xss font-medium bg-gray-100 text-gray-500 border border-gray-200">
                        {ad.placement === "dashboard" && "Dashboard Only"}
                        {ad.placement === "home" && "Home Page Only"}
                        {ad.placement === "both" && "Dashboard + Home"}
                        {ad.placement === "all" && "All Pages"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggleActive(ad)}
                        disabled={togglingId === ad.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          ad.isActive
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {togglingId === ad.id ? (
                          <Spinner className="w-3 h-3" />
                        ) : ad.isActive ? "Pause" : "Activate"}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(ad)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDelete({ show: true, id: ad.id, title: ad.title })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">
              Delete Advertisement
            </h3>
            <p className="text-gray-600 text-center text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">"{confirmDelete.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ show: false, id: "", title: "" })}
                disabled={!!deletingId}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!!deletingId}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <><Spinner className="w-4 h-4 text-white" /> Deleting...</>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
