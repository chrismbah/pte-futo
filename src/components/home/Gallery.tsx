import { useState, useCallback, useEffect, useRef } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import galleryAnim from "../../json/animation/gallery.json";
import { fadeInVariants3 } from "../../animation/variants";
import {
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoGrid,
  IoImages,
  IoPlay,
  IoVideocam,
} from "react-icons/io5";
import { useCloudinaryGallery, type GalleryItem } from "../../hooks/useCloudinaryGallery";
export type { GalleryItem } from "../../hooks/useCloudinaryGallery";

// ---------- animation variants ----------
const fadeInVariants1 = {
  initial: { opacity: 0, y: 100 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * index, duration: 0.4 },
  }),
};

const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const imageVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

const gridItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: Math.min(index * 0.02, 0.5), duration: 0.3 },
  }),
};

const PREVIEW_COUNT = 8;

// ---------- MediaCard ----------
function MediaCard({
  item,
  onClick,
  eager = false,
}: {
  item: GalleryItem;
  onClick: () => void;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (item.type === "video") {
    return (
      <div className="relative w-full h-full cursor-pointer" onClick={onClick}>
        {!loaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
        )}
        <video
          src={item.url}
          muted
          playsInline
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover rounded-xl transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
            <IoPlay className="text-white text-xl ml-0.5" />
          </div>
        </div>
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-xl">
            <IoVideocam className="text-gray-400 text-2xl" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={onClick}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-xl">
          <IoImages className="text-gray-400 text-2xl" />
        </div>
      ) : (
        <img
          src={item.url}
          alt={item.caption || "Gallery image"}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover rounded-xl transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

// ---------- LightboxMedia ----------
function LightboxMedia({ item, direction }: { item: GalleryItem; direction: number }) {
  if (item.type === "video") {
    return (
      <motion.video
        key={item.id}
        src={item.url}
        variants={imageVariants}
        custom={direction}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3 }}
        controls
        autoPlay
        className="max-w-full max-h-[calc(100vh-160px)] sm:max-h-[calc(100vh-180px)] object-contain rounded-lg shadow-2xl"
      />
    );
  }
  return (
    <motion.img
      key={item.id}
      src={item.url}
      alt={item.caption || "Gallery image"}
      variants={imageVariants}
      custom={direction}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      decoding="async"
      className="max-w-full max-h-[calc(100vh-160px)] sm:max-h-[calc(100vh-180px)] object-contain rounded-lg shadow-2xl"
    />
  );
}

// ---------- Empty State ----------
function EmptyGallery() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
        <IoImages className="text-4xl text-gray-300" />
      </div>
      <div>
        <p className="text-gray-500 font-medium text-sm">No gallery images yet</p>
        <p className="text-gray-400 text-xs mt-1">Check back soon for campus photos and videos.</p>
      </div>
    </div>
  );
}

// ---------- Loading Skeleton ----------
function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
      ))}
    </div>
  );
}

