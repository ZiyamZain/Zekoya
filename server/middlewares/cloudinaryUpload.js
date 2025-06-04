import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Function to create a Cloudinary storage engine
const createCloudinaryStorage = (options) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: options.folder || 'zekoya/default', // Default folder if not specified
        allowed_formats: options.allowed_formats || ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: options.transformation || [
          {
            width: 1000,
            height: 1000,
            crop: 'limit',
            quality: 'auto:good',
            fetch_format: 'auto',
          },
        ],
        // Cloudinary generates unique public_id if not specified
      };
    },
  });
};

// Function to create a multer upload instance
export const createCloudinaryUploader = (storageOptions) => {
  const storage = createCloudinaryStorage(storageOptions);
  
  const fileFilter = (req, file, cb) => {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp'];
    if (validMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
    }
  };

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
  });
};

// Error handler middleware
export const handleUploadError = (err, req, res, next) => {
  if (err) {
    console.error('Upload error:', err.message);
    // If files were uploaded to Cloudinary before this error (e.g. validation error in controller after upload),
    // they might need cleanup. Multer-storage-cloudinary usually handles cleanup on its own errors.
    if (req.files && req.files.length > 0) {
        const cleanupPromises = req.files.map(file => {
            if (file.path && file.filename) { // file.path is the URL, file.filename is the public_id
                return cloudinary.uploader.destroy(file.filename).catch(e => console.error("Cleanup failed for", file.filename, e));
            }
            return Promise.resolve();
        });
        Promise.all(cleanupPromises)
            .then(() => console.log("Orphaned files cleaned up if any."))
            .catch(e => console.error("Error during orphaned files cleanup:", e));
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
      });
    }
    // For other multer errors or custom errors from fileFilter
    if (err instanceof multer.MulterError || err.message.startsWith('Only image files')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    // Generic server error for unexpected issues
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during file upload.',
    });
  }
  next();
};