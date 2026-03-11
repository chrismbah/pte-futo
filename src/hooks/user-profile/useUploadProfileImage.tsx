/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { notifyUser } from "../../helpers/notifyUser";
import { db } from "../../config/firebase";
import { useGetUserInfo } from "../../hooks/auth/useGetUserInfo";
import { updateDoc, doc } from "firebase/firestore";
import { useModalContext } from "../../context/Modal";
import { supabase, STORAGE_BUCKETS, getPublicUrl } from "../../config/supabase";

export const useUploadProfileImage = () => {
  const { studentDetails, userID } = useGetUserInfo();
  const { setOpenDeleteProfileImageModal } = useModalContext();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [imageFileID, setImageFileID] = useState<string | null>(null);
  const [deletingProfileImage, setDeletingProfileImage] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setImageFile(selectedFile);
      setUploadProgress(0);
      // Create local preview URL immediately when file is selected
      const localPreviewURL = URL.createObjectURL(selectedFile);
      setImageURL(localPreviewURL);
    } else {
      notifyUser(
        "error",
        "Please choose a valid image file (PNG, JPG or WEBP)."
      );
      e.target.value = "";
    }
  };

  const uploadProfileImage = async () => {
    if (!imageFile) {
      notifyUser("error", "Please select an image to upload.");
      return;
    }
    if (userID) {
      try {
        notifyUser("loading", "Uploading Image");

        // Generate unique file path for Supabase Storage
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userID}/${studentDetails?.email}-${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKETS.PROFILE_PICTURES)
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (error) {
          throw new Error(`Failed to upload image: ${error.message}`);
        }

        // Get the public URL
        const downloadURL = getPublicUrl(STORAGE_BUCKETS.PROFILE_PICTURES, data.path);
        const fileId = data.path;

        setImageURL(downloadURL);
        setImageFileID(fileId);

        // Automatically save to Firestore so image persists
        await updateDoc(doc(db, "userInfo", userID), {
          profileImageURL: downloadURL,
          profileImageID: fileId,
        });

        notifyUser("success", "Image Uploaded");
      } catch (error: any) {
        console.error("Supabase upload error:", error);
        notifyUser("error", "Failed to upload image. Please try again.");
        setUploadError(error);
      }
    }
  };

  const updateUserProfileLink = async () => {
    if (userID && imageURL && imageURL.length > 1) {
      try {
        await updateDoc(doc(db, "userInfo", userID), {
          profileImageURL: imageURL,
          profileImageID: imageFileID,
        });
        console.log("Done");
        console.log(imageURL);
        // notifyUser("success", "Image Updated");
        setImageFile(null);
      } catch (err) {
        console.log("Error updating doc");
        notifyUser("error", "Sorry couldn't update profile picture");
      }
    }
  };

  const deleteUserProfileImage = async () => {
    if (userID && studentDetails) {
      try {
        setDeletingProfileImage(true);

        // Clear the profile image reference in Firestore
        await updateDoc(doc(db, "userInfo", userID), {
          profileImageURL: "",
          profileImageID: "",
        });

        setDeletingProfileImage(false);
        setOpenDeleteProfileImageModal(false);
        notifyUser("success", "Profile picture deleted");
      } catch (err) {
        console.error("Error deleting profile image:", err);
        notifyUser("error", "Something went wrong. Please try again");
        setOpenDeleteProfileImageModal(false);
        setDeletingProfileImage(false);
      }
    }
  };

  return {
    setImageFile,
    setImageFileID,
    imageFile,
    imageURL,
    uploadProgress,
    uploadError,
    setUploadProgress,
    uploadProfileImage,
    handleFileChange,
    updateUserProfileLink,
    deleteUserProfileImage,
    setImageURL,
    deletingProfileImage,
  };
};
