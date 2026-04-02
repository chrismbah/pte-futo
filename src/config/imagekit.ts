export const imagekitConfig = {
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '',
  authenticationEndpoint: '/api/imagekit-auth',
};

export const getImageKitAuthParams = async () => {
  const response = await fetch('/api/imagekit-auth');
  if (!response.ok) {
    throw new Error('Failed to get ImageKit authentication');
  }
  return response.json();
};
