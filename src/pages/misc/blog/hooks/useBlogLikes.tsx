/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { useGetUserInfo } from "../../../../hooks/auth/useGetUserInfo";
import { useParams } from "react-router-dom";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../../../config/firebase";
import { notifyUser } from "../../../../helpers/notifyUser";
import { useNavigate } from "react-router-dom";

export const useBlogLikes = () => {
  const { postID } = useParams();
  const navigate = useNavigate();
  const [likedBy, setLikedBy] = useState<string[]>([]);
  const [likesLoading, setLikesLoading] = useState<boolean>(false);
  const [docId, setDocId] = useState<string | null>(null);
  const { userID } = useGetUserInfo();

  // Derive likes count and isLiked from likedBy array (single source of truth)
  const likes = likedBy.length;
  const isLiked = userID ? likedBy.includes(userID) : false;

  // Find the actual document ID by post number and listen to likes in real-time
  useEffect(() => {
    if (!postID || !isFirebaseConfigured) return;

    const postNumber = parseInt(postID, 10);
    const postsRef = collection(db, "blogPosts");
    const postsQuery = query(postsRef, where("no", "==", postNumber));

    const findAndSubscribe = async () => {
      try {
        const querySnapshot = await getDocs(postsQuery);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const actualDocId = docSnap.id;
          setDocId(actualDocId);

          // Subscribe to real-time updates using the actual doc ID
          const postRef = doc(db, "blogPosts", actualDocId);
          const unsubscribe = onSnapshot(postRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              // Only update likedBy array - likes count is derived
              setLikedBy(data.likedBy || []);
            }
          }, (error) => {
            console.error("Error listening to likes:", error);
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error("Error finding post:", error);
      }
    };

    let unsubscribe: (() => void) | undefined;
    findAndSubscribe().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [postID]);

  const toggleLike = useCallback(async () => {
    if (!userID) {
      navigate("/login");
      notifyUser("info", "Please login to like this post");
      return;
    }

    if (!docId || !isFirebaseConfigured) {
      notifyUser("error", "Something went wrong. Please try again");
      return;
    }

    // Prevent double-clicking while loading
    if (likesLoading) return;

    setLikesLoading(true);

    try {
      const postRef = doc(db, "blogPosts", docId);
      const currentlyLiked = likedBy.includes(userID);

      if (currentlyLiked) {
        // Unlike: Remove user from likedBy array
        await updateDoc(postRef, {
          likedBy: arrayRemove(userID),
        });
      } else {
        // Like: Add user to likedBy array (arrayUnion prevents duplicates)
        await updateDoc(postRef, {
          likedBy: arrayUnion(userID),
        });
      }
      // Real-time listener will update the UI automatically and recalculate likes from likedBy array
    } catch (err) {
      console.error("Error toggling like:", err);
      notifyUser("error", "Couldn't update like. Please try again.");
    } finally {
      setLikesLoading(false);
    }
  }, [userID, docId, likedBy, likesLoading, navigate]);

  return {
    likes,
    likedBy,
    isLiked,
    likesLoading,
    toggleLike,
  };
};
