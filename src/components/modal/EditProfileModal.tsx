/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { useModalContext } from "../../context/Modal";
import { CancelIcon } from "../icons/general/CancelIcon";
import { useGetUserInfo } from "../../hooks/auth/useGetUserInfo";
import Lottie from "lottie-react";
import { Spinner } from "../../components/loaders/Spinner";
import avatar from "../../json/animation/avatar1.json";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { editProfileSchema } from "../../validation";
import { IEditProfileForm } from "../../models/student/editProfile";
import { notifyUser } from "../../helpers/notifyUser";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { motion } from "framer-motion";
import { scaleInVariants1 } from "../../animation/variants";
import { supabase, STORAGE_BUCKETS, getPublicUrl } from "../../config/supabase";
import { CameraIcon } from "../icons/general/CameraIcon";

export const EditProfileModal = () => {
  const { openEditProfileModal, setOpenEditProfileModal } = useModalContext();
  const { userID, studentDetails } = useGetUserInfo();
  const [editingProfile, setEditingProfile] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setImageFile(selectedFile);
      // Create local preview URL
      const localPreviewURL = URL.createObjectURL(selectedFile);
      setImagePreview(localPreviewURL);
    } else {
      notifyUser("error", "Please choose a valid image file (PNG, JPG or WEBP).");
      e.target.value = "";
    }
  };

  // Upload image to Supabase Storage
  const uploadProfileImage = async (): Promise<string | null> => {
    if (!imageFile || !userID) return null;
    
    try {
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${userID}/profile-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.PROFILE_PICTURES)
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      return getPublicUrl(STORAGE_BUCKETS.PROFILE_PICTURES, data.path);
    } catch (error: any) {
      console.error("Supabase upload error:", error);
      throw error;
    }
  };
  useEffect(() => {
    if (openEditProfileModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
  }, [openEditProfileModal]);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IEditProfileForm>({
    resolver: yupResolver(editProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      regNo: "",
      level: "",
    },
  });

  const closeEditProfileModal = () => {
    setOpenEditProfileModal(false);
    reset();
    setImageFile(null);
    setImagePreview(null);
  };

  const editProfile = async (data: IEditProfileForm) => {
    setEditingProfile(true);
    notifyUser("loading", "Updating user profile...");
    const { firstName, lastName, regNo, level } = data;
    if (userID) {
      try {
        const userInfoRef = doc(db, "userInfo", userID);
        
        // Prepare update data
        const updateData: any = {
          firstName,
          lastName,
          regNo,
          level,
        };

        // Upload profile image if one was selected
        if (imageFile) {
          const imageUrl = await uploadProfileImage();
          if (imageUrl) {
            updateData.profileImageURL = imageUrl;
          }
        }

        await updateDoc(userInfoRef, updateData);
        setEditingProfile(false);
        setOpenEditProfileModal(false);
        reset();
        setImageFile(null);
        setImagePreview(null);
        notifyUser("success", "User profile updated successfully!");
      } catch (err: any) {
        console.log(err);
        setEditingProfile(false);
        notifyUser("error", "Something went wrong. Please try again.");
      }
    } else {
      console.log("error");
    }
  };
  return (
    <>
      <div
        className={`${
          openEditProfileModal ? "block" : "hidden"
        } z-[99] bg-black/50 sss:py-0 backdrop-blur-sm w-full overflow-y-auto min-h-screen fixed top-0 left-0  flex items-center justify-center`}
      >
        <motion.div
          variants={scaleInVariants1}
          initial="initial"
          whileInView="animate"
          className=" bg-white rounded-lg text-center relative shadow w-[95%] xsm:w-[700px] overflow-y-auto max-h-[85vh]"
        >
          <div className=" sticky top-0 right-0 z-[999] bg-white rounded-t-lg w-full flex justify-between items-center p-4 border-b border-b-gray-300">
            <h3 className="font-bold text-base sm:text-md ">
              Edit Your Profile
            </h3>
            <button
              className="font-bold p-2 rounded-lg hover:bg-gray-50"
              onClick={closeEditProfileModal}
            >
              <CancelIcon className="h-3 w-3 xss:w-3 xss:h-3" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-3 w-full py-4 px-3 ss:px-5 sss:px-7">
              {/* Profile Image Upload Section */}
              <div className="relative">
                <div className="w-[80px] h-[80px] xss:w-[100px] xss:h-[100px] sm:w-[120px] sm:h-[120px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : studentDetails?.profileImageURL ? (
                    <img 
                      src={studentDetails.profileImageURL} 
                      alt="Current profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Lottie
                      animationData={avatar}
                      loop={false}
                      className="w-full h-full"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-green1 rounded-full p-1.5 sm:p-2 hover:bg-green-600 transition-colors shadow-md"
                >
                  <CameraIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm sm:text-base font-semibold text-gray-700">
                  Update your profile
                </p>
                <p className="text-xss ss:text-xs text-gray-500">
                  Click the camera icon to change photo
                </p>
              </div>
            </div>
            <div className="px-3 ss:px-5 sss:px-7 mb-4 sm:mb-7">
              <form onSubmit={handleSubmit(editProfile)}>
                <div className="flex items-center justify-between flex-col xxss:flex-row gap-4 sm:gap-7 mb-4 sm:mb-3">
                  <div className="w-full sss:basis-1/2">
                    <label
                      htmlFor="firstName"
                      className="block text-xss ss:text-ss sm:text-sm text-left font-semibold text-gray-900 "
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id=""
                      className="bg-transparent border border-gray-300 text-gray-900 text-xss ss:text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 sm:p-2.5"
                      placeholder="eg. Chris"
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <p className="form-error-message">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="w-full sss:basis-1/2">
                    <label
                      htmlFor="lastName"
                      className="block text-xss ss:text-ss sm:text-sm text-left font-semibold text-gray-900 "
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id=""
                      className="bg-transparent border border-gray-300 text-gray-900 text-xss ss:text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 sm:p-2.5"
                      placeholder="eg. Mbah"
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p className="form-error-message">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between flex-col xxss:flex-row gap-4 sm:gap-7 mb-4 sm:mb-3">
                  <div className="w-full sss:basis-1/2">
                    <label
                      htmlFor="regNo"
                      className="text-left block text-xss ss:text-ss sm:text-sm font-semibold text-gray-900 "
                    >
                      Matric No.
                    </label>
                    <input
                      type="number"
                      id=""
                      placeholder="eg. 20191129201"
                      className="bg-transparent border border-gray-300 text-gray-900 text-xss ss:text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 sm:p-2.5"
                      {...register("regNo")}
                    />
                  </div>
                  <div className="w-full sss:basis-1/2">
                    <label
                      htmlFor="level"
                      className="text-left block text-xss ss:text-ss sm:text-sm font-semibold text-gray-900 "
                    >
                      Level
                    </label>
                    <select
                      id="underline_select"
                      className="bg-transparent border border-gray-300 text-gray-900 text-xss ss:text-ss sm:text-sm rounded-lg focus:ring-green1 focus:border-green1 block w-full p-1.5 sm:p-2.5"
                      {...register("level")}
                    >
                      <option selected disabled>
                        Select Your Level
                      </option>
                      <option value="Aspirant">Aspirant</option>
                      <option value="100L">100L</option>
                      <option value="200L">200L</option>
                      <option value="300L">300L</option>
                      <option value="400L">400L</option>
                      <option value="500L">500L</option>
                      <option value="600L">600L (Medicine)</option>
                      <option value="Visitor">Visitor</option>
                    </select>
                    {errors.level && (
                      <p className="form-error-message">
                        {errors.level.message}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="w-full flex items-center flex-row justify-end gap-2 px-3 ss:px-5 sss:px-7 pb-9 ss:pb-7 sss:pb-7">
            <button
              type="submit"
              onClick={handleSubmit(editProfile)}
              className=" bg-green1 rounded-lg font-semibold text-ss sm:text-sm px-4 py-2 text-white"
            >
              {editingProfile ? (
                <Spinner className="w-5 h-5 fill-white" />
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              onClick={closeEditProfileModal}
              className=" text-gray-900 bg-gray-50 border border-gray-300 hover:bg-gray-200/90 rounded-lg 
                font-semibold text-ss sm:text-sm px-4 py-2"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};
