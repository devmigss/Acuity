const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole, auditLog } = require('../middleware/rbac');
const { prisma } = require('../utils/db');

const router = express.Router();

// All routes in /api/admin are strictly restricted to authenticated Admin users
router.use(requireAuth);
router.use(requireRole('Admin'));

/**
 * @route GET /api/admin/whitelist
 * @desc Get all faculty whitelist entries with optional filtering and pagination
 */
router.get('/whitelist', async (req, res) => {
  const { tenantId, status, search, page = 1, limit = 50 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    ...(tenantId ? { tenantId } : {}),
    ...(status ? { status } : {}),
    ...(search ? { allowedEmail: { contains: search.toLowerCase(), mode: 'insensitive' } } : {}),
  };

  try {
    const [whitelist, total] = await Promise.all([
      prisma.facultyWhitelist.findMany({
        where,
        include: {
          tenant: true,
          registeredUser: {
            select: { id: true, firstName: true, lastName: true, email: true, isActive: true },
          },
        },
        orderBy: { dateAdded: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.facultyWhitelist.count({ where }),
    ]);

    return res.json({
      whitelist,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching whitelist:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to fetch whitelist' });
  }
});

/**
 * @route POST /api/admin/whitelist
 * @desc Add a new faculty member to the whitelist
 */
router.post('/whitelist', async (req, res) => {
  const { email, tenantId, institution } = req.body;
  if (!email) {
    return res.status(400).json({ code: 'BAD_REQUEST', error: 'Email is required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if already in whitelist
    const existing = await prisma.facultyWhitelist.findUnique({
      where: { allowedEmail: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({ code: 'ALREADY_WHITELISTED', error: 'Email already whitelisted.' });
    }

    // Determine target tenant
    let targetTenantId = tenantId;
    if (!targetTenantId && institution) {
      const tenantMatch = await prisma.tenant.findFirst({
        where: {
          OR: [
            { id: institution },
            { institutionName: institution },
          ],
        },
      });
      if (tenantMatch) targetTenantId = tenantMatch.id;
    }

    if (!targetTenantId) {
      const domain = normalizedEmail.split('@')[1];
      const domainTenant = await prisma.tenant.findFirst({ where: { emailDomain: domain } });
      targetTenantId = domainTenant ? domainTenant.id : (await prisma.tenant.findFirst())?.id;
    }

    const newEntry = await prisma.facultyWhitelist.create({
      data: {
        allowedEmail: normalizedEmail,
        tenantId: targetTenantId,
        addedByAdminId: req.dbUser.id,
        status: 'PENDING_REGISTRATION',
      },
      include: { tenant: true },
    });

    await auditLog({
      actorId: req.dbUser.id,
      actorRole: 'Admin',
      tenantId: targetTenantId,
      action: 'FACULTY_WHITELIST_ADDED',
      resource: 'FacultyWhitelist',
      after: { allowedEmail: normalizedEmail, tenantId: targetTenantId },
      ip: req.ip,
    });

    return res.status(201).json({ message: 'Added to whitelist', entry: newEntry });
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to add to whitelist' });
  }
});

/**
 * @route DELETE /api/admin/whitelist/:id
 * @desc Revoke a whitelist entry
 */
router.delete('/whitelist/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await prisma.facultyWhitelist.findUnique({ where: { id } });
    if (!entry) {
      return res.status(404).json({ code: 'NOT_FOUND', error: 'Whitelist entry not found' });
    }

    const updated = await prisma.facultyWhitelist.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await auditLog({
      actorId: req.dbUser.id,
      actorRole: 'Admin',
      tenantId: entry.tenantId,
      action: 'FACULTY_WHITELIST_REVOKED',
      resource: 'FacultyWhitelist',
      after: { id: entry.id, status: 'REVOKED' },
      ip: req.ip,
    });

    return res.json({ message: 'Whitelist entry revoked.', entry: updated });
  } catch (error) {
    console.error('Error revoking whitelist:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to revoke whitelist' });
  }
});

/**
 * @route GET /api/admin/reactivation-requests
 * @desc Get all reactivation requests with optional status filtering and pagination
 */
router.get('/reactivation-requests', async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    ...(status ? { status } : {}),
  };

  try {
    const [requests, total] = await Promise.all([
      prisma.reactivationRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              tenant: true,
              deactivatedAt: true,
              deactivatedBy: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.reactivationRequest.count({ where }),
    ]);

    return res.json({
      requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching reactivation requests:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to fetch reactivation requests' });
  }
});

/**
 * @route POST /api/admin/reactivation-requests/:id/approve
 * @desc Approve a reactivation request and restore the user's active status
 */
router.post('/reactivation-requests/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    const request = await prisma.reactivationRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) {
      return res.status(404).json({ code: 'NOT_FOUND', error: 'Reactivation request not found.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ code: 'REQUEST_ALREADY_RESOLVED', error: 'Request is already resolved.' });
    }

    const now = new Date();

    const [updatedRequest] = await prisma.$transaction([
      prisma.reactivationRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          resolvedAt: now,
          resolvedByAdminId: req.dbUser.id,
        },
      }),
      prisma.user.update({
        where: { id: request.userId },
        data: {
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
        },
      }),
      prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'REACTIVATION_APPROVED',
          title: 'Account Reactivated',
          body: 'Your account reactivation request has been approved. You may now sign in and access your research projects.',
          data: { requestId: request.id },
        },
      }),
    ]);

    try {
      await auditLog({
        actorId: req.dbUser.id,
        actorRole: 'Admin',
        tenantId: request.user?.tenantId,
        action: 'ACCOUNT_REACTIVATION_APPROVED',
        resource: 'ReactivationRequest',
        after: { requestId: request.id, userId: request.userId, status: 'APPROVED' },
        ip: req.ip,
      });
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr.message);
    }

    return res.json({ message: 'Account reactivated successfully.', request: updatedRequest });
  } catch (error) {
    console.error('Error approving reactivation request:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to approve reactivation request.' });
  }
});

