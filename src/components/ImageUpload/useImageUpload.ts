import { useState, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { db } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface UseImageUploadOptions {
  teamType: 'executive' | 'classRep' | 'press';
  memberId: string;
}

export function useImageUpload({ teamType, memberId }: UseImageUploadOptions) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      if (!file.type.startsWith('image/')) throw new Error('Please select an image file');
      if (file.size > 5 * 1024 * 1024) throw new Error('File size must be less than 5MB');

      const fileExt = file.name.split('.').pop();
      const fileName = `team-images/${teamType}/${memberId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-pictures').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // Persist to Firestore
      await setDoc(
        doc(db, 'teamImages', `${teamType}_${memberId}`),
        { teamType, memberId, imageUrl: publicUrl, updatedAt: new Date().toISOString() },
        { merge: true }
      );

      setImageUrl(publicUrl);
      return publicUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [teamType, memberId]);

  const clearError = useCallback(() => setError(null), []);
  const resetImage = useCallback(() => setImageUrl(null), []);

  return { imageUrl, isUploading, error, uploadImage, clearError, resetImage };
}
