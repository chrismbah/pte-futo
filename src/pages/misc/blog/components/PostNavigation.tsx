import { Link } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { IBlogPost } from "../../../../models/misc/blog/blogPosts";

interface PostNavigationProps {
  currentPostNo: number;
  allPosts: IBlogPost[];
}

export const PostNavigation = ({ currentPostNo, allPosts }: PostNavigationProps) => {
  // Sort posts by number and find adjacent posts
  const sortedPosts = [...allPosts].sort((a, b) => a.no - b.no);
  const currentIndex = sortedPosts.findIndex((p) => p.no === currentPostNo);
  
  const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

  if (!prevPost && !nextPost) return null;

  return (
    <nav 
      aria-label="Post navigation" 
      className="mt-8 pt-6 border-t border-gray-200"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Previous Post */}
        {prevPost ? (
          <Link
            to={`/blog/posts/${encodeURIComponent(prevPost.title)}/${prevPost.no}/${prevPost.postType}`}
            className="group flex-1 flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-green2/50 hover:bg-green2/5 transition-all"
          >
            <IoChevronBack className="w-5 h-5 mt-0.5 text-gray-400 group-hover:text-green2 flex-shrink-0 transition-colors" />
            <div className="min-w-0">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Previous</span>
              <p className="font-medium text-gray-900 group-hover:text-green2 line-clamp-2 transition-colors">
                {prevPost.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {/* Next Post */}
        {nextPost ? (
          <Link
            to={`/blog/posts/${encodeURIComponent(nextPost.title)}/${nextPost.no}/${nextPost.postType}`}
            className="group flex-1 flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-green2/50 hover:bg-green2/5 transition-all text-right sm:flex-row-reverse"
          >
            <IoChevronForward className="w-5 h-5 mt-0.5 text-gray-400 group-hover:text-green2 flex-shrink-0 transition-colors" />
            <div className="min-w-0">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Next</span>
              <p className="font-medium text-gray-900 group-hover:text-green2 line-clamp-2 transition-colors">
                {nextPost.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </nav>
  );
};
