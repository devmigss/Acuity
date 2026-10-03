const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

const hasS3Config =
  process.env.AWS_S3_BUCKET_NAME &&
  process.env.AWS_ACCESS_KEY_ID &&
  !process.env.AWS_ACCESS_KEY_ID.includes('placeholder');

// Initialize the S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock',
  },
});

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

function fileFilter(req, file, cb) {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Only JPG, PNG, and WebP are allowed."));
  }
}

const storage = hasS3Config
  ? multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'uploads/' + uniqueSuffix + '-' + file.originalname);
      },
    })
  : multer.memoryStorage();

// Create Multer upload middleware with 15 MB limit and MIME validation
const uploadToS3 = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
  fileFilter,
});

module.exports = {
  s3,
  uploadToS3,
  hasS3Config,
};
