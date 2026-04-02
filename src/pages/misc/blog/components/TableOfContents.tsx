import { FC, useEffect, useState, useMemo } from "react";
import { ContentBlock } from "../../../../models/misc/blog/blogPosts";
import { IoListOutline } from "react-icons/io5";

interface TOCItem {
  id: string;
  text: string;
  level: "h1" | "h2";
}

interface TableOfContentsProps {
  contents: ContentBlock[];
  minHeadings?: number; // Minimum headings required to show TOC
}

export const TableOfContents: FC<TableOfContentsProps> = ({ 
  contents, 
  minHeadings = 3 
}) => {
  const [activeId, setActiveId] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract headings from contents
  const headings = useMemo(() => {
    const items: TOCItem[] = [];
    
    contents.forEach((block, index) => {
      if ((block.type === "h1" || block.type === "h2") && typeof block.content === "string") {
        const id = `heading-${index}-${block.content.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
        items.push({
          id,
          text: block.content,
          level: block.type,
        });
      }
    });
    
    return items;
  }, [contents]);

  // Don't render if not enough headings
  if (headings.length < minHeadings) {
    return null;
  }

  // Track active heading on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -80% 0%",
        threshold: 0,
      }
    );

    // Observe all headings
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-24">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <IoListOutline className="w-5 h-5 text-green2" />
          <h3 className="font-semibold text-sm text-gray-900">Table of Contents</h3>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isCollapsed ? "" : "rotate-180"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!isCollapsed && (
        <nav className="mt-3 space-y-1">
          {headings.map(({ id, text, level }) => (
            <button
              key={id}
              onClick={() => scrollToHeading(id)}
              className={`block w-full text-left text-sm transition-colors duration-200 py-1.5 px-2 rounded-md ${
                level === "h2" ? "pl-4" : ""
              } ${
                activeId === id
                  ? "text-green2 bg-green2/5 font-medium"
                  : "text-gray-600 hover:text-green2 hover:bg-gray-50"
              }`}
            >
              <span className="line-clamp-2">{text}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {headings.length} section{headings.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
};
