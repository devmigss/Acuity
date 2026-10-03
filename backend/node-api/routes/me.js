const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../utils/db');
const { validateProfileUpdate } = require('../utils/validation');

const router = express.Router();

// Rate limiter: 10 profile updates per minute per user
const profileRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    code: 'RATE_LIMITED',
    error: 'Too many requests. Please wait a minute and try again.',
  },
  keyGenerator: (req) => req.user?.sub || req.ip || 'anonymous',
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// Configure multer memory storage with 5 MB strict limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

/**
 * Checks magic bytes of a buffer for valid JPG, PNG, or WebP signatures
 */
function isValidImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return false;

  // JPEG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // WebP magic bytes: 'RIFF' at 0..3 and 'WEBP' at 8..11
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return true;
  }

  return false;
}

/**
 * @route GET /api/me
 * @desc Returns current authenticated user profile
 * @access Private
 */
router.get('/', requireAuth, async (req, res) => {
  return res.json({ user: req.dbUser });
});

/**
 * @route PATCH /api/me/profile
 * @desc Update the current authenticated user's researcher profile
 * @access Private
 */
router.patch('/profile', requireAuth, profileRateLimiter, async (req, res) => {
  const cognitoId = req.user?.sub;
  const email = req.user?.email;

  // 1. Strict validation & forbidden fields check
  const validation = validateProfileUpdate(req.body);
  if (!validation.isValid) {
    return res.status(400).json(validation.errorResponse);
  }

  const { data } = validation;

  try {
    // 2. Resolve target user strictly from token (never body)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(cognitoId ? [{ cognitoId }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
      include: { role: true, tenant: true },
    });

    if (!user) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', error: 'User profile not found.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ code: 'ACCOUNT_DEACTIVATED', error: 'This account has been deactivated.' });
    }

    // 3. Track changed field names for audit logging
    const changedFields = [];
    if (data.firstName && data.firstName !== user.firstName) changedFields.push('firstName');
    if (data.lastName && data.lastName !== user.lastName) changedFields.push('lastName');
    const newBio = data.biography !== undefined ? data.biography : data.bio;
    if (newBio !== undefined && newBio !== user.bio) changedFields.push('bio');
    if (data.department !== undefined && data.department !== user.department) changedFields.push('department');
    const newGroup = data.laboratoryGroup !== undefined ? data.laboratoryGroup : data.group;
    if (newGroup !== undefined && newGroup !== user.laboratoryGroup) changedFields.push('laboratoryGroup');
    if (data.avatarUrl !== undefined && data.avatarUrl !== user.avatarUrl) changedFields.push('avatarUrl');

    // 4. Update the database record
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(newBio !== undefined && { bio: newBio }),
        ...(data.department !== undefined && { department: data.department }),
        ...(newGroup !== undefined && { laboratoryGroup: newGroup }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      },
      include: { role: true, tenant: true },
    });

    // 5. Append audit log entry (ONLY changed field names, never bio text)
    if (changedFields.length > 0) {
      try {
        await prisma.auditLog.create({
          data: {
            action: 'USER_PROFILE_UPDATED',
            actorId: user.id,
            actorRole: user.role?.name || 'Student',
            tenantId: user.tenantId,
            resource: 'User',
            after: { changedFields },
            ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          },
        });
      } catch (auditErr) {
        console.warn('Audit log write skipped:', auditErr.message);
      }
    }

    return res.status(200).json({
      message: 'Profile updated.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      code: 'SERVER_ERROR',
      error: 'Something went wrong on our side. Your changes were not saved. Please try again.',
    });
  }
});

/**
 * @route POST /api/me/avatar
 * @desc Upload, inspect, decode, square re-encode to WebP, and strip EXIF for user avatar
 * @access Private
 */