// ---------- Main Gallery ----------
export default function Gallery() {
  const { items, loading } = useCloudinaryGallery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [viewMode, setViewMode] = useState<"lightbox" | "grid">("grid");
  const [visibleCount, setVisibleCount] = useState(20);

  // Scroll-triggered Lottie: play once when section enters viewport
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(lottieContainerRef, { once: true, margin: "0px 0px -100px 0px" });

  useEffect(() => {
    if (isInView && lottieRef.current) {
      lottieRef.current.play();
    }
  }, [isInView]);

  const previewItems = items.slice(0, PREVIEW_COUNT);
  const imageCount = items.filter((i) => i.type === "image").length;
  const videoCount = items.filter((i) => i.type === "video").length;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const nearBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 200;
      if (nearBottom && visibleCount < items.length) {
        setVisibleCount((prev) => Math.min(prev + 20, items.length));
      }
    },
    [visibleCount, items.length]
  );

  const openModal = (index: number, mode: "lightbox" | "grid" = "grid") => {
    setSelectedIndex(index);
    setViewMode(mode);
    setIsModalOpen(true);
    setVisibleCount(20);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setVisibleCount(20);
    document.body.style.overflow = "unset";
  };

  const navigateMedia = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setSelectedIndex((prev) => {
      const next = prev + newDirection;
      if (next < 0) return items.length - 1;
      if (next >= items.length) return 0;
      return next;
    });
  }, [items.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") navigateMedia(-1);
      if (e.key === "ArrowRight") navigateMedia(1);
    },
    [isModalOpen, navigateMedia]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <div className="box-width">
        <div className="section">
          <div className="flex justify-between items-center flex-col-reverse md:flex-row gap-6">
            {/* Grid preview */}
            <div className="basis-1/2">
              <div className="p-0 sm:p-6">
                {loading ? (
                  <GallerySkeleton />
                ) : items.length === 0 ? (
                  <EmptyGallery />
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {previewItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          variants={fadeInVariants1}
                          initial="initial"
                          whileInView="animate"
                          viewport={{ once: true }}
                          custom={index + 1}
                          className="relative group overflow-hidden rounded-xl aspect-square"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <MediaCard
                            item={item}
                            onClick={() => openModal(index, "lightbox")}
                            eager={index < 4}
                          />
                          <div
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl cursor-pointer"
                            onClick={() => openModal(index, "lightbox")}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {items.length > PREVIEW_COUNT && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mt-8 flex justify-center"
                      >
                        <button
                          onClick={() => openModal(0, "grid")}
                          className="group relative overflow-hidden bg-white border-2 border-green1 rounded-xl px-6 py-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-green1/20 hover:border-green2"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-green1 to-green2 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                          <span className="relative flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green1 group-hover:bg-white/20 transition-colors duration-300">
                              <IoImages className="text-xl text-white group-hover:text-white" />
                            </span>
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                              View All Media
                            </span>
                            <span className="flex items-center justify-center ml-2 w-8 h-8 rounded-full bg-green1/10 group-hover:bg-white/20 transition-colors duration-300">
                              <IoChevronForward className="text-green1 group-hover:text-white transition-colors duration-300" />
                            </span>
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Heading + animation */}
            <div className="basis-1/2">
              <motion.h2
                variants={fadeInVariants3}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                custom={1}
              >
                <div className="bar-style" />
                Gallery
              </motion.h2>
              <motion.h3
                variants={fadeInVariants3}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                custom={2}
                className="text-gray-700 font-[500] text-ss ss:text-sm xlg:text-xs"
              >
                Explore the view
              </motion.h3>
              <div ref={lottieContainerRef}>
                <Lottie
                  lottieRef={lottieRef}
                  animationData={galleryAnim}
                  loop={false}
                  autoplay={false}
                  className="md:w-[80%] w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex flex-col" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(16px)" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <h3 className="text-green2 font-medium">
                  Gallery ({imageCount} photo{imageCount !== 1 ? "s" : ""}
                  {videoCount > 0 ? `, ${videoCount} video${videoCount !== 1 ? "s" : ""}` : ""})
                </h3>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label="Grid view"
                >
                  <IoGrid className="text-xl" />
                </button>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Close gallery"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            {/* Modal Content */}
            {viewMode === "grid" ? (
              <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
                <div className="max-w-7xl mx-auto">
                  <p className="text-white/60 text-sm mb-4 text-center">
                    Showing {Math.min(visibleCount, items.length)} of {items.length} items
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {items.slice(0, visibleCount).map((item, index) => (
                      <motion.div
                        key={item.id}
                        variants={gridItemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index % 20}
                        className="relative group aspect-square overflow-hidden rounded-lg"
                      >
                        <MediaCard
                          item={item}
                          onClick={() => {
                            setSelectedIndex(index);
                            setDirection(0);
                            setViewMode("lightbox");
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                  {visibleCount < items.length && (
                    <p className="text-white/40 text-sm text-center mt-6">
                      Scroll down to load more...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Lightbox */
              <div className="flex-1 flex flex-col items-center justify-center relative px-4 py-6">
                <AnimatePresence mode="wait" custom={direction}>
                  <LightboxMedia
                    key={items[selectedIndex]?.id}
                    item={items[selectedIndex]}
                    direction={direction}
                  />
                </AnimatePresence>

                {/* Navigation */}
                {items.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateMedia(-1)}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all backdrop-blur-sm"
                      aria-label="Previous"
                    >
                      <IoChevronBack className="text-xl sm:text-2xl" />
                    </button>
                    <button
                      onClick={() => navigateMedia(1)}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all backdrop-blur-sm"
                      aria-label="Next"
                    >
                      <IoChevronForward className="text-xl sm:text-2xl" />
                    </button>
                  </>
                )}

                {/* Caption */}
                {items[selectedIndex]?.caption && (
                  <p className="mt-4 text-white/70 text-sm text-center max-w-lg">
                    {items[selectedIndex].caption}
                  </p>
                )}

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/70 text-xs">
                  {selectedIndex + 1} / {items.length}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
