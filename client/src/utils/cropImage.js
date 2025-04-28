import { createImage, getRadianAngle } from './imageUtils';

/**
 * Returns the cropped image as a Blob or Data URL.
 * @param {string} imageSrc - The source of the image to crop.
 * @param {Object} pixelCrop - The cropping area in pixels.
 * @returns {Promise<string>} - The cropped image as a Data URL.
 */
export default async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

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
      blob.name = 'cropped.jpg';
      resolve(blob); // Return the Blob directly
    }, 'image/jpeg');
  });
}