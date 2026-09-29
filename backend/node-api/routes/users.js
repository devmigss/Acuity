const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../utils/db');

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users in the system (for Admin Dashboard)
 * @access Private
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        tenant: true,
        role: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format the users to match what the frontend expects
    const formattedUsers = users.map(user => ({
      id: user.cognitoId || user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
      email: user.email,
      role: user.role?.name || 'Student',
      institution: user.tenant?.name || 'Unknown Institution',
      status: 'Active'
    }));

    return res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * @route PUT /api/users/profile
 * @desc Update the current user's profile (name, avatar)
 * @access Private
 */
router.put('/profile', requireAuth, async (req, res) => {
  const cognitoId = req.user.sub;
  const { firstName, lastName, avatarUrl } = req.body;

  try {
    const user = await prisma.user.update({
      where: { cognitoId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(avatarUrl && { avatarUrl })
      }
    });

    return res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
