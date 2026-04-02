import { useState, useEffect, useRef } from "react";
import { IoTrash, IoImages, IoVideocam, IoClose, IoCloudUpload, IoRefresh } from "react-icons/io5";
import { notifyUser } from "../../../helpers/notifyUser";
import { listGalleryItems, deleteGalleryItem, uploadPreset, getCloudName } from "../../../lib/cloudinary";

export interface GalleryItem {
  url:        string;
  publicId:   string;
  category:   string;
  caption:    string;
  type:       "image" | "video";
  uploadedAt: string;
  size?:      number;
}

const CATEGORIES = [
  { value: "general",     label: "General" },
  { value: "events",      label: "Events" },
  { value: "activities",  label: "Activities" },
  { value: "convocation", label: "Convocation" },
  { value: "outreach",    label: "Outreach" },
  { value: "executives",  label: "Executives" },
];

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1400;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
        "image/jpeg", 0.85
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Load failed")); };
    img.src = url;
  });
}

export default function AdminGalleryManager() {
  const [items, setItems]               = useState<GalleryItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [uploading, setUploading]       = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [caption, setCaption]           = useState("");
  const [category, setCategory]         = useState("general");
  const [preview, setPreview]           = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");
  const [staleData, setStaleData]           = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const cloudNameVal  = getCloudName();
  const uploadPresetVal = uploadPreset();

  const LS_KEY = "ebsumsa_gallery_cache";

  const saveLocal = (data: GalleryItem[]) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ items: data, at: Date.now() })); } catch { /* ignore */ }
  };

  const loadLocal = (): GalleryItem[] => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const { items } = JSON.parse(raw) as { items: GalleryItem[] };
      return Array.isArray(items) ? items : [];
    } catch { return []; }
  };

  const fetchItems = async () => {
    setLoading(true);
    setStaleData(false);
    try {
      const fetched = await listGalleryItems();
      if (fetched.length > 0) {
        setItems(fetched);
        saveLocal(fetched);
      } else {
        // Server returned empty — silently show last known items
        const fallback = loadLocal();
        if (fallback.length > 0) {
          setItems(fallback);
          setStaleData(true);
        } else {
          setItems([]);
        }
      }
    } catch {
      // API unavailable (rate limit, outage) — show saved list silently
      const fallback = loadLocal();
      if (fallback.length > 0) {
        setItems(fallback);
        setStaleData(true);
      } else {
        notifyUser("error", "Gallery unavailable — check your connection and try refreshing.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const clearSelection = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setSelectedFile(null);
    setCaption("");
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isImage && !isVideo) { notifyUser("error", "Select an image or video file"); return; }
    if (file.size > 100 * 1024 * 1024) { notifyUser("error", "File must be under 100 MB"); return; }
    setSelectedFile(file);
    setPreview({ url: URL.createObjectURL(file), type: isVideo ? "video" : "image" });
  };

  const handleUpload = async () => {
    if (!selectedFile || !preview) return;
    if (!cloudNameVal || !uploadPresetVal) {
      notifyUser("error", "Cloudinary not configured. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your env vars.");
      return;
    }
    setUploading(true);
    setUploadProgress(10);
    try {
      const isVideo = preview.type === "video";
      let fileToSend: Blob = selectedFile;
      if (!isVideo) {
        try { fileToSend = await compressImage(selectedFile); } catch { /* use original */ }
      }
      setUploadProgress(25);

      const formData = new FormData();
      formData.append("file", fileToSend, selectedFile.name);
      formData.append("upload_preset", uploadPresetVal);
      formData.append("folder", "ebsu_gallery");
      // Store category + caption as Cloudinary context metadata
      formData.append("context", `category=${category}|caption=${caption.trim()}`);

      const resourceType = isVideo ? "video" : "image";
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudNameVal}/${resourceType}/upload`;

      // Use XHR so we get real upload progress
      const newItem = await new Promise<GalleryItem>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(25 + Math.round((e.loaded / e.total) * 70));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const d = JSON.parse(xhr.responseText);
            const newItem: GalleryItem = {
              url:        d.secure_url,
              publicId:   d.public_id,
              category,
              caption:    caption.trim(),
              type:       isVideo ? "video" : "image",
              uploadedAt: d.created_at,
              size:       d.bytes,
            };
            resolve(newItem);
          } else {
            try {
              const e = JSON.parse(xhr.responseText);
              reject(new Error(e.error?.message || `Upload failed: ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.open("POST", uploadUrl);
        xhr.send(formData);
      });

      setUploadProgress(100);
      setStaleData(false);
      setItems((prev) => {
        const updated = [newItem as unknown as GalleryItem, ...prev];
        saveLocal(updated);
        return updated;
      });
      // Inject the new item directly into the server cache so every visitor
      // sees it immediately — no Cloudinary search-index delay.
      fetch("/api/gallery-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: newItem }),
      }).catch(() => {});
      notifyUser("success", "Uploaded successfully! It's now live in the gallery.");
      clearSelection();
    } catch (err) {
      notifyUser("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm(`Delete this ${item.type}? This cannot be undone.`)) return;
    setDeletingId(item.publicId);
    try {
      await deleteGalleryItem(item.publicId, item.type);
      setItems((prev) => {
        const updated = prev.filter((i) => i.publicId !== item.publicId);
        saveLocal(updated);
        return updated;
      });
      // Remove this specific item from the server-side cache immediately
      // (avoids Cloudinary search-index lag when clicking Refresh)
      fetch("/api/gallery-cache", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: item.publicId }),
      }).catch(() => {});
      notifyUser("success", "Deleted successfully");
    } catch (err) {
      notifyUser("error", err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = filterCategory === "all" ? items : items.filter((i) => i.category === filterCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gallery Manager</h2>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} — powered by Cloudinary
            {staleData && <span className="ml-2 text-amber-500 text-xs">(saved list — refresh to sync)</span>}
          </p>
        </div>
        <button onClick={fetchItems} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green2 transition-colors">
          <IoRefresh className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-gray-800 text-base">Upload New Media</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green2/30 bg-white"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Caption (optional)</label>
            <input
              type="text" value={caption} onChange={(e) => setCaption(e.target.value)}
              placeholder="E.g. EBSUMSA Week 2025" maxLength={120}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green2/30"
            />
          </div>
        </div>

        {/* Drop zone / preview */}
        {preview ? (
          <div className="relative rounded-xl overflow-hidden bg-gray-100 max-h-64 flex items-center justify-center">
            {preview.type === "video"
              ? <video src={preview.url} controls className="max-h-64 w-full object-contain" />
              : <img src={preview.url} alt="Preview" className="max-h-64 w-full object-contain" />
            }
            <button onClick={clearSelection} className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors">
              <IoClose />
            </button>
          </div>
        ) : (
          <label htmlFor="gallery-file-input"
            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-10 cursor-pointer hover:border-green2 hover:bg-green2/5 transition-colors"
          >
            <div className="flex gap-4">
              <IoImages className="text-4xl text-gray-300" />
              <IoVideocam className="text-4xl text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">Click to choose a photo or video</p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP, MP4, MOV — max 100 MB</p>
          </label>
        )}
        <input id="gallery-file-input" ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="sr-only" />

        {/* Progress bar */}
        {uploading && uploadProgress > 0 && (
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        <div className="flex gap-3">
          {preview && (
            <button onClick={clearSelection} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          )}
          <button
            onClick={preview ? handleUpload : () => fileRef.current?.click()}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green2 text-white text-sm font-semibold rounded-xl hover:bg-green1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Uploading {uploadProgress}%</>
            ) : (
              <><IoCloudUpload className="text-base" />{preview ? "Upload to Gallery" : "Choose File"}</>
            )}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterCategory === "all" ? "bg-green2 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          All ({items.length})
        </button>
        {CATEGORIES.map((c) => {
          const count = items.filter((i) => i.category === c.value).length;
          if (count === 0) return null;
          return (
            <button key={c.value} onClick={() => setFilterCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterCategory === c.value ? "bg-green2 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3 bg-white rounded-2xl border border-gray-100">
          <IoImages className="text-4xl text-gray-300" />
          <p className="text-sm text-gray-500">No gallery items yet. Upload your first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.publicId} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
              {item.type === "video" ? (
                <>
                  <video src={item.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-2"><IoVideocam className="text-white text-sm" /></div>
                  </div>
                </>
              ) : (
                <img src={item.url} alt={item.caption || item.category} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-start justify-between p-2">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize">
                  {item.category}
                </span>
                <button onClick={() => handleDelete(item)} disabled={deletingId === item.publicId}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md disabled:opacity-50"
                  aria-label="Delete">
                  {deletingId === item.publicId
                    ? <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    : <IoTrash className="text-xs" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
