import { useCallback, useState } from 'react';
import { supabase, STORAGE_BUCKETS } from '../config/supabase';
import toast from 'react-hot-toast';

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index?: number;
  created_at: string;
}

export interface Sticker {
  id: string;
  name: string;
  image_url: string;
  category?: string;
  is_animated?: boolean;
  created_at: string;
}

export interface SavedSticker {
  id: string;
  user_id: string;
  sticker_id: string;
  saved_at: string;
  sticker?: Sticker;
}

// Hook for managing subcategories
export const useSubcategories = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubcategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_subcategories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSubcategories(data || []);
    } catch (err) {
      console.error('[v0] Error fetching subcategories:', err);
      toast.error('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    subcategories,
    loading,
    fetchSubcategories,
  };
};

// Hook for managing stickers
export const useStickers = (userId: string) => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [savedStickers, setSavedStickers] = useState<SavedSticker[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllStickers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_stickers')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setStickers(data || []);
    } catch (err) {
      console.error('[v0] Error fetching stickers:', err);
      toast.error('Failed to load stickers');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedStickers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_saved_stickers')
        .select('*, sticker:community_stickers(*)')
        .eq('user_id', userId);

      if (error) throw error;
      setSavedStickers(data || []);
    } catch (err) {
      console.error('[v0] Error fetching saved stickers:', err);
    }
  }, [userId]);

  const saveSticker = useCallback(
    async (stickerId: string) => {
      try {
        const { error } = await supabase
          .from('user_saved_stickers')
          .insert({
            user_id: userId,
            sticker_id: stickerId,
          });

        if (error) throw error;
        await fetchSavedStickers();
        toast.success('Sticker saved!');
      } catch (err) {
        console.error('[v0] Error saving sticker:', err);
        toast.error('Failed to save sticker');
      }
    },
    [userId, fetchSavedStickers]
  );

  const removeSticker = useCallback(
    async (stickerId: string) => {
      try {
        const { error } = await supabase
          .from('user_saved_stickers')
          .delete()
          .eq('user_id', userId)
          .eq('sticker_id', stickerId);

        if (error) throw error;
        await fetchSavedStickers();
        toast.success('Sticker removed');
      } catch (err) {
        console.error('[v0] Error removing sticker:', err);
        toast.error('Failed to remove sticker');
      }
    },
    [userId, fetchSavedStickers]
  );

  const isStarred = useCallback(
    (stickerId: string) => {
      return savedStickers.some((s) => s.sticker_id === stickerId);
    },
    [savedStickers]
  );

  return {
    stickers,
    savedStickers,
    loading,
    fetchAllStickers,
    fetchSavedStickers,
    saveSticker,
    removeSticker,
    isStarred,
  };
};

// Hook for uploading images to community messages
export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploading(true);

      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return null;
      }

      const timestamp = Date.now();
      const fileName = `${userId}/${timestamp}-${file.name}`;
      const filePath = `community-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.COMMUNITY_IMAGES || 'community-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from(STORAGE_BUCKETS.COMMUNITY_IMAGES || 'community-images')
        .getPublicUrl(filePath);

      return data?.publicUrl || null;
    } catch (err) {
      console.error('[v0] Error uploading image:', err);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    uploading,
    uploadImage,
  };
};

// Hook for managing message images and subcategories
export const useCommunityMessageEnhanced = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const addImageUrl = useCallback((url: string) => {
    setImageUrls((prev) => {
      if (prev.length >= 3) {
        toast.error('Maximum 3 images per message');
        return prev;
      }
      return [...prev, url];
    });
  }, []);

  const removeImageUrl = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearImages = useCallback(() => {
    setImageUrls([]);
  }, []);

  return {
    imageUrls,
    addImageUrl,
    removeImageUrl,
    clearImages,
  };
};
