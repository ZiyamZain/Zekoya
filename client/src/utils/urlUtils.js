
export const getBaseImageUrl = () => {
  // In local .env, VITE_API_URL should be commented out or not present for this to default correctly.
  // In production .env, VITE_API_URL should be like 'https://www.zekoya.shop'.
  return import.meta.env.VITE_API_URL || 'http://localhost:5001';
};
