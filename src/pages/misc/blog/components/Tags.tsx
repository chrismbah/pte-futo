import { FC } from "react";
import { Link } from "react-router-dom";
import { IoPricetagOutline } from "react-icons/io5";

interface TagsProps {
  tags?: string[];
  size?: "sm" | "md";
  linkable?: boolean;
  maxVisible?: number;
}

export const Tags: FC<TagsProps> = ({ 
  tags, 
  size = "sm", 
  linkable = true,
  maxVisible 
}) => {
  if (!tags || tags.length === 0) return null;

  const displayTags = maxVisible ? tags.slice(0, maxVisible) : tags;
  const remainingCount = maxVisible && tags.length > maxVisible ? tags.length - maxVisible : 0;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  const TagContent = ({ tag }: { tag: string }) => (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses[size]} bg-gray-100 text-gray-600 rounded-full hover:bg-green2/10 hover:text-green2 transition-colors`}
    >
      <IoPricetagOutline className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      {tag}
    </span>
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map((tag) =>
        linkable ? (
          <Link
            key={tag}
            to={`/blog?tag=${encodeURIComponent(tag)}`}
            className="cursor-pointer"
          >
            <TagContent tag={tag} />
          </Link>
        ) : (
          <span key={tag}>
            <TagContent tag={tag} />
          </span>
        )
      )}
      {remainingCount > 0 && (
        <span className={`${sizeClasses[size]} text-gray-400`}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

// Separate component for showing all tags from a post collection
interface AllTagsProps {
  posts: { tags?: string[] }[];
  selectedTag?: string | null;
  onTagSelect?: (tag: string | null) => void;
}

export const AllTags: FC<AllTagsProps> = ({ posts, selectedTag, onTagSelect }) => {
  // Extract all unique tags
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags || []))
  ).sort();

  if (allTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagSelect?.(null)}
        className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-colors ${
          selectedTag === null
            ? "bg-green2 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagSelect?.(tag)}
          className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-colors ${
            selectedTag === tag
              ? "bg-green2 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <IoPricetagOutline className="w-3 h-3" />
          {tag}
        </button>
      ))}
    </div>
  );
};
