/**
 * Provides the base URL for images or other assets served from the backend.
 * For production, VITE_API_URL should be set to the main domain (e.g., 'https://www.zekoya.shop').
 * For local development, if VITE_API_URL is not set, it defaults to 'http://localhost:5001'.
 * @returns {string} The base URL.
 */
export const getBaseImageUrl = () => {
  // In local .env, VITE_API_URL should be commented out or not present for this to default correctly.
  // In production .env, VITE_API_URL should be like 'https://www.zekoya.shop'.
  return import.meta.env.VITE_API_URL || 'http://localhost:5001';
};
