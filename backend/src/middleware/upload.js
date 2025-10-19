// src/middleware/upload.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Your configured Cloudinary instance
  params: async (req, file) => {
    // Determine the folder on Cloudinary
    const folder = 'gec-mis/student-images';

    // Create a unique public_id (filename)
    // Example: 'image-1678886400000'
    const public_id = `${file.fieldname}-${Date.now()}`;

    return {
      folder: folder,
      public_id: public_id,
      allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed image formats
    };
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept file
  } else {
    // Reject file
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
  fileFilter: fileFilter,
});

export default upload;