/**
 * Cloudinary-only gallery helpers.
 *
 * - Upload  → direct browser → Cloudinary unsigned upload (CORS allowed)
 * - List    → /api/gallery-list  (server-side, uses API secret safely)
 * - Delete  → /api/gallery-upload DELETE (server-side, signed destroy)
 *
 * No Firestore involved. Works in both Vite dev (middleware) and Vercel production.
 */

import type { GalleryItem } from "../pages/admin/tabs/AdminGalleryManager";

export const getCloudName   = () => (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME   as string) || "dsqjg9mfg";
export const uploadPreset   = () => (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || "ebsumsa";

// ─── List ────────────────────────────────────────────────────────────────────
export async function listGalleryItems(): Promise<GalleryItem[]> {
  const res = await fetch("/api/gallery-list");
  const text = await res.text();

  let data: { items?: GalleryItem[]; error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    // Raw file returned — API route not running yet
    throw new Error(
      "Gallery API not available. Make sure VITE_CLOUDINARY_API_KEY and VITE_CLOUDINARY_API_SECRET are set in Vars, then refresh."
    );
  }

  if (!res.ok || data.error) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data.items ?? [];
}

// ─── Delete ──────────────────────────────────────────────────────────────────
export async function deleteGalleryItem(
  publicId: string,
  resourceType = "image"
): Promise<void> {
  const res = await fetch("/api/gallery-upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId, resourceType }),
  });
  const text = await res.text();
  let data: { success?: boolean; error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Delete failed — server returned invalid response.");
  }
  if (!res.ok || data.error) {
    throw new Error(data.error || `Delete failed (${res.status})`);
  }
}
