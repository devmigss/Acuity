const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../utils/db');

const router = express.Router();

/**
 * @route POST /api/auth/sync
 * @desc Syncs a Cognito user to the local PostgreSQL database
 * @access Private (Requires Cognito Token)
 */
router.post('/sync', requireAuth, async (req, res) => {
  // `req.user` is populated by the `requireAuth` middleware
  // 'sub' is the unique Cognito User ID.
  const cognitoId = req.user.sub;
  const email = req.user.email || req.body.email; // Fallback to body if email is not in token
  
  if (!cognitoId) {
    return res.status(400).json({ error: 'Missing cognitoId (sub) in token' });
  }

  try {
    // 1. Check if the user already exists in the local database by cognitoId OR email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { cognitoId: cognitoId },
          { email: email || '' }
        ]
      },
      include: { tenant: true, role: true }
    });

    // If user exists but has a placeholder/wrong cognitoId (from force-sync script), fix it!
    if (user && user.cognitoId !== cognitoId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { cognitoId: cognitoId },
        include: { tenant: true, role: true }
      });
    }

    // 2. If user exists, just return them
    if (user) {
      return res.json({ message: 'User already in sync', user });
    }

    // 3. If user doesn't exist, we must create them.
    // TODO(Part 2): Full auth sync rewrite with institutional domain lookup
    let defaultTenant = await prisma.tenant.findFirst();
    if (!defaultTenant) {
      defaultTenant = await prisma.tenant.create({
        data: { institutionName: 'Default', emailDomain: 'default.local', isActive: true }
      });
    }

    let studentRole = await prisma.role.findUnique({
      where: { name: 'Student' }
    });

    if (!studentRole) {
      studentRole = await prisma.role.create({
        data: { name: 'Student' }
      });
    }

    let facultyRole = await prisma.role.findUnique({
      where: { name: 'Faculty' }
    });

    if (!facultyRole) {
      facultyRole = await prisma.role.create({
        data: { name: 'Faculty' }
      });
    }

    // TODO(Part 2): Faculty whitelist check by allowedEmail
    const whitelisted = await prisma.facultyWhitelist.findUnique({
      where: { allowedEmail: (email || '').toLowerCase() }
    });

    const domain = (email || '').split('@')[1];
    let matchingTenant = domain ? await prisma.tenant.findFirst({ where: { emailDomain: domain } }) : null;
    const assignedRoleId = whitelisted ? facultyRole.id : studentRole.id;
    const assignedTenantId = (whitelisted && whitelisted.tenantId) ? whitelisted.tenantId : (matchingTenant ? matchingTenant.id : defaultTenant.id);

    // 4. Create the new user and attach them to the Tenant and Role
    user = await prisma.user.create({
      data: {
        cognitoId,
        email: email || `${cognitoId}@placeholder.com`,
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        tenantId: assignedTenantId,
        roleId: assignedRoleId
      },
      include: { tenant: true, role: true }
    });

    // TODO(Part 2): Whitelist status transition to REGISTERED and registeredUserId linking
    if (whitelisted && whitelisted.status !== 'REGISTERED') {
      await prisma.facultyWhitelist.update({
        where: { id: whitelisted.id },
        data: {
          status: 'REGISTERED',
          registeredUserId: user.id
        }
      });
    }

    return res.status(201).json({ message: 'User successfully synced to database', user });

  } catch (error) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ error: 'Failed to sync user to database' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user details from Postgres
 * @access Private
 */
router.get('/me', requireAuth, async (req, res) => {
  const cognitoId = req.user.sub;
  try {
    const user = await prisma.user.findUnique({
      where: { cognitoId },
      include: { tenant: true, role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Server error fetching user details' });
  }
});

module.exports = router;
