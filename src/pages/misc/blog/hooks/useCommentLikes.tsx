/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { useGetUserInfo } from "../../../../hooks/auth/useGetUserInfo";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../../../config/firebase";
import { notifyUser } from "../../../../helpers/notifyUser";
import { useNavigate } from "react-router-dom";

export const useCommentLikes = () => {
  const navigate = useNavigate();
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null);
  const { userID } = useGetUserInfo();

  const toggleCommentLike = async (
    commentID: string,
    _currentLikes: number,
    likedBy: string[]
  ) => {
    if (!userID) {
      navigate("/login");
      notifyUser("info", "Please login to like this comment");
      return;
    }

    if (!isFirebaseConfigured) {
      notifyUser("error", "Something went wrong. Please try again");
      return;
    }

    setLikingCommentId(commentID);

    try {
      const commentRef = doc(db, "postsComments", commentID);
      const isAlreadyLiked = likedBy.includes(userID);

      if (isAlreadyLiked) {
        // Unlike the comment
        await updateDoc(commentRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userID),
        });
      } else {
        // Like the comment
        await updateDoc(commentRef, {
          likes: increment(1),
          likedBy: arrayUnion(userID),
        });
      }
    } catch (err) {
      console.error("Error toggling comment like:", err);
      notifyUser("error", "Couldn't update like. Please try again.");
    } finally {
      setLikingCommentId(null);
    }
  };

  const isCommentLiked = (likedBy: string[] | undefined): boolean => {
    if (!userID || !likedBy) return false;
    return likedBy.includes(userID);
  };

  return {
    toggleCommentLike,
    isCommentLiked,
    likingCommentId,
  };
};