router.post(
  '/avatar',
  requireAuth,
  profileRateLimiter,
  (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            code: 'FILE_TOO_LARGE',
            error: 'That image exceeds the 5 MB limit. Please choose one under 5 MB.',
          });
        }
        return res.status(400).json({ code: 'UPLOAD_ERROR', error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        code: 'NO_FILE_PROVIDED',
        error: 'Please choose an image file to upload.',
      });
    }

    // 1. Verify file signature (magic bytes)
    if (!isValidImageMagicBytes(file.buffer)) {
      return res.status(415).json({
        code: 'UNSUPPORTED_MEDIA_TYPE',
        error: "That file type isn't supported. Please upload a JPG, PNG, or WebP image.",
      });
    }

    // 2. Decode image and inspect dimensions via sharp
    let metadata;
    try {
      metadata = await sharp(file.buffer).metadata();
    } catch (decodeErr) {
      return res.status(400).json({
        code: 'IMAGE_DECODE_FAILED',
        error: "We couldn't read that image. Please try a different file.",
      });
    }

    if (!metadata.width || !metadata.height) {
      return res.status(400).json({
        code: 'IMAGE_DECODE_FAILED',
        error: "We couldn't read that image. Please try a different file.",
      });
    }

    if (metadata.width < 128 || metadata.height < 128) {
      return res.status(400).json({
        code: 'IMAGE_TOO_SMALL',
        error: 'That image is too small (minimum 128×128).',
      });
    }

    if (metadata.width > 4096 || metadata.height > 4096) {
      return res.status(400).json({
        code: 'IMAGE_TOO_LARGE',
        error: 'That image is too large (maximum 4096×4096).',
      });
    }

    // 3. Re-encode to 512x512 square WebP and strip EXIF (metadata is omitted by default)
    let processedBuffer;
    try {
      processedBuffer = await sharp(file.buffer)
        .resize(512, 512, { fit: 'cover' })
        .webp({ quality: 85 })
        .toBuffer();
    } catch (processErr) {
      console.error('Error processing avatar image:', processErr);
      return res.status(500).json({
        code: 'IMAGE_PROCESSING_FAILED',
        error: 'Failed to process image. Please try again.',
      });
    }

    try {
      const cognitoId = req.user?.sub;
      const email = req.user?.email;

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(cognitoId ? [{ cognitoId }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      });

      if (!user) {
        return res.status(404).json({ code: 'USER_NOT_FOUND', error: 'User not found.' });
      }

      if (user.isActive === false) {
        return res.status(403).json({ code: 'ACCOUNT_DEACTIVATED', error: 'This account has been deactivated.' });
      }

      // Generate object key per specification: avatars/<tenantId>/<userId>/<uuid>.webp
      const tenantKey = user.tenantId || 'global';
      const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const objectKey = `avatars/${tenantKey}/${user.id}/${fileId}.webp`;

      let avatarUrl = '';

      // Check if AWS S3 is fully configured with credentials
      if (
        process.env.AWS_S3_BUCKET_NAME &&
        process.env.AWS_ACCESS_KEY_ID &&
        !process.env.AWS_ACCESS_KEY_ID.includes('placeholder')
      ) {
        const { PutObjectCommand } = require('@aws-sdk/client-s3');
        const { s3 } = require('../utils/s3');
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: objectKey,
            Body: processedBuffer,
            ContentType: 'image/webp',
          })
        );
        avatarUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${objectKey}`;
      } else {
        // Fallback for development / mock environments without live AWS keys
        avatarUrl = `data:image/webp;base64,${processedBuffer.toString('base64')}`;
      }

      // Update user avatarUrl in database
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
        include: { role: true, tenant: true },
      });

      // Audit log
      try {
        await prisma.auditLog.create({
          data: {
            action: 'USER_AVATAR_UPDATED',
            actorId: user.id,
            actorRole: user.role?.name || 'Student',
            tenantId: user.tenantId,
            resource: 'User',
            after: { changedFields: ['avatarUrl'] },
            ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          },
        });
      } catch (auditErr) {
        console.warn('Audit log write skipped:', auditErr.message);
      }

      return res.status(200).json({
        message: 'Avatar uploaded successfully.',
        avatarUrl,
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error saving avatar:', error);
      return res.status(500).json({
        code: 'SERVER_ERROR',
        error: 'Failed to save avatar image.',
      });
    }
  }
);

/**
 * @route POST /api/me/deactivate
 * @desc Deactivates the current authenticated user's account
 * @access Private
 */
router.post('/deactivate', requireAuth, async (req, res) => {
  const user = req.dbUser;
  const { confirmation } = req.body;

  // 1. Exact match confirmation check
  if (confirmation !== 'DEACTIVATE') {
    return res.status(400).json({
      code: 'INVALID_CONFIRMATION',
      error: 'Please type DEACTIVATE exactly to confirm account deactivation.',
    });
  }

  // 2. Admin cannot self-deactivate
  if (user.role?.name === 'Admin') {
    return res.status(403).json({
      code: 'ADMIN_CANNOT_SELF_DEACTIVATE',
      error: 'System administrators cannot self-deactivate their accounts.',
    });
  }

  try {
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // 3. Mark user inactive and record deactivation metadata
      await tx.user.update({
        where: { id: user.id },
        data: {
          isActive: false,
          deactivatedAt: now,
          deactivatedBy: 'SELF',
          sessionsValidAfter: now,
        },
      });

      // 4. If user is Faculty, cascade remove open adviser links and notify project owners
      if (user.role?.name === 'Faculty') {
        const activeLinks = await tx.projectAdviser.findMany({
          where: { adviserUserId: user.id, status: 'ACTIVE' },
          include: { project: { select: { id: true, name: true, ownerId: true } } },
        });

        const pendingLinks = await tx.projectAdviser.findMany({
          where: { adviserUserId: user.id, status: 'PENDING' },
          include: { project: { select: { id: true, name: true, ownerId: true } } },
        });

        // Set ACTIVE -> REMOVED
        await tx.projectAdviser.updateMany({
          where: { adviserUserId: user.id, status: 'ACTIVE' },
          data: { status: 'REMOVED' },
        });

        // Set PENDING -> CANCELLED
        await tx.projectAdviser.updateMany({
          where: { adviserUserId: user.id, status: 'PENDING' },
          data: { status: 'CANCELLED' },
        });

        // Notify affected project owners
        const affectedProjects = [...activeLinks, ...pendingLinks];
        for (const link of affectedProjects) {
          if (link.project?.ownerId) {
            await tx.notification.create({
              data: {
                userId: link.project.ownerId,
                type: 'ADVISER_DEACTIVATED',
                title: 'Adviser Deactivated',
                body: `Your faculty adviser for "${link.project.name}" has deactivated their account.`,
                data: { projectId: link.projectId, adviserUserId: user.id },
              },
            });
          }
        }
      }

      // 5. Append audit log
      try {
        await tx.auditLog.create({
          data: {
            action: 'ACCOUNT_SELF_DEACTIVATED',
            actorId: user.id,
            actorRole: user.role?.name || 'Student',
            tenantId: user.tenantId,
            resource: 'User',
            after: { isActive: false, deactivatedBy: 'SELF', deactivatedAt: now.toISOString() },
            ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          },
        });
      } catch (auditErr) {
        console.warn('Audit log write skipped:', auditErr.message);
      }
    });

    return res.status(200).json({ message: 'Account deactivated successfully.' });
  } catch (error) {
    console.error('Error deactivating account:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to deactivate account.' });
  }
});

/**
 * @route POST /api/me/sessions/revoke
 * @desc Revokes all active sessions for current user (updates sessionsValidAfter)
 * @access Private
 */
router.post('/sessions/revoke', requireAuth, async (req, res) => {
  const user = req.dbUser;
  const now = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { sessionsValidAfter: now },
      });

      try {
        await tx.auditLog.create({
          data: {
            action: 'SESSIONS_REVOKED',
            actorId: user.id,
            actorRole: user.role?.name || 'Student',
            tenantId: user.tenantId,
            resource: 'Session',
            after: { sessionsValidAfter: now.toISOString() },
            ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          },
        });
      } catch (auditErr) {
        console.warn('Audit log write skipped:', auditErr.message);
      }
    });

    return res.status(200).json({ message: 'All sessions revoked successfully.' });
  } catch (error) {
    console.error('Error revoking sessions:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to revoke sessions.' });
  }
});

module.exports = router;
