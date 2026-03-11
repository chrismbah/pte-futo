/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import { useFetchBlogPosts } from "./hooks/useFetchBlogPosts";
import { TopPosts } from "./cards/Top";
import { OthersPosts } from "./cards/Others";
import { FeaturedPosts } from "./cards/Featured";
import Footer from "../../../components/footer/Footer";
import { Spinner } from "../../../components/loaders/Spinner";
import { BadNetworkIcon } from "../../../components/icons/general/BadNetworkIcon";
import { Link } from "react-router-dom";
import { IoSearch, IoClose, IoChevronBack, IoChevronForward, IoFilter } from "react-icons/io5";

const POSTS_PER_PAGE = 6;

export default function Blog() {
  const { blogPosts, blogPostsLoading, blogPostsError, fetchBlogPosts } =
    useFetchBlogPosts();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  // Get unique categories from all posts
  const categories = useMemo(() => {
    if (!blogPosts) return [];
    const cats = new Set<string>();
    blogPosts.forEach((post) => {
      if (post.category) cats.add(post.category);
    });
    return Array.from(cats).sort();
  }, [blogPosts]);

  // Filter posts based on search query and category
  const filteredPosts = useMemo(() => {
    if (!blogPosts) return null;
    let filtered = [...blogPosts];
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query) ||
          post.category?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [blogPosts, searchQuery, selectedCategory]);

  // Pagination calculations
  const totalPages = useMemo(() => {
    if (!filteredPosts) return 0;
    return Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  }, [filteredPosts]);

  const paginatedPosts = useMemo(() => {
    if (!filteredPosts) return null;
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  const isFiltering = isSearching || selectedCategory !== null;

  return (
    <div className="min-h-screen bg-white">
      <div className="box-width">
        <div className="px-3 py-[70px] sm:px-8 md:px-14 sm:py-[85px]">
          {/* Search Bar and Category Filter */}
          <div className="mb-6 space-y-4">
            {/* Search Input */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(e.target.value.length > 0);
                }}
                placeholder="Search articles by title, author, or category..."
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green2/50 focus:border-green2 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <IoClose className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <IoFilter className="w-4 h-4" />
                  Filter:
                </span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    selectedCategory === null
                      ? "bg-green2 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      selectedCategory === category
                        ? "bg-green2 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Active Filters Indicator */}
            {isFiltering && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">
                  {filteredPosts?.length || 0} result{filteredPosts?.length !== 1 ? 's' : ''} found
                </span>
                <button
                  onClick={clearFilters}
                  className="text-green1 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Filtered Results View */}
          {isFiltering && filteredPosts && (
            <div className="mb-8">
              <h2 className="py-3 text-green2 border-b border-b-gray-200 w-full font-semibold text-lg ss:text-xll md:text-2xl mb-4">
                {selectedCategory ? `${selectedCategory} Articles` : 'Search Results'}
              </h2>
              
              {paginatedPosts && paginatedPosts.length > 0 ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedPosts.map((post, i) => (
                      <Link
                        to={`/blog/posts/${encodeURIComponent(post.title)}/${post.no}/${post.postType}`}
                        key={i}
                      >
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all group h-full flex flex-col">
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={post.sampleImg}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            {post.category && (
                              <span className="inline-block self-start mb-2 px-2 py-0.5 bg-green2/10 text-green2 text-xs font-medium rounded-full">
                                {post.category}
                              </span>
                            )}
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 group-hover:text-green2 transition-colors flex-1">
                              {post.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-2">
                              {post.author} &middot; {post.date}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-colors ${
                          currentPage === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <IoChevronBack className="w-5 h-5" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-green2 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <IoChevronForward className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <IoSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No articles found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term or category</p>
                </div>
              )}
            </div>
          )}

          {/* Regular Blog Content - Only show when not filtering */}
          {!isFiltering && (
            <>
              <h2 className="py-3 text-green2 border-b border-b-gray-200 w-full font-semibold text-lg ss:text-xll md:text-2xl mb-4">
                Top Articles
              </h2>
              {blogPosts && blogPosts.length > 0 && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <TopPosts blogPosts={blogPosts} />
                    <OthersPosts blogPosts={blogPosts} />
                  </div>
                  <h2 className="text-green2 py-3 border-b border-b-gray-200 w-full font-semibold text-lg ss:text-xll md:text-2xl mb-4">
                    Don't Miss
                  </h2>
                  <FeaturedPosts blogPosts={blogPosts} />
                </>
              )}
              {blogPostsLoading && !blogPosts && !blogPostsError && (
                <div className="w-full h-[70vh] flex items-center justify-center flex-col">
                  <Spinner className="w-8 sm:w-8 md:w-10" />
                  <p className="font-[500] text-sm sm:text-xs md:text-base text-gray-700 mt-2">
                    Loading posts...
                  </p>
                </div>
              )}
              {blogPostsError && !blogPostsLoading && !blogPosts && (
                <div className="w-full h-[70vh] flex items-center justify-center flex-col">
                  <BadNetworkIcon className="w-10 sm:w-12 md:w-20" />
                  <p className="font-medium text-gray-700 text-ss sm:text-sm mmd:text-xs text-center">
                    Sorry, couldn't load posts at the moment.{" "}
                    <button
                      className="underline hover:no-underline text-green1"
                      onClick={() => fetchBlogPosts()}
                    >
                      Retry
                    </button>
                  </p>
                </div>
              )}
              {blogPosts && blogPosts.length < 1 && (
                <div className="w-full h-[70vh] flex items-center justify-center flex-col">
                  <BadNetworkIcon className="w-10 sm:w-12 md:w-20" />
                  <p className="font-medium text-gray-700 text-ss sm:text-sm mmd:text-xs text-center">
                    Sorry, couldn't load posts at the moment.{" "}
                    <button
                      className="underline hover:no-underline text-green1"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </button>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
