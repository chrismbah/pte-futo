# Team Image Upload System - Setup Guide

## Overview
This system makes it easy to upload and manage images for the Executive Team, Class Representatives, and Press Team without rewriting your codebase.

## Components

### 1. **ImageUploadModal** (`/components/ImageUpload/ImageUploadModal.tsx`)
   - Reusable modal for uploading images
   - File validation (size, type)
   - Image preview
   - Error handling

### 2. **useImageUpload** Hook (`/components/ImageUpload/useImageUpload.ts`)
   - Manages image upload state
   - Handles Supabase storage integration
   - Can be used independently in any component

### 3. **TeamUploadManager** (`/components/ImageUpload/TeamUploadManager.tsx`)
   - Displays all team members with their current images
   - Provides "Change Photo" button for each member
   - Manages the upload modal

### 4. **Admin Page** (`/pages/admin/TeamImageUpload.tsx`)
   - Complete admin interface for all three teams
   - Access via `/admin/team-image-upload`

## Setup Instructions

### Step 1: Create Supabase Storage Bucket
1. Go to your Supabase dashboard
2. Navigate to **Storage** → **Create new bucket**
3. Name it: `team-images`
4. Set visibility to **Public** (so images can be accessed)
5. Click **Create**

### Step 2: Set Storage Policies (Optional but Recommended)
For security, you may want to add Row Level Security (RLS) policies. Contact Supabase docs for details.

### Step 3: Update Your Pages to Use the Hook
You can integrate image uploads in two ways:

#### Option A: Use in Existing Pages (Minimal Changes)
Add an edit button to your existing team pages:

```tsx
import { useImageUpload } from '../../components/ImageUpload/useImageUpload';

export default function EbsumsaTeam() {
  const imageUpload = useImageUpload({ 
    teamType: 'executive', 
    memberId: 'president' 
  });

  return (
    // Your existing JSX
    <button onClick={() => setIsUploadOpen(true)}>
      Upload Image
    </button>
  );
}
```

#### Option B: Use Admin Panel
- Access `/admin/team-image-upload`
- Upload images for all teams from one place
- No changes needed to existing pages

### Step 4: Connect Data Files (if needed)
If you want the admin page to work with your data:
- Create `/src/data/teams/executive.ts` with your executive data
- Create `/src/data/teams/press.ts` with your press data
- Or update the paths in `TeamImageUpload.tsx` to match your file locations

## Usage

### From Admin Panel
1. Navigate to `/admin/team-image-upload`
2. Click "Change Photo" on any team member
3. Select an image file
4. Click "Upload"
5. Image is automatically saved to Supabase and replaces the old one

### From Code (Advanced)
```tsx
import { useImageUpload } from '@/components/ImageUpload/useImageUpload';

function MyComponent() {
  const { uploadImage, imageUrl, isUploading } = useImageUpload({
    teamType: 'executive',
    memberId: 'president',
  });

  const handleFileSelect = async (file: File) => {
    const url = await uploadImage(file);
    if (url) {
      // Image uploaded successfully
    }
  };

  return (
    <input 
      type="file" 
      onChange={(e) => handleFileSelect(e.target.files[0])} 
    />
  );
}
```

## Image Naming Convention
Uploaded images are organized by team type:
```
team-images/
├── executive/
│   ├── president_1700000000000.jpg
│   ├── exec-0_1700000000001.jpg
├── classRep/
│   ├── classrep-0_1700000000002.jpg
├── press/
    ├── editor-in-chief_1700000000003.jpg
```

## File Size Limits
- Maximum file size: **5MB**
- Supported formats: JPEG, PNG, WebP, GIF

## Troubleshooting

### "Upload failed" error
- Check that `team-images` bucket exists in Supabase
- Verify environment variables are set correctly
- Check Supabase storage is public

### Images not showing
- Ensure the bucket is public
- Check that the URL is correct in Supabase console
- Clear browser cache

### CORS Issues
- Make sure your Supabase bucket CORS settings allow your domain

## Environment Variables
Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Future Enhancements
- Add image cropping before upload
- Add bulk upload for multiple images
- Add image optimization (compression)
- Add undo/delete functionality
- Add analytics for upload tracking
