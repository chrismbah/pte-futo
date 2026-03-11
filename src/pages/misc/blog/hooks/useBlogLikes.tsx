/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
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
  const { postID } = useParams(); // This is actually the post number (no)
  const navigate = useNavigate();
  const [likes, setLikes] = useState<number>(0);
  const [likedBy, setLikedBy] = useState<string[]>([]);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesLoading, setLikesLoading] = useState<boolean>(false);
  const [docId, setDocId] = useState<string | null>(null);
  const { userID } = useGetUserInfo();

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

          // Now subscribe to real-time updates using the actual doc ID
          const postRef = doc(db, "blogPosts", actualDocId);
          const unsubscribe = onSnapshot(postRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              setLikes(data.likes || 0);
              setLikedBy(data.likedBy || []);
              setIsLiked(userID ? (data.likedBy || []).includes(userID) : false);
            }
          }, (error) => {
            console.log("Error listening to likes:", error);
          });

          return unsubscribe;
        }
      } catch (error) {
        console.log("Error finding post:", error);
      }
    };

    let unsubscribe: (() => void) | undefined;
    findAndSubscribe().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [postID, userID]);

  const toggleLike = async () => {
    if (!userID) {
      navigate("/login");
      notifyUser("info", "Please login to like this post");
      return;
    }

    if (!docId || !isFirebaseConfigured) {
      notifyUser("error", "Something went wrong. Please try again");
      return;
    }

    setLikesLoading(true);

    try {
      const postRef = doc(db, "blogPosts", docId);

      if (isLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likes: likes - 1,
          likedBy: arrayRemove(userID),
        });
        setIsLiked(false);
        setLikes((prev) => prev - 1);
      } else {
        // Like the post
        await updateDoc(postRef, {
          likes: likes + 1,
          likedBy: arrayUnion(userID),
        });
        setIsLiked(true);
        setLikes((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      notifyUser("error", "Couldn't update like. Please try again.");
    } finally {
      setLikesLoading(false);
    }
  };

  return {
    likes,
    likedBy,
    isLiked,
    likesLoading,
    toggleLike,
  };
};
