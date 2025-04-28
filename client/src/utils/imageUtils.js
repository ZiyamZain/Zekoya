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