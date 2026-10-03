const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { uploadToS3, hasS3Config } = require('../utils/s3');
const { auditLog } = require('../middleware/rbac');

const router = express.Router();

/**
 * @route POST /api/uploads/image
 * @desc Upload a single image file (profile picture or Petri dish plate)
 * @access Private
 */
router.post(
  '/image',
  requireAuth,
  (req, res, next) => {
    uploadToS3.single('image')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            code: 'FILE_TOO_LARGE',
            error: 'Image file exceeds the 15 MB limit.',
          });
        }
        return res.status(400).json({ code: 'INVALID_FILE', error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ code: 'NO_FILE', error: 'No image file provided' });
      }

      const fileUrl = hasS3Config && req.file.location
        ? req.file.location
        : `data:${req.file.mimetype};base64,${req.file.buffer ? req.file.buffer.toString('base64') : ''}`;

      const fileKey = req.file.key || `local-upload-${Date.now()}`;

      await auditLog({
        actorId: req.dbUser.id,
        actorRole: req.dbUser.role?.name || 'Student',
        tenantId: req.dbUser.tenantId,
        action: 'IMAGE_UPLOADED_LEGACY',
        resource: 'Upload',
        after: { fileKey, mimetype: req.file.mimetype, size: req.file.size },
        ip: req.ip,
      });

      return res.status(200).json({
        message: 'Image uploaded successfully',
        fileUrl,
        fileKey,
      });
    } catch (error) {
      console.error('Error in legacy upload handler:', error);
      return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to process image upload' });
    }
  }
);

module.exports = router;
