/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useModalContext } from "../../context/Modal";
import { Spinner } from "../loaders/Spinner";
import { CancelIcon } from "../icons/general/CancelIcon";
import { useGetUserInfo } from "../../hooks/auth/useGetUserInfo";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { notifyUser } from "../../helpers/notifyUser";
import { motion } from "framer-motion";
import { scaleInVariants1 } from "../../animation/variants";

export const DeleteProfileImage = () => {
  const { openDeleteProfileImageModal, setOpenDeleteProfileImageModal } =
    useModalContext();
  const { userID } = useGetUserInfo();
  const [deletingProfileImage, setDeletingProfileImage] = useState(false);

  const deleteUserProfileImage = async () => {
    if (!userID) {
      notifyUser("error", "User not found. Please try again.");
      return;
    }

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
  };

  useEffect(() => {
    if (openDeleteProfileImageModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
  }, [openDeleteProfileImageModal]);

  return (
    <>
      <div
        className={`${
          openDeleteProfileImageModal ? "block" : "hidden"
        } z-[99] bg-black/50 backdrop-blur-sm fixed top-0 right-0 left-0  min-h-screen overflow-y-auto overflow-x-hidden flex items-center justify-center`}
      >
        <motion.div
          variants={scaleInVariants1}
          initial="initial"
          whileInView="animate"
          className="bg-white rounded-lg py-4 px-3 ss:p-6 relative shadow w-[90%] sm:w-[600px] z-[999]"
        >
          <div className="w-full flex flex-col justify-start">
            <h4 className="font-bold text-base sm:text-md text-left px-0 py-2 sm:p-3 border-b border-b-gray-300">
              Delete Profile Picture
            </h4>
            <h3 className=" mb-5 text-ss ss:text-sm font-medium sm:text-xs text-gray-600 py-3 sm:px-3 sm:py-6  border-b border-b-gray-300">
              Are you sure you want to delete your profile picture?
            </h3>
            <div className="flex justify-end gap-4">
              <button
                className="bg-green4 hover:green1 font-semibold py-2 px-2.5  rounded-md text-ss sm:text-sm text-white"
                onClick={deleteUserProfileImage}
              >
                {deletingProfileImage ? (
                  <Spinner className="w-4 h-4 md:w-5 md:h-5 text-transparent animate-spin fill-white" />
                ) : (
                  "Delete"
                )}
              </button>
              <button
                className="bg-gray-200 font-semibold py-2 px-2.5  rounded-md text-ss sm:text-sm text-black"
                onClick={() => setOpenDeleteProfileImageModal(false)}
              >
                Cancel
              </button>
            </div>
            <button
              className="font-bold p-2 rounded-md absolute top-1 right-1 xsm:top-2 xsm:right-2 hover:bg-gray-50"
              onClick={() => setOpenDeleteProfileImageModal(false)}
            >
              <CancelIcon className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};
