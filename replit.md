# EBSUMSA Portal — Replit Environment

## Project Overview
React + Vite frontend for the Medicine and Surgery Department, EBSU (Ebonyi State University). Includes Firebase auth, Supabase, Cloudinary gallery, Paystack payments, ImageKit media, and AI-powered document analysis.

## Architecture

### Frontend
- **Framework**: React 18 + Vite 5, TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Flowbite + Material Tailwind
- **State**: React Context (Firebase auth, GPA, course outlines, etc.)
- **Port**: 5000 (Vite dev server)

### Backend (Express API Server)
- **File**: `server.ts` — Express server running on port 3001
- **Start**: `tsx server.ts`
- **API routes** (proxied from Vite at `/api/*` → `localhost:3001`):
  - `GET /api/gallery-list` — Cloudinary gallery listing
  - `DELETE /api/gallery-upload` — Cloudinary media deletion
  - `GET /api/imagekit-auth` — ImageKit auth signature
  - `GET /api/paystack-banks` — Fetch Nigerian bank list
  - `GET /api/paystack-resolve-account` — Verify bank account
  - `POST /api/paystack-transfer` — Initiate NGN transfer
  - `POST /api/paystack-finalize-transfer` — Finalize OTP transfer
  - `POST /api/analyze-document` — AI analysis (text input)
  - `POST /api/analyze-pdf` — AI analysis (pre-extracted text)
  - `POST /api/extract-pdf` — Server-side PDF text extraction

## Dev Workflow
Single `npm run dev` command starts both servers concurrently:
```
concurrently "tsx server.ts" "vite --port 5000 --host 0.0.0.0"
```

## Migration Notes
- Originally deployed on Vercel with serverless functions in `/api/*.ts`
- Migrated to Replit: Vercel API functions converted to Express routes in `server.ts`
- Vite proxies all `/api/*` requests to the Express server on port 3001
- Node upgraded to 20 for compatibility with modern dependencies
- pdfjs-dist v4 requires `Promise.withResolvers` — handled via dynamic import with inline polyfill

## Environment Variables Required
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (also accepted as `SUPABASE_URL`, `SUPABASE_ANON_KEY`)
- `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_API_KEY`, `VITE_CLOUDINARY_API_SECRET`, `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_IMAGEKIT_PUBLIC_KEY`, `VITE_IMAGEKIT_URL_ENDPOINT`, `IMAGEKIT_PRIVATE_KEY`
- `VITE_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`
- `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID`, `VITE_EMAILJS_WELCOME_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
- `PUTER_AUTH_TOKEN` (for AI document analysis via Puter/OpenAI API)
- `RESEND_API_KEY` (for email notifications — fallback key hardcoded in original)
