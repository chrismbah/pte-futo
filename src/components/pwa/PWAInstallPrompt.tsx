import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already dismissed this session
    const wasDismissed = sessionStorage.getItem("pwa-prompt-dismissed");
    if (wasDismissed) return;

    // Don't show if already installed (running in standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // Detect iOS (Safari doesn't support beforeinstallprompt)
    const ua = window.navigator.userAgent;
    const iOS = /iPhone|iPad|iPod/.test(ua) && !("MSStream" in window);
    setIsIOS(iOS);

    if (iOS) {
      // Show manual iOS install instructions after a short delay
      const timer = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(timer);
    }

    // Chrome / Android — listen for the native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      handleDismiss();
      return;
    }
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      deferredPrompt.current = null;
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
    setTimeout(() => setShowPrompt(false), 300);
  };

  if (!showPrompt) return null;

  return (
    <div
      role="dialog"
      aria-label="Install EBSUMSA app"
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-transform duration-300 ${
        dismissed ? "translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Backdrop blur strip */}
      <div className="bg-white border-t border-gray-100 shadow-2xl px-4 pt-4 pb-6 sm:pb-4">
        {/* Green top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-green1 rounded-t" />

        <div className="max-w-lg mx-auto">
          {/* Header row */}
          <div className="flex items-start gap-3">
            <img
              src="/logo.png"
              alt="EBSUMSA logo"
              className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="font-poppins font-semibold text-base text-gray-900 leading-tight">
                Install EBSUMSA
              </p>
              <p className="font-dmSans text-sm text-gray-500 mt-0.5 leading-snug">
                {isIOS
                  ? "Tap the share button below, then \"Add to Home Screen\" for one-tap access."
                  : "Add to your home screen for instant access — no app store needed."}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* iOS instruction steps */}
          {isIOS && (
            <div className="mt-3 flex items-center gap-4 px-1">
              <div className="flex items-center gap-1.5 text-gray-500">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L13 5.414V15a1 1 0 11-2 0V5.414L8.707 7.707A1 1 0 017.293 6.293l4-4A1 1 0 0112 2zM4 17a1 1 0 011 1v1h14v-1a1 1 0 112 0v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a1 1 0 011-1z" />
                </svg>
                <span className="font-dmSans text-xs">Tap Share</span>
              </div>
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div className="flex items-center gap-1.5 text-gray-500">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M12 8v8M8 12h8" strokeLinecap="round" />
                </svg>
                <span className="font-dmSans text-xs">Add to Home Screen</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!isIOS && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-green1 hover:bg-green3 text-white font-poppins font-medium text-sm py-2.5 px-4 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 3v13M6 10l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 20h18" strokeLinecap="round" />
                </svg>
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-dmSans text-sm hover:bg-gray-50 transition-colors duration-150"
              >
                Not now
              </button>
            </div>
          )}

          {isIOS && (
            <button
              onClick={handleDismiss}
              className="mt-3 w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 font-dmSans text-sm hover:bg-gray-50 transition-colors duration-150"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
