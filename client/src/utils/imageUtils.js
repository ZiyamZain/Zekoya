/**
 * Creates an HTMLImageElement from a given image source.
 * @param {string} src - The source of the image.
 * @returns {Promise<HTMLImageElement>} - A promise that resolves to the image element.
 */
export const createImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.setAttribute('crossOrigin', 'anonymous'); // Prevent CORS issues
    img.src = src;
  });

/**
 * Converts degrees to radians.
 * @param {number} degree - The angle in degrees.
 * @returns {number} - The angle in radians.
 */
export const getRadianAngle = (degree) => (degree * Math.PI) / 180;

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

/**
 * Returns the URL of an image, handling both Cloudinary objects and legacy paths.
 * @param {string|object} imagePath - The path or object of the image.
 * @param {string} [defaultImage='/default-product.png'] - The default image URL.
 * @returns {string} - The URL of the image.
 */
export const getImageUrl = (imagePath, defaultImage = '/default-product.png') => {
  if (!imagePath) return defaultImage;

  // Handle new Cloudinary image objects (e.g., product.images[0] or category.image)
  if (typeof imagePath === 'object' && imagePath.url) {
    return imagePath.url;
  }

  // Handle string paths (legacy or direct URLs)
  if (typeof imagePath === 'string') {
    if (imagePath.startsWith('http')) { // Absolute URL (e.g., already a Cloudinary URL string)
      return imagePath;
    }
    if (imagePath.startsWith('/uploads')) { // Legacy local path
      return `${BACKEND_URL}${imagePath}`;
    }
    // If it's a string but not matching above, it might be an unrecognized format.
    return defaultImage; 
  }

  return defaultImage; // Fallback for any other unexpected type
};

// You can add more image-related utility functions here if needed