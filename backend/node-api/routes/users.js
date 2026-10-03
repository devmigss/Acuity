const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole, auditLog } = require('../middleware/rbac');
const { prisma } = require('../utils/db');

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users in the system (Restricted to Admin Dashboard)
 * @access Private (Admin only)
 */
router.get('/', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        tenant: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map((user) => ({
      id: user.cognitoId || user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
      email: user.email,
      role: user.role?.name || 'Student',
      institution: user.tenant?.institutionName || 'Acuity Global',
      status: user.isActive ? 'Active' : 'Deactivated',
      avatarUrl: user.avatarUrl || null,
      createdAt: user.createdAt,
    }));

    return res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to fetch users' });
  }
});

/**
 * @route PUT /api/users/profile
 * @desc Legacy update for user's profile (name, avatar)
 * @access Private
 */
router.put('/profile', requireAuth, async (req, res) => {
  const { firstName, lastName, avatarUrl } = req.body;
  const userId = req.dbUser.id;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName: firstName.trim() }),
        ...(lastName !== undefined && { lastName: lastName.trim() }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      include: { role: true, tenant: true },
    });

    await auditLog({
      actorId: userId,
      actorRole: req.dbUser.role?.name || 'Student',
      tenantId: req.dbUser.tenantId,
      action: 'USER_PROFILE_UPDATED_LEGACY',
      resource: 'User',
      after: { firstName, lastName, avatarUrl },
      ip: req.ip,
    });

    return res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to update profile' });
  }
});

module.exports = router;
