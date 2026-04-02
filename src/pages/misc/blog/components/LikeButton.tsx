import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { useBlogLikes } from "../hooks/useBlogLikes";

interface LikeButtonProps {
  variant?: "default" | "compact";
}

export const LikeButton = ({ variant = "default" }: LikeButtonProps) => {
  const { likes, isLiked, likesLoading, toggleLike } = useBlogLikes();

  if (variant === "compact") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleLike();
        }}
        disabled={likesLoading}
        className={`flex items-center gap-1 text-xs transition-colors ${
          isLiked 
            ? "text-red-500" 
            : "text-gray-500 hover:text-red-500"
        }`}
        aria-label={isLiked ? "Unlike post" : "Like post"}
      >
        {isLiked ? (
          <IoHeart className="w-4 h-4" />
        ) : (
          <IoHeartOutline className="w-4 h-4" />
        )}
        <span>{likes > 0 ? likes : ""}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLike}
      disabled={likesLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
        isLiked
          ? "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-red-500"
      } ${likesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={isLiked ? "Unlike post" : "Like post"}
    >
      {isLiked ? (
        <IoHeart className="w-5 h-5" />
      ) : (
        <IoHeartOutline className="w-5 h-5" />
      )}
      <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
    </button>
  );
};
