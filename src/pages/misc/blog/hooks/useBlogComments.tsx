/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useGetUserInfo } from "../../../../hooks/auth/useGetUserInfo";
import { getCurrentTime } from "../../../../helpers/getCurrentTime";
import { useParams } from "react-router-dom";
import {
  collection,
  setDoc,
  query,
  where,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../../config/firebase";
import { IPostComment } from "../../../../models/misc/blog/postComments";
import { notifyUser } from "../../../../helpers/notifyUser";
import { v4 as uuid } from "uuid";
import { getCurrentDateInShortFormat } from "../../../../helpers/formatDate";
import { useNavigate } from "react-router-dom";

export const useBlogComments = () => {
  const { postID } = useParams();
  const navigate = useNavigate();
  const commentsRef = collection(db, "postsComments");
  const [userComment, setUserComment] = useState<string>("");
  const [replyComment, setReplyComment] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<IPostComment[] | null>(null);
  const [postCommentsLoading, setPostCommentsLoading] = useState<boolean>(true);
  const [postCommentsError, setPostCommentsError] = useState<boolean>(false);
  const [deleteCommentLoading, setDeleteCommentLoading] =
    useState<boolean>(false);
  const [deleteCommentError, setDeleteCommentError] = useState<boolean>(false);
  const { userID, studentDetails } = useGetUserInfo();

  const getPostComments = async () => {
    if (!postID) return;
    
    setPostCommentsLoading(true);
    setPostCommentsError(false);
    try {
      const postCommentsRef = query(
        commentsRef,
        where("commentPostID", "==", postID)
      );
      
      // Set up real-time listener instead of just fetching once
      const unsubscribe = onSnapshot(
        postCommentsRef,
        (data) => {
          const comments = data.docs.map((doc) => ({
            ...doc.data(),
          })) as IPostComment[];
          setPostComments(comments);
          setPostCommentsLoading(false);
          console.log("[v0] Comments updated:", comments);
        },
        (err) => {
          console.error("[v0] Error listening to comments:", err);
          setPostCommentsError(true);
          setPostCommentsLoading(false);
        }
      );
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (err) {
      console.error("[v0] Error setting up comments listener:", err);
      setPostCommentsError(true);
      setPostCommentsLoading(false);
    }
  };
  const addUserComment = async () => {
    if (!userID) {
      navigate("/login");
      notifyUser("info", "Please login to comment on this post");
      return;
    }

    if (!studentDetails || !postID) {
      notifyUser("error", "Something went wrong. Please try again");
      return;
    }

    if (!userComment.trim()) {
      notifyUser("info", "Please add a comment");
      return;
    }

    try {
      const { firstName, lastName, email, profileImageID, profileImageURL } =
        studentDetails;
      const commentID = uuid();
      const commentInfo: IPostComment = {
        commentPostID: postID,
        commentUserID: userID,
        commentID,
        firstName,
        lastName,
        email,
        comment: userComment,
        time: getCurrentTime(),
        date: getCurrentDateInShortFormat(),
        timeStamp: new Date(),
        profileImageID,
        profileImageURL,
      };

      await setDoc(doc(db, "postsComments", commentID), commentInfo);
      setUserComment("");
      notifyUser("success", "Comment posted!");
    } catch (err) {
      notifyUser(
        "error",
        "Couldn't post comment. Please check your network connection and try again."
      );
    }
  };

  const addReplyComment = async (parentCommentID: string) => {
    if (!userID) {
      navigate("/login");
      notifyUser("info", "Please login to reply");
      return;
    }

    if (!studentDetails || !postID) {
      notifyUser("error", "Something went wrong. Please try again");
      return;
    }

    if (!replyComment.trim()) {
      notifyUser("info", "Please add a reply");
      return;
    }

    try {
      const { firstName, lastName, email, profileImageID, profileImageURL } =
        studentDetails;
      const commentID = uuid();
      const replyInfo: IPostComment = {
        commentPostID: postID,
        commentUserID: userID,
        commentID,
        firstName,
        lastName,
        email,
        comment: replyComment,
        time: getCurrentTime(),
        date: getCurrentDateInShortFormat(),
        timeStamp: new Date(),
        profileImageID,
        profileImageURL,
        parentCommentID,
      };

      await setDoc(doc(db, "postsComments", commentID), replyInfo);
      setReplyComment("");
      setReplyingTo(null);
      notifyUser("success", "Reply posted!");
    } catch (err) {
      notifyUser(
        "error",
        "Couldn't post reply. Please check your network connection and try again."
      );
    }
  };

  const deleteUserComment = async (
    commentID: string,
    commentUserID: string
  ) => {
    if (commentUserID === userID) {
      setDeleteCommentLoading(true);
      try {
        await deleteDoc(doc(commentsRef, commentID));
        notifyUser("success", "Comment deleted.");
        // Real-time listener in useEffect will automatically update the comments
        setDeleteCommentLoading(false);
      } catch (err) {
        console.error("[v0] Error deleting comment:", err);
        notifyUser("error", "Couldn't delete comment");
        setDeleteCommentLoading(false);
        setDeleteCommentError(true);
      }
    }
  };

  useEffect(() => {
    const commentsQuery = query(
      commentsRef,
      where("commentPostID", "==", postID)
    );
    const unsubscribe = onSnapshot(commentsQuery, (querySnapshot) => {
      const updatedComments: IPostComment[] = [];
      querySnapshot.forEach((doc) => {
        updatedComments.push({ ...doc.data() } as IPostComment);
      });
      setPostComments(updatedComments);
    });

    return () => unsubscribe();
  }, []);

  return {
    setUserComment,
    userComment,
    postComments,
    addUserComment,
    getPostComments,
    postCommentsLoading,
    postCommentsError,
    deleteUserComment,
    deleteCommentLoading,
    deleteCommentError,
    replyComment,
    setReplyComment,
    replyingTo,
    setReplyingTo,
    addReplyComment,
  };
};
