/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../config/supabase";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import { TrashIcon } from "../../../components/icons/general/TrashIcon";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";
import type { AlumniMember } from "../../ebsumsa/Alumni";
import placeholder from "../../../assets/img/team/placeholder.png";

/** Compress image to max 800px / JPEG 0.8 before upload */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas error")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Blob error")), "image/jpeg", 0.8);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Load error")); };
    img.src = url;
  });
}

const EMPTY_FORM = { fullName: "", role: "", yearServed: "", bio: "" };

export default function AdminAlumniManager() {
  const [alumni, setAlumni] = useState<AlumniMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAlumni = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("alumni")
      .select("id, full_name, role, year_served, image_url, bio, created_at")
      .order("year_served", { ascending: false });
    if (!error && data) {
      setAlumni(
        data.map((row) => ({
          id: row.id,
          fullName: row.full_name,
          role: row.role,
          yearServed: row.year_served,
          imageUrl: row.image_url ?? undefined,
          bio: row.bio ?? undefined,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchAlumni(); }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (alumniId: string): Promise<string | null> => {
    if (!imageFile) return null;
    setUploadingImage(true);
    try {
      let blob: Blob;
      try { blob = await compressImage(imageFile); } catch { blob = imageFile; }
      const path = `alumni/${alumniId}_${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("profile-pictures")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("profile-pictures").getPublicUrl(path);
      return data.publicUrl;
    } catch {
      notifyUser("error", "Image upload failed");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.role.trim() || !form.yearServed.trim()) {
      notifyUser("error", "Full name, role and year served are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        let imageUrl: string | undefined;
        if (imageFile) {
          const url = await uploadImage(editingId);
          if (url) imageUrl = url;
        }
        const { error } = await supabase
          .from("alumni")
          .update({
            full_name: form.fullName.trim(),
            role: form.role.trim(),
            year_served: form.yearServed.trim(),
            bio: form.bio.trim() || null,
            ...(imageUrl && { image_url: imageUrl }),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);
        if (error) throw error;
        notifyUser("success", "Alumni updated");
      } else {
        // Insert first to get the id, then upload image
        const { data: inserted, error: insertError } = await supabase
          .from("alumni")
          .insert({
            full_name: form.fullName.trim(),
            role: form.role.trim(),
            year_served: form.yearServed.trim(),
            bio: form.bio.trim() || null,
            image_url: null,
          })
          .select("id")
          .single();
        if (insertError) throw insertError;
        if (imageFile && inserted?.id) {
          const url = await uploadImage(inserted.id);
          if (url) {
            await supabase
              .from("alumni")
              .update({ image_url: url })
              .eq("id", inserted.id);
          }
        }
        notifyUser("success", "Alumni added");
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setImageFile(null);
      setImagePreview(null);
      await fetchAlumni();
    } catch {
      notifyUser("error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member: AlumniMember) => {
    setEditingId(member.id);
    setForm({ fullName: member.fullName, role: member.role, yearServed: member.yearServed, bio: member.bio || "" });
    setImagePreview(member.imageUrl || null);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("alumni").delete().eq("id", id);
      if (error) throw error;
      setAlumni((prev) => prev.filter((a) => a.id !== id));
      notifyUser("success", "Alumni removed");
    } catch {
      notifyUser("error", "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
  };

  // Group by year for display
  const grouped: Record<string, AlumniMember[]> = {};
  alumni.forEach((a) => {
    if (!grouped[a.yearServed]) grouped[a.yearServed] = [];
    grouped[a.yearServed].push(a);
  });
  const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      {/* Form */}
      <motion.div
        variants={fadeInVariants5}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={1}
        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-base font-bold text-gray-900 mb-5">
          {editingId ? "Edit Alumni Member" : "Add New Alumni Member"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex-shrink-0">
              <img
                src={imagePreview || placeholder}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="alumni-photo"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-green2 hover:text-green2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {imageFile ? "Change photo" : "Upload photo"}
              </label>
              <input id="alumni-photo" ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
              <p className="text-xss text-gray-400 mt-1">Auto-compressed before upload</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="e.g. Dr. John Doe"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green2/30 focus:border-green2 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Role / Position <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                placeholder="e.g. President"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green2/30 focus:border-green2 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Year Served <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.yearServed}
                onChange={(e) => setForm((p) => ({ ...p, yearServed: e.target.value }))}
                placeholder="e.g. 2023/2024"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green2/30 focus:border-green2 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Short Bio <span className="text-gray-400">(optional)</span></label>
              <input
                type="text"
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="A brief note about this person"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green2/30 focus:border-green2 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="flex items-center gap-2 px-6 py-2.5 bg-green2 text-white text-sm font-semibold rounded-xl hover:bg-green1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {(saving || uploadingImage) && <Spinner className="w-4 h-4 text-white" />}
              {saving || uploadingImage ? "Saving..." : editingId ? "Update Alumni" : "Add Alumni"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* List */}
      <motion.div
        variants={fadeInVariants5}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={2}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">
            All Alumni <span className="text-gray-400 font-normal">({alumni.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="w-8 h-8 text-green2" />
          </div>
        ) : alumni.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-500">No alumni added yet. Use the form above to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedYears.map((year) => (
              <div key={year}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="px-3 py-1 bg-green2/10 text-green2 text-xs font-bold rounded-full">{year} Administration</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[year].map((member) => (
                    <div key={member.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img
                          src={member.imageUrl || placeholder}
                          alt={member.fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{member.fullName}</p>
                        <p className="text-xss text-green2 font-semibold truncate">{member.role}</p>
                        {member.bio && <p className="text-xss text-gray-400 truncate mt-0.5">{member.bio}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(member)}
                          className="px-2.5 py-1 text-xss font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          disabled={deletingId === member.id}
                          className="px-2.5 py-1 text-xss font-semibold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                          {deletingId === member.id ? <Spinner className="w-3 h-3" /> : <TrashIcon className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
