/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { IBlogPost, TBlogPost } from "../../../../models/misc/blog/blogPosts";
import { db, isFirebaseConfigured } from "../../../../config/firebase";
import { notifyUser } from "../../../../helpers/notifyUser";
import { localBlogPosts } from "../../../../data/misc/blog/posts";

export const useFetchBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState<IBlogPost[] | null>(null);
  const [homeBlogPosts, setHomeBlogPosts] = useState<IBlogPost[] | null>(null);
  const [blogPost, setBlogPost] = useState<TBlogPost | null>(null);
  const [blogPostsLoading, setBlogPostsLoading] = useState(true);
  const [homeBlogPostsLoading, setHomeBlogPostsLoading] = useState(true);
  const [blogPostsError, setBlogPostsError] = useState(false);
  const [homeBlogPostsError, setHomeBlogPostsError] = useState(false);
  const [blogPostLoading, setBlogPostLoading] = useState(true);
  const [blogPostError, setBlogPostError] = useState(false);

  const fetchBlogPosts = async () => {
    setBlogPostsLoading(true);
    
    // If Firebase is not configured, use local data
    if (!isFirebaseConfigured) {
      setBlogPosts(localBlogPosts);
      setBlogPostsLoading(false);
      return;
    }

    const postsRef = collection(db, "blogPosts");
    const postsQuery = query(postsRef);
    try {
      onSnapshot(
        postsQuery,
        (querySnapshot) => {
          const firebasePosts: IBlogPost[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Ensure the post has valid contents array
            if (data.contents && Array.isArray(data.contents)) {
              firebasePosts.push({ ...data, id: docSnap.id } as IBlogPost);
            }
          });
          
          // Merge Firebase posts with local posts, avoiding duplicates
          // Firebase posts take priority (newer content from admin)
          const firebasePostNos = new Set(firebasePosts.map(p => p.no));
          const localPostsFiltered = localBlogPosts.filter(p => !firebasePostNos.has(p.no));
          
          // Combine and sort by date/no (newest first)
          const allPosts = [...firebasePosts, ...localPostsFiltered].sort((a, b) => b.no - a.no);
          
          setBlogPosts(allPosts);
          setBlogPostsLoading(false);
        },
        () => {
          // Use local fallback on error
          setBlogPosts(localBlogPosts);
          setBlogPostsLoading(false);
          setBlogPostsError(false);
        }
      );
    } catch {
      // Use local fallback on catch
      setBlogPosts(localBlogPosts);
      setBlogPostsLoading(false);
      setBlogPostsError(false);
    }
  };
  const fetchHomeBlogPosts = async () => {
    setHomeBlogPostsLoading(true);
    
    // If Firebase is not configured, use local data
    if (!isFirebaseConfigured) {
      const shuffled = [...localBlogPosts].sort(() => 0.5 - Math.random());
      setHomeBlogPosts(shuffled);
      setHomeBlogPostsLoading(false);
      return;
    }

    const postsRef = collection(db, "blogPosts");
    const postsQuery = query(postsRef);
    try {
      onSnapshot(
        postsQuery,
        (querySnapshot) => {
          const firebasePosts: IBlogPost[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.contents && Array.isArray(data.contents)) {
              firebasePosts.push({ ...data, id: docSnap.id } as IBlogPost);
            }
          });
          
          // Merge Firebase posts with local posts
          const firebasePostNos = new Set(firebasePosts.map(p => p.no));
          const localPostsFiltered = localBlogPosts.filter(p => !firebasePostNos.has(p.no));
          const allPosts = [...firebasePosts, ...localPostsFiltered];
          
          const shuffled = allPosts.sort(() => 0.5 - Math.random());
          setHomeBlogPosts(shuffled);
          setHomeBlogPostsLoading(false);
        },
        () => {
          // Use local fallback on error
          const shuffled = [...localBlogPosts].sort(() => 0.5 - Math.random());
          setHomeBlogPosts(shuffled);
          setHomeBlogPostsLoading(false);
          setHomeBlogPostsError(false);
        }
      );
    } catch {
      // Use local fallback on catch
      const shuffled = [...localBlogPosts].sort(() => 0.5 - Math.random());
      setHomeBlogPosts(shuffled);
      setHomeBlogPostsLoading(false);
      setHomeBlogPostsError(false);
    }
  };
  const fetchBlogPost = async (postNo: string) => {
    setBlogPostLoading(true);
    const postNumber = parseInt(postNo, 10);
    
    // If Firebase is not configured, use local data
    if (!isFirebaseConfigured) {
      const localPost = localBlogPosts.find(p => p.no === postNumber || p.id === postNo);
      if (localPost) {
        setBlogPost(localPost as unknown as TBlogPost);
      } else {
        setBlogPost(null);
      }
      setBlogPostLoading(false);
      return;
    }

    // First try to find from Firebase by post number
    const postsRef = collection(db, "blogPosts");
    const postsQuery = query(postsRef);
    try {
      const unsubscribe = onSnapshot(
        postsQuery,
        (querySnapshot) => {
          let foundPost: TBlogPost | null = null;
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data() as TBlogPost;
            if (data.no === postNumber) {
              foundPost = { ...data, id: docSnap.id } as unknown as TBlogPost;
            }
          });
          
          if (foundPost) {
            setBlogPost(foundPost);
            setBlogPostLoading(false);
          } else {
            // Try to find in local fallback data
            const localPost = localBlogPosts.find(p => p.no === postNumber || p.id === postNo);
            if (localPost) {
              setBlogPost(localPost as unknown as TBlogPost);
            } else {
              setBlogPost(null);
            }
            setBlogPostLoading(false);
          }
          unsubscribe();
        },
        () => {
          // Try to find in local fallback data on error
          const localPost = localBlogPosts.find(p => p.no === postNumber || p.id === postNo);
          if (localPost) {
            setBlogPost(localPost as unknown as TBlogPost);
            setBlogPostLoading(false);
          } else {
            setBlogPostLoading(false);
            setBlogPostError(true);
          }
        }
      );
    } catch (error) {
      // Try to find in local fallback data on error
      const localPost = localBlogPosts.find(p => p.no === postNumber || p.id === postNo);
      if (localPost) {
        setBlogPost(localPost as unknown as TBlogPost);
        setBlogPostLoading(false);
      } else {
        setBlogPostLoading(false);
        setBlogPostError(true);
        notifyUser("error", "An error occured. Please try again");
      }
    }
  };

  return {
    blogPosts,
    blogPost,
    fetchBlogPosts,
    fetchBlogPost,
    fetchHomeBlogPosts,
    homeBlogPosts,
    homeBlogPostsError,
    homeBlogPostsLoading,
    blogPostsLoading,
    blogPostLoading,
    blogPostsError,
    blogPostError,
  };
};
