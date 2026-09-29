const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Initialize the S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create a Multer upload middleware configured for S3
const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    // Add metadata if you'd like
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    // Set the key (filename) in the S3 bucket
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'uploads/' + uniqueSuffix + '-' + file.originalname);
    },
  }),
});

module.exports = {
  s3,
  uploadToS3,
};
