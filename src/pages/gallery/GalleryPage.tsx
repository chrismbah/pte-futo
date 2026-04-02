import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GeneralNavbar } from "../../components/navbar/GeneralNavbar";
import Footer from "../../components/footer/Footer";
import { useCloudinaryGallery } from "../../hooks/useCloudinaryGallery";
import {
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoSearch,
  IoVideocam,
  IoImages,
  IoExpand,
} from "react-icons/io5";

const CATEGORIES = [
  { value: "all",          label: "All" },
  { value: "videos",       label: "Videos" },
  { value: "general",      label: "General" },
  { value: "events",       label: "Events" },
  { value: "activities",   label: "Activities" },
  { value: "convocation",  label: "Convocation" },
  { value: "outreach",     label: "Outreach" },
  { value: "executives",   label: "Executives" },
];

// Masonry column helper
function splitIntoColumns<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));
  return columns;
}

function useColumns() {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setCols(2);
      else if (window.innerWidth < 1024) setCols(3);
      else setCols(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

export default function GalleryPage() {
  const { items, loading, error } = useCloudinaryGallery();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch]           = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [imgLoaded, setImgLoaded]     = useState(false);
  const cols = useColumns();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Filtered list
  const filtered = items.filter((item) => {
    let matchCat: boolean;
    if (activeCategory === "all") {
      matchCat = true;
    } else if (activeCategory === "videos") {
      matchCat = item.type === "video";
    } else {
      matchCat = item.category === activeCategory;
    }
    const q = search.trim().toLowerCase();
    const matchSearch = !q || item.caption?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const columns = splitIntoColumns(filtered, cols);

  // Lightbox navigation
  const openLightbox = (index: number) => { setImgLoaded(false); setLightboxIndex(index); };
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = useCallback(() => {
    setImgLoaded(false);
    setLightboxIndex((i) => (i === null ? null : i === 0 ? filtered.length - 1 : i - 1));
  }, [filtered.length]);
  const nextItem = useCallback(() => {
    setImgLoaded(false);
    setLightboxIndex((i) => (i === null ? null : i === filtered.length - 1 ? 0 : i + 1));
  }, [filtered.length]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowRight") nextItem();
      if (e.key === "ArrowLeft") prevItem();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, nextItem, prevItem]);

  const currentItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  const categoryCount = (val: string) => {
    if (val === "all") return items.length;
    if (val === "videos") return items.filter((i) => i.type === "video").length;
    return items.filter((i) => i.category === val).length;
  };

  return (
    <div className="min-h-screen bg-[#f7f8f6] flex flex-col">
      <GeneralNavbar />

      {/* Hero banner */}
      <header className="pt-28 pb-12 px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 bg-green2/10 text-green2 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            EBSUMSA Gallery
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 text-balance leading-tight">
            Moments &amp; Memories
          </h1>
          <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            A visual story of our community — events, activities, and milestones captured through the lens.
          </p>
        </motion.div>

        {/* Stats row */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500"
          >
            <span className="flex items-center gap-1.5">
              <IoImages className="text-green2" />
              {items.filter((i) => i.type === "image").length} photos
            </span>
            <span className="w-px h-4 bg-gray-300" />
            <span className="flex items-center gap-1.5">
              <IoVideocam className="text-green2" />
              {items.filter((i) => i.type === "video").length} videos
            </span>
          </motion.div>
        )}
      </header>

      {/* Sticky filter bar */}
      <div className="sticky top-14 z-20 bg-[#f7f8f6]/90 backdrop-blur-md border-b border-gray-200/60 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-shrink-0 sm:w-52">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search photos…"
              className="w-full pl-8 pr-3 py-1.5 rounded-full text-sm border border-gray-200 bg-white focus:outline-none focus:border-green2/60 focus:ring-1 focus:ring-green2/30 placeholder-gray-400 transition"
            />
          </div>
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
            {CATEGORIES.map((cat) => {
              const count = categoryCount(cat.value);
              if (cat.value !== "all" && count === 0) return null;
              const isVideos = cat.value === "videos";
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeCategory === cat.value
                      ? isVideos
                        ? "bg-rose-500 text-white shadow-sm"
                        : "bg-green2 text-white shadow-sm"
                      : isVideos
                      ? "bg-white text-rose-500 border border-rose-200 hover:border-rose-400 hover:bg-rose-50"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-green2/50 hover:text-green2"
                  }`}
                >
                  {isVideos && <IoVideocam className="text-base" />}
                  {cat.label}
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${activeCategory === cat.value ? "bg-white/20 text-white" : isVideos ? "bg-rose-50 text-rose-400" : "bg-gray-100 text-gray-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {/* Loading skeleton */}
        {loading && (
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, col) => (
              <div key={col} className="flex-1 flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, row) => (
                  <div key={row} className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <IoImages className="text-3xl text-red-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Couldn't load gallery</h3>
            <p className="text-sm text-gray-400 max-w-xs">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              {activeCategory === "videos"
                ? <IoVideocam className="text-3xl text-gray-400" />
                : <IoImages className="text-3xl text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              {activeCategory === "videos" ? "No videos yet" : "No photos yet"}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              {activeCategory === "videos"
                ? "No videos have been uploaded yet. Check back soon!"
                : activeCategory !== "all"
                ? `No items in the "${CATEGORIES.find((c) => c.value === activeCategory)?.label}" category yet.`
                : "The gallery is empty. Check back soon!"}
            </p>
            {activeCategory !== "all" && (
              <button onClick={() => setActiveCategory("all")} className="mt-2 text-sm text-green2 font-semibold hover:underline">
                View all items
              </button>
            )}
          </motion.div>
        )}

        {/* Masonry grid */}
        {!loading && !error && filtered.length > 0 && (
          <motion.div
            layout
            className="flex gap-4"
          >
            {columns.map((col, colIndex) => (
              <div key={colIndex} className="flex-1 flex flex-col gap-4">
                {col.map((item, rowIndex) => {
                  const globalIndex = colIndex + rowIndex * cols;
                  // Vary aspect ratios to create masonry feel
                  const aspectClass =
                    (colIndex + rowIndex) % 4 === 0
                      ? "aspect-[4/5]"
                      : (colIndex + rowIndex) % 4 === 1
                      ? "aspect-[3/4]"
                      : (colIndex + rowIndex) % 4 === 2
                      ? "aspect-square"
                      : "aspect-[4/3]";

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(globalIndex * 0.04, 0.4) }}
                      className={`relative group rounded-2xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300 ${aspectClass}`}
                      onClick={() => openLightbox(filtered.indexOf(item))}
                    >
                      {item.type === "video" ? (
                        <>
                          <video
                            src={item.url}
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <IoVideocam className="text-gray-900 text-xl" />
                            </div>
                          </div>
                          {/* Always-visible video badge */}
                          <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-0.5 flex items-center gap-1">
                            <IoVideocam className="text-white text-xs" />
                            <span className="text-white text-xs font-semibold">Video</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={item.url}
                            alt={`Gallery photo ${globalIndex + 1}`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                              <IoExpand className="text-gray-900 text-base" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Category tag */}
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-white text-xs font-semibold capitalize">
                          {item.category}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(16px)" }}
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
              aria-label="Close"
            >
              <IoClose className="text-xl" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium z-10">
              {lightboxIndex + 1} / {filtered.length}
            </div>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prevItem(); }}
              className="absolute left-3 sm:left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-10"
              aria-label="Previous"
            >
              <IoChevronBack className="text-xl" />
            </button>

            {/* Media */}
            <motion.div
              key={currentItem.id || currentItem.url}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl max-h-[85vh] mx-16 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {currentItem.type === "video" ? (
                <video
                  src={currentItem.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[80vh] rounded-xl shadow-2xl"
                />
              ) : (
                <img
                  src={currentItem.url}
                  alt="Gallery"
                  onLoad={() => setImgLoaded(true)}
                  className={`max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                />
              )}
            </motion.div>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); nextItem(); }}
              className="absolute right-3 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-10"
              aria-label="Next"
            >
              <IoChevronForward className="text-xl" />
            </button>

            {/* Bottom info */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <span className="text-white/50 text-xs capitalize font-medium bg-white/10 px-3 py-1 rounded-full">
                {currentItem.category}
              </span>
            </div>

            {/* Thumbnail strip */}
            {filtered.length > 1 && (
              <div className="absolute bottom-0 inset-x-0 pb-14 flex justify-center overflow-hidden pointer-events-none">
                <div className="flex gap-1.5 pointer-events-auto overflow-x-auto px-4 max-w-xl">
                  {filtered.slice(Math.max(0, lightboxIndex - 4), lightboxIndex + 5).map((thumb, idx) => {
                    const realIdx = Math.max(0, lightboxIndex - 4) + idx;
                    return (
                      <button
                        key={thumb.id || thumb.url}
                        onClick={(e) => { e.stopPropagation(); openLightbox(realIdx); }}
                        className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-200 ${realIdx === lightboxIndex ? "ring-2 ring-white scale-110" : "opacity-50 hover:opacity-80"}`}
                      >
                        {thumb.type === "video" ? (
                          <video src={thumb.url} muted className="w-full h-full object-cover" />
                        ) : (
                          <img src={thumb.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
