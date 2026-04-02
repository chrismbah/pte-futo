import { useState, useEffect } from "react";

export interface GalleryItem {
  id: string;
  url: string;
  publicId: string;
  type: "image" | "video";
  category: string;
  caption: string;
  uploadedAt: string;
  size?: number;
}

interface UseCloudinaryGalleryResult {
  items: GalleryItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const LS_KEY = "ebsumsa_gallery_cache";

function saveToLocal(items: GalleryItem[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ items, at: Date.now() }));
  } catch { /* storage full or unavailable */ }
}

function loadFromLocal(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const { items } = JSON.parse(raw) as { items: GalleryItem[] };
    return Array.isArray(items) ? items : [];
  } catch { return []; }
}

export function useCloudinaryGallery(): UseCloudinaryGalleryResult {
  const [items, setItems] = useState<GalleryItem[]>(() => loadFromLocal());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Listen for localStorage changes from another tab (e.g. admin uploads)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY && e.newValue) {
        try {
          const { items: fresh } = JSON.parse(e.newValue) as { items: GalleryItem[] };
          if (Array.isArray(fresh) && fresh.length > 0) setItems(fresh);
        } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/gallery-list")
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data: { items: Omit<GalleryItem, "id">[] }) => {
        if (cancelled) return;
        const mapped = (data.items || []).map((item, idx) => ({
          ...item,
          id: item.publicId || String(idx),
        }));
        if (mapped.length > 0) {
          setItems(mapped);
          saveToLocal(mapped);
        } else {
          // Server returned empty — keep showing the last known items from localStorage
          const fallback = loadFromLocal();
          if (fallback.length > 0) setItems(fallback);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        // On any network / server error, keep the previously cached items visible
        const fallback = loadFromLocal();
        if (fallback.length > 0) {
          setItems(fallback);
        } else {
          setError(err.message || "Failed to load gallery");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  return { items, loading, error, refetch: () => setTick((t) => t + 1) };
}