/**
 * @route POST /api/admin/reactivation-requests/:id/deny
 * @desc Deny a reactivation request with an optional reason
 */
router.post('/reactivation-requests/:id/deny', async (req, res) => {
  const { id } = req.params;
  const { reason, denyReason } = req.body || {};
  const reasonText = (reason || denyReason || '').trim();

  if (reasonText.length > 300) {
    return res.status(400).json({ code: 'BAD_REQUEST', error: 'Deny reason must be 300 characters or fewer.' });
  }

  try {
    const request = await prisma.reactivationRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) {
      return res.status(404).json({ code: 'NOT_FOUND', error: 'Reactivation request not found.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ code: 'REQUEST_ALREADY_RESOLVED', error: 'Request is already resolved.' });
    }

    const now = new Date();

    const [updatedRequest] = await prisma.$transaction([
      prisma.reactivationRequest.update({
        where: { id },
        data: {
          status: 'DENIED',
          denyReason: reasonText || null,
          resolvedAt: now,
          resolvedByAdminId: req.dbUser.id,
        },
      }),
      prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'REACTIVATION_DENIED',
          title: 'Account Reactivation Denied',
          body: reasonText
            ? `Your account reactivation request was denied: ${reasonText}`
            : 'Your account reactivation request was denied by an administrator.',
          data: { requestId: request.id, denyReason: reasonText || null },
        },
      }),
    ]);

    try {
      await auditLog({
        actorId: req.dbUser.id,
        actorRole: 'Admin',
        tenantId: request.user?.tenantId,
        action: 'ACCOUNT_REACTIVATION_DENIED',
        resource: 'ReactivationRequest',
        after: { requestId: request.id, userId: request.userId, status: 'DENIED', denyReason: reasonText || null },
        ip: req.ip,
      });
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr.message);
    }

    return res.json({ message: 'Reactivation request denied.', request: updatedRequest });
  } catch (error) {
    console.error('Error denying reactivation request:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to deny reactivation request.' });
  }
});

/**
 * @route POST /api/admin/users/:id/reactivate
 * @desc Directly reactivate an inactive user account
 */
router.post('/users/:id/reactivate', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ code: 'NOT_FOUND', error: 'User not found.' });
    }

    if (user.isActive) {
      return res.status(400).json({ code: 'ALREADY_ACTIVE', error: 'User account is already active.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null,
      },
    });

    try {
      await auditLog({
        actorId: req.dbUser.id,
        actorRole: 'Admin',
        tenantId: user.tenantId,
        action: 'ADMIN_USER_REACTIVATED',
        resource: 'User',
        after: { userId: user.id, isActive: true },
        ip: req.ip,
      });
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr.message);
    }

    return res.json({ message: 'User reactivated successfully.', user: updatedUser });
  } catch (error) {
    console.error('Error reactivating user:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to reactivate user.' });
  }
});

module.exports = router;
