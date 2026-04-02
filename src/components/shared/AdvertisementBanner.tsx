/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Advertisement } from "../../pages/admin/tabs/AdminAdsManager";

interface AdvertisementBannerProps {
  className?: string;
}

const DISMISS_KEY = "ebsumsa_dismissed_ads";

function getDismissed(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISS_KEY) || "[]");
  } catch {
    return [];
  }
}

function setDismissed(ids: string[]) {
  try {
    sessionStorage.setItem(DISMISS_KEY, JSON.stringify(ids));
  } catch {
    // noop
  }
}

export default function AdvertisementBanner({ className = "" }: AdvertisementBannerProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissedState] = useState<string[]>(getDismissed);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        // Simple collection fetch — no compound index needed, filter client-side
        const snapshot = await getDocs(collection(db, "advertisements"));
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Advertisement[];
        const filtered = data.filter(
          (a) =>
            a.isActive === true &&
            ["dashboard", "both", "all"].includes(a.placement) &&
            !getDismissed().includes(a.id)
        );
        setAds(filtered);
        if (filtered.length > 0) setVisible(true);
      } catch (err) {
        console.error("AdvertisementBanner fetch error:", err);
      }
    };
    fetchAds();
  }, []);

  // Auto-rotate every 6 seconds if multiple ads
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      goToNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [ads.length, currentIndex]);

  const goToNext = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
      setAnimating(false);
    }, 300);
  }, [ads.length, animating]);

  const goToPrev = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
      setAnimating(false);
    }, 300);
  }, [ads.length, animating]);

  const handleDismiss = (id: string) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    setDismissedState(updated);
    const remaining = ads.filter((a) => !updated.includes(a.id));
    if (remaining.length === 0) {
      setVisible(false);
      setAds([]);
    } else {
      setAds(remaining);
      setCurrentIndex((prev) => Math.min(prev, remaining.length - 1));
    }
  };

  if (!visible || ads.length === 0) return null;

  const ad = ads[currentIndex];

  return (
    <div
      className={`w-full rounded-xl overflow-hidden shadow-sm border border-black/10 ${className}`}
      style={{ backgroundColor: ad.bgColor, color: ad.textColor }}
    >
      <div
        className={`transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}
      >
        <div className="flex items-start gap-3 px-4 py-4">
          {/* Optional image */}
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt=""
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0 border border-white/20"
            />
          )}

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <p
              className="text-xss font-bold uppercase tracking-wider opacity-60 mb-0.5"
              style={{ color: ad.textColor }}
            >
              EBSUMSA
            </p>
            <p className="font-bold text-sm sm:text-base leading-tight text-balance">
              {ad.title}
            </p>
            <p className="text-xs sm:text-sm opacity-80 mt-0.5 line-clamp-2 text-pretty">
              {ad.description}
            </p>
            {ad.ctaLabel && ad.ctaUrl && (
              <a
                href={ad.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: ad.textColor, color: ad.bgColor }}
              >
                {ad.ctaLabel}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            )}
          </div>

          {/* Right controls: nav + dismiss */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Dismiss */}
            <button
              onClick={() => handleDismiss(ad.id)}
              aria-label="Dismiss advertisement"
              className="w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: ad.textColor }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Prev/Next if multiple */}
            {ads.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={goToPrev}
                  aria-label="Previous ad"
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)", color: ad.textColor }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  aria-label="Next ad"
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)", color: ad.textColor }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dot indicators */}
        {ads.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pb-2">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to ad ${i + 1}`}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === currentIndex ? "20px" : "6px",
                  height: "6px",
                  backgroundColor: ad.textColor,
                  opacity: i === currentIndex ? 0.9 : 0.35,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
