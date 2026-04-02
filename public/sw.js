// EBSUMSA Service Worker v3
// Strategies:
//   • App shell (HTML/JS/CSS)        → Cache-first (served instantly, updated in background)
//   • Local images / fonts           → Stale-while-revalidate (instant + stays fresh)
//   • Firebase Storage images        → Stale-while-revalidate (cached after first load)
//   • Firebase Auth / Firestore API  → Network-only (never cache dynamic data)

const CACHE_VERSION = "ebsumsa-v3";
const IMAGE_CACHE   = "ebsumsa-images-v3";

const APP_SHELL = [
  "/",
  "/index.html",
  "/logo.png",
  "/manifest.json",
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ─── Activate — prune old caches ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const VALID = new Set([CACHE_VERSION, IMAGE_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !VALID.has(k)).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Domains we must never intercept — let them go straight to the network.
 *  NOTE: firebasestorage.googleapis.com is intentionally NOT in this list
 *  so that Firebase Storage images can be cached (stale-while-revalidate). */
const BYPASS_DOMAINS = [
  "firebaseapp.com",
  "googleapis.com/identitytoolkit",
  "googleapis.com/robot",
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "firebase.google.com",
  "supabase.co",
  "puter.com",
];

function isBypass(url) {
  // Always bypass Firestore, Auth, and other Google API calls
  // but allow firebasestorage.googleapis.com through so images get cached
  if (url.hostname === "firebasestorage.googleapis.com") return false;
  return BYPASS_DOMAINS.some((d) => url.href.includes(d));
}

function isImage(url) {
  // Local images by extension
  if (/\.(png|jpe?g|gif|svg|ico|webp|avif)$/i.test(url.pathname)) return true;
  // Firebase Storage image URLs (firebasestorage.googleapis.com/v0/b/.../o/...)
  if (url.hostname === "firebasestorage.googleapis.com") return true;
  return false;
}

function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|otf)$/i.test(url.pathname);
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 1. Bypass — dynamic/API domains
  if (isBypass(url)) return;

  // 2. Images → stale-while-revalidate (serve cache instantly, refresh in bg)
  if (isImage(url)) {
    event.respondWith(staleWhileRevalidate(event.request, IMAGE_CACHE));
    return;
  }

  // 3. JS / CSS / fonts → cache-first (hashed filenames = safe to cache forever)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, CACHE_VERSION));
    return;
  }

  // 4. Navigation + everything else → network-first with cache fallback
  event.respondWith(networkFirst(event.request));
});

// ─── Strategy: Cache-First ────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

// ─── Strategy: Stale-While-Revalidate ────────────────────────────────────────
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Kick off a background network fetch regardless
  const networkFetch = fetch(request, { credentials: "omit" })
    .then((response) => {
      // Only cache valid, complete responses
      if (response.ok && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || new Response("", { status: 503 }));

  // Return cached version immediately if available — no loading delay
  return cached || networkFetch;
}

// ─── Strategy: Network-First ─────────────────────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      // Only cache same-origin navigation responses
      if (new URL(request.url).origin === self.location.origin) {
        cache.put(request, response.clone());
      }
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Final fallback: return the app shell for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/index.html");
    }
  }
}
