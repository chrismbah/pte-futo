import { Link } from "react-router-dom";
import { IoChevronForward, IoHomeOutline } from "react-icons/io5";

interface BreadcrumbsProps {
  category?: string;
  title: string;
}

export const Breadcrumbs = ({ category, title }: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-500">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-1 hover:text-green2 transition-colors"
          >
            <IoHomeOutline className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        <li className="flex items-center">
          <IoChevronForward className="w-4 h-4 mx-1 text-gray-400" />
          <Link to="/blog" className="hover:text-green2 transition-colors">
            Blog
          </Link>
        </li>
        {category && (
          <li className="flex items-center">
            <IoChevronForward className="w-4 h-4 mx-1 text-gray-400" />
            <span className="text-gray-600">{category}</span>
          </li>
        )}
        <li className="flex items-center">
          <IoChevronForward className="w-4 h-4 mx-1 text-gray-400" />
          <span className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-[300px]">
            {title}
          </span>
        </li>
      </ol>
    </nav>
  );
};
