import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const cherryPickedKeys = [
  "REACT_APP_FIREBASE_API_KEY",
  "REACT_APP_FIREBASE_AUTH_DOMAIN",
  "REACT_APP_FIREBASE_PROJECT_ID",
  "REACT_APP_FIREBASE_STORAGE_BUCKET",
  "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
  "REACT_APP_FIREBASE_APP_ID",
  "REACT_APP_MEASUREMENT_ID",
  "VITE_IMAGEKIT_PUBLIC_KEY",
  "VITE_IMAGEKIT_URL_ENDPOINT"
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const processEnv = {};
  cherryPickedKeys.forEach(key => processEnv[key] = env[key]);

  return {
    define: {
      'process.env': processEnv
    },
    plugins: [react()],
    assetsInclude: ['**/*.heic', '**/*.HEIC', '**/*.heif', '**/*.HEIF'],
  }
})

