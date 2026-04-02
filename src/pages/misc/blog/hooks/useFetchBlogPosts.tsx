import { useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { IBlogPost, TBlogPost } from "../../../../models/misc/blog/blogPosts";
import { db, isFirebaseConfigured } from "../../../../config/firebase";
import { notifyUser } from "../../../../helpers/notifyUser";
import { localBlogPosts } from "../../../../data/misc/blog/posts";

const mergeWithLocal = (firebasePosts: IBlogPost[]): IBlogPost[] => {
  const firebaseNos = new Set(firebasePosts.map((p) => p.no));
  const filtered = localBlogPosts.filter((p) => !firebaseNos.has(p.no));
  return [...firebasePosts, ...(filtered as IBlogPost[])];
};

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
    setBlogPostsError(false);

    if (!isFirebaseConfigured) {
      setBlogPosts(localBlogPosts as IBlogPost[]);
      setBlogPostsLoading(false);
      return;
    }

    try {
      const snap = await getDocs(query(collection(db, "blogPosts")));
      const firebasePosts: IBlogPost[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.contents && Array.isArray(data.contents)) {
          firebasePosts.push({ ...data, id: d.id } as IBlogPost);
        }
      });
      const all = mergeWithLocal(firebasePosts).sort((a, b) => b.no - a.no);
      setBlogPosts(all);
    } catch {
      setBlogPosts(localBlogPosts as IBlogPost[]);
    } finally {
      setBlogPostsLoading(false);
    }
  };

  const fetchHomeBlogPosts = async () => {
    setHomeBlogPostsLoading(true);
    setHomeBlogPostsError(false);

    if (!isFirebaseConfigured) {
      setHomeBlogPosts([...localBlogPosts].sort(() => 0.5 - Math.random()) as IBlogPost[]);
      setHomeBlogPostsLoading(false);
      return;
    }

    try {
      const snap = await getDocs(query(collection(db, "blogPosts")));
      const firebasePosts: IBlogPost[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.contents && Array.isArray(data.contents)) {
          firebasePosts.push({ ...data, id: d.id } as IBlogPost);
        }
      });
      const all = mergeWithLocal(firebasePosts).sort(() => 0.5 - Math.random());
      setHomeBlogPosts(all);
    } catch {
      setHomeBlogPosts([...localBlogPosts].sort(() => 0.5 - Math.random()) as IBlogPost[]);
    } finally {
      setHomeBlogPostsLoading(false);
    }
  };

  const fetchBlogPost = async (postNo: string) => {
    setBlogPostLoading(true);
    setBlogPostError(false);
    const postNumber = parseInt(postNo, 10);

    if (!isFirebaseConfigured) {
      const local = localBlogPosts.find((p) => p.no === postNumber || p.id === postNo);
      setBlogPost(local ? (local as unknown as TBlogPost) : null);
      setBlogPostLoading(false);
      return;
    }

    try {
      const snap = await getDocs(query(collection(db, "blogPosts")));
      let found: TBlogPost | null = null;
      snap.forEach((d) => {
        const data = d.data() as TBlogPost;
        if (data.no === postNumber) {
          found = { ...data, id: d.id } as unknown as TBlogPost;
        }
      });

      if (found) {
        setBlogPost(found);
      } else {
        const local = localBlogPosts.find((p) => p.no === postNumber || p.id === postNo);
        setBlogPost(local ? (local as unknown as TBlogPost) : null);
      }
    } catch {
      const local = localBlogPosts.find((p) => p.no === postNumber || p.id === postNo);
      if (local) {
        setBlogPost(local as unknown as TBlogPost);
      } else {
        setBlogPostError(true);
        notifyUser("error", "An error occurred. Please try again");
      }
    } finally {
      setBlogPostLoading(false);
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
