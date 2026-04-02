import React, { useState, useRef } from 'react';
import { supabase } from '../../config/supabase';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (imageUrl: string) => void;
  memberId: string;
  teamType: 'executive' | 'classRep' | 'press';
  memberName: string;
}

/** Compress + resize an image to max 800x800, JPEG quality 0.8 */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        },
        'image/jpeg',
        0.8
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  memberId,
  teamType,
  memberName,
}: ImageUploadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB');
      return;
    }

    setError('');
    setCompressedSize(null);

    try {
      const compressed = await compressImage(file);
      const sizeKB = Math.round(compressed.size / 1024);
      setCompressedSize(
        `Compressed to ${sizeKB < 1024 ? `${sizeKB} KB` : `${(sizeKB / 1024).toFixed(1)} MB`}`
      );
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError('Please select an image');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const file = fileInputRef.current.files[0];

      let uploadBlob: Blob;
      try {
        uploadBlob = await compressImage(file);
      } catch {
        uploadBlob = file;
      }

      const fileName = `team-images/${teamType}/${memberId}_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, uploadBlob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Persist image URL to Supabase team_images table
      await supabase
        .from('team_images')
        .upsert(
          {
            id: `${teamType}_${memberId}`,
            team_type: teamType,
            member_id: memberId,
            image_url: publicUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      onUploadSuccess(publicUrl);
      setPreview(null);
      setCompressedSize(null);
      setIsLoading(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setCompressedSize(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Upload Photo</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              For <span className="font-semibold text-gray-700">{memberName}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        {preview ? (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Preview</p>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green2 mx-auto">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            {compressedSize && (
              <p className="text-xs text-green2 text-center mt-2 font-medium">
                {compressedSize} — ready to upload
              </p>
            )}
          </div>
        ) : (
          <div className="mb-5 w-32 h-32 rounded-full bg-gray-100 border-4 border-dashed border-gray-200 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )}

        {/* File input */}
        <div className="mb-4">
          <label
            htmlFor="team-image-input"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-green2 hover:text-green2 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {preview ? 'Choose different photo' : 'Choose photo'}
          </label>
          <input
            id="team-image-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
          <p className="text-xs text-gray-400 text-center mt-1.5">
            JPG, PNG, WebP — auto-compressed before upload
          </p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-2.5">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isLoading || !preview}
            className="flex-1 py-2.5 bg-green2 text-white text-sm font-semibold rounded-xl hover:bg-green1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Uploading...
              </>
            ) : 'Save Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
