import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});


const fileFilter = (req, file, cb) => {

  const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
  const validExtRegex = /\.(jpg|jpeg|png|gif)$/i;
  

  if (!validMimeTypes.includes(file.mimetype)) {

    return cb(new Error("Only image files are allowed (jpg, jpeg, png, gif)!"), false);
  }
  

  if (!file.originalname.match(validExtRegex)) {
   
    const extension = file.mimetype.split('/')[1];
    const oldName = file.originalname;
    file.originalname = `${oldName}.${extension}`;
    

  }
  
  cb(null, true);
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});


export const handleUploadError = (err, req, res, next) => {
  
  if (err) {
    console.error('Upload error:', err);
    
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected file field. Use \'profileImage\' for uploads.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else {
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    }
  }
  

  next();
};

export default upload; 