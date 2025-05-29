import { createImage, getRadianAngle } from './imageUtils';

/**
 * Returns the cropped image as a Blob or Data URL.
 * @param {string} imageSrc - The source of the image to crop.
 * @param {Object} pixelCrop - The cropping area in pixels.
 * @returns {Promise<Blob>} - The cropped image as a Blob.
 */
export default async function getCroppedImg(imageSrc, pixelCrop) {
  try {
    // Check if the image is a Google profile image or other external URL with potential CORS issues
    const isGoogleImage = imageSrc.includes('googleusercontent.com');
    const isExternalUrl = imageSrc.startsWith('http') && !imageSrc.includes('localhost');
    
    if (isGoogleImage || isExternalUrl) {
      console.warn('External image detected, CORS issues may occur:', imageSrc);
    }
    
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return reject(new Error('Canvas is empty'));
        }
        
        // Create a File object instead of a Blob to ensure it has a proper filename with extension
        const file = new File([blob], 'cropped_profile.jpg', { type: 'image/jpeg' });

        
        resolve(file); // Return the File object instead of Blob
      }, 'image/jpeg', 0.95); // Higher quality
    });
  } catch (error) {
    console.error('Error in getCroppedImg:', error);
    throw error;
  }
}