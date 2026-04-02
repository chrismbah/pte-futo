import React, { useEffect, useState } from 'react';
import { useSubcategories, Subcategory } from '../../hooks/useCommunityFeatures';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SubcategoryFilterProps {
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export const SubcategoryFilter: React.FC<SubcategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const { subcategories, loading, fetchSubcategories } = useSubcategories();
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 200;
      const newPosition =
        direction === 'left'
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;
      containerRef.current.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Left scroll button */}
      {scrollPosition > 0 && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-md hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        </button>
      )}

      {/* Categories container */}
      <div
        ref={containerRef}
        className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {subcategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange?.(category.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 whitespace-nowrap border-2 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-green1 to-cyan-500 text-white border-transparent shadow-lg'
                : 'bg-white text-gray-700 border-gray-200 hover:border-green1 hover:text-green1'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Right scroll button */}
      {containerRef.current &&
        containerRef.current.scrollWidth > containerRef.current.clientWidth && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-md hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        )}
    </div>
  );
};
