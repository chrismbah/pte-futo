// Gallery items are now loaded dynamically from Cloudinary via /api/gallery-list
// Use the useCloudinaryGallery hook in components instead of importing from here.

export interface GalleryItem {
  id: string;
  url: string;
  publicId?: string;
  type: "image" | "video";
  caption?: string;
  category?: string;
  uploadedAt?: string;
  size?: number;
}

// Kept for any legacy imports — always empty; use useCloudinaryGallery hook instead
export const galleryItems: GalleryItem[] = [];
