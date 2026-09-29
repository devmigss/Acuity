const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { uploadToS3 } = require('../utils/s3');

const router = express.Router();

/**
 * @route POST /api/uploads/image
 * @desc Upload a single image file to AWS S3 (for profile pictures or project plates)
 * @access Private
 */
router.post('/image', requireAuth, uploadToS3.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // req.file contains information about the newly uploaded S3 object
    return res.status(200).json({
      message: 'Image uploaded successfully to S3',
      fileUrl: req.file.location, // The public URL to the uploaded file on S3
      fileKey: req.file.key,       // The S3 object key (filename)
    });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

module.exports = router;
