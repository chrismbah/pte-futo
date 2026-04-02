import { IoHeartOutline, IoChatbubbleOutline } from "react-icons/io5";

interface EngagementStatsProps {
  likes?: number;
  commentCount?: number;
  className?: string;
}

export const EngagementStats = ({ likes = 0, commentCount, className = "" }: EngagementStatsProps) => {
  return (
    <div className={`flex items-center gap-3 text-gray-500 flex-shrink-0 ${className}`}>
      {/* Likes */}
      <span className="flex items-center gap-1 text-xs">
        <IoHeartOutline className="w-3.5 h-3.5" />
        {likes > 0 ? likes : 0}
      </span>
      
      {/* Comments - only show if count is provided */}
      {commentCount !== undefined && (
        <span className="flex items-center gap-1 text-xs">
          <IoChatbubbleOutline className="w-3.5 h-3.5" />
          {commentCount}
        </span>
      )}
    </div>
  );
};
