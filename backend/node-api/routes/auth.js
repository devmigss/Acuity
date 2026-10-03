const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../utils/db');
const { auditLog } = require('../middleware/rbac');

const router = express.Router();

/**
 * Checks if an email domain qualifies as educational (.edu, .ac, or country edu variants)
 */
function isEduDomain(domain) {
  if (!domain) return false;
  const d = domain.toLowerCase();
  return d.endsWith('.edu') || d.endsWith('.edu.ph') || d.endsWith('.ac.uk') || d.endsWith('.edu.au') || d.includes('.edu.');
}

const rateLimit = require('express-rate-limit');

// Rate limit: 10 requests per 15 minutes
const syncRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    code: 'RATE_LIMITED',
    error: 'Too many registration sync requests. Please try again later.',
  },
  keyGenerator: (req) => req.user?.sub || req.ip || 'anonymous',
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * @route POST /api/auth/sync
 * @desc Syncs a verified Cognito user into the local PostgreSQL database
 * @access Private (Requires Cognito Token; allows un-synced tokens)
 */
router.post('/sync', requireAuth.allowUnsynced, syncRateLimiter, async (req, res) => {
  // Security invariant: Email is read strictly from verified token, never trusted from body
  const cognitoId = req.user?.sub;
  const tokenEmail = (req.user?.email || '').toLowerCase().trim();

  if (!cognitoId || !tokenEmail) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      error: 'Token must include sub and email claims.',
    });
  }

  // Name fallbacks from token or body (used only for new user creation)
  const firstName = (req.user?.given_name || req.body?.firstName || '').trim();
  const lastName = (req.user?.family_name || req.body?.lastName || '').trim();
  const termsAccepted = req.body?.termsAccepted === true;
  const termsAcceptedAt = termsAccepted ? new Date() : null;

  // Check admin bootstrap allowlist from environment
  const bootstrapAdminEmails = (process.env.ADMIN_BOOTSTRAP_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isBootstrapAdmin = bootstrapAdminEmails.includes(tokenEmail);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Seed account linking for development / test mode
      if (process.env.NODE_ENV !== 'production') {
        const seedUser = await tx.user.findFirst({
          where: {
            email: tokenEmail,
            cognitoId: { startsWith: 'seed:' },
          },
          include: { role: true, tenant: true },
        });

        if (seedUser) {
          const linkedUser = await tx.user.update({
            where: { id: seedUser.id },
            data: {
              cognitoId,
              ...(termsAccepted && !seedUser.termsAcceptedAt ? { termsAcceptedAt } : {}),
            },
            include: { role: true, tenant: true },
          });

          await auditLog({
            actorId: linkedUser.id,
            actorRole: linkedUser.role?.name || 'Student',
            tenantId: linkedUser.tenantId,
            action: 'USER_COGNITO_SEED_LINKED',
            resource: 'User',
            after: { email: linkedUser.email, cognitoId },
            ip: req.ip,
          });

          return { status: 200, body: { message: 'Seed user linked successfully', user: linkedUser } };
        }
      }

      // 2. Check if user already exists by cognitoId OR email
      let user = await tx.user.findFirst({
        where: {
          OR: [
            { cognitoId },
            { email: tokenEmail },
          ],
        },
        include: { role: true, tenant: true },
      });

      if (user) {
        // Enforce account active status
        if (user.isActive === false) {
          return { status: 403, body: { code: 'ACCOUNT_DEACTIVATED', error: 'This account has been deactivated.' } };
        }

        // If user is Faculty, verify whitelist has not been revoked
        if (user.role?.name === 'Faculty') {
          const wl = await tx.facultyWhitelist.findUnique({
            where: { allowedEmail: tokenEmail },
          });
          if (wl && wl.status === 'REVOKED') {
            return { status: 403, body: { code: 'ACCESS_REVOKED', error: 'Your faculty access has been revoked.' } };
          }
        }

        // If tenant is suspended (non-admin only)
        if (user.role?.name !== 'Admin' && user.tenant && user.tenant.isActive === false) {
          return { status: 403, body: { code: 'TENANT_SUSPENDED', error: 'Your institution account has been suspended.' } };
        }

        // Update cognitoId if it didn't match (e.g. initial SSO or ID transition)
        const updates = {};
        if (user.cognitoId !== cognitoId) {
          updates.cognitoId = cognitoId;
        }
        if (termsAccepted && !user.termsAcceptedAt) {
          updates.termsAcceptedAt = termsAcceptedAt;
        }

        if (Object.keys(updates).length > 0) {
          user = await tx.user.update({
            where: { id: user.id },
            data: updates,
            include: { role: true, tenant: true },
          });
        }

        return { status: 200, body: { message: 'User already in sync', user } };
      }

      // 3. New User Registration Flow
      // Check roles
      const studentRole = await tx.role.findUnique({ where: { name: 'Student' } });
      const facultyRole = await tx.role.findUnique({ where: { name: 'Faculty' } });
      const adminRole = await tx.role.findUnique({ where: { name: 'Admin' } });

      if (!studentRole || !facultyRole || !adminRole) {
        throw new Error('Required roles (Student, Faculty, Admin) not seeded in database');
      }

      // 3A. Bootstrap Admin check
      if (isBootstrapAdmin) {
        const newAdmin = await tx.user.create({
          data: {
            email: tokenEmail,
            cognitoId,
            firstName: firstName || 'System',
            lastName: lastName || 'Admin',
            roleId: adminRole.id,
            tenantId: null,
            isActive: true,
            termsAcceptedAt,
          },
          include: { role: true, tenant: true },
        });

        await auditLog({
          actorId: newAdmin.id,
          actorRole: 'Admin',
          tenantId: null,
          action: 'USER_REGISTERED_BOOTSTRAP_ADMIN',
          resource: 'User',
          after: { email: newAdmin.email, role: 'Admin' },
          ip: req.ip,
        });

        return { status: 201, body: { message: 'Admin user bootstrapped successfully', user: newAdmin } };
      }

      // 3B. Faculty Whitelist check
      const whitelistEntry = await tx.facultyWhitelist.findUnique({
        where: { allowedEmail: tokenEmail },
      });

      if (whitelistEntry) {
        if (whitelistEntry.status === 'REVOKED') {
          return { status: 403, body: { code: 'ACCESS_REVOKED', error: 'Your faculty whitelist access has been revoked.' } };
        }

        if (whitelistEntry.status === 'REGISTERED' && whitelistEntry.registeredUserId) {
          return {
            status: 409,
            body: { code: 'WHITELIST_CONFLICT', error: 'This faculty email is already registered to another user account.' },
          };
        }

        // Atomically claim the pending whitelist row
        const claimResult = await tx.facultyWhitelist.updateMany({
          where: {
            id: whitelistEntry.id,
            status: 'PENDING_REGISTRATION',
          },
          data: {
            status: 'REGISTERED',
          },
        });

        if (claimResult.count === 0 && whitelistEntry.status !== 'REGISTERED') {
          return {
            status: 409,
            body: { code: 'WHITELIST_CONFLICT', error: 'Concurrent registration claim conflict. Please try again.' },
          };
        }

        // Create Faculty User linked to whitelist's tenantId
        const facultyUser = await tx.user.create({
          data: {
            email: tokenEmail,
            cognitoId,
            firstName: firstName || 'Faculty',
            lastName: lastName || 'Adviser',
            roleId: facultyRole.id,
            tenantId: whitelistEntry.tenantId,
            isActive: true,
            termsAcceptedAt,
          },
          include: { role: true, tenant: true },
        });

        // Link registeredUserId on whitelist row
        await tx.facultyWhitelist.update({
          where: { id: whitelistEntry.id },
          data: {
            status: 'REGISTERED',
            registeredUserId: facultyUser.id,
          },
        });

        await auditLog({
          actorId: facultyUser.id,
          actorRole: 'Faculty',
          tenantId: facultyUser.tenantId,
          action: 'USER_REGISTERED_FACULTY',
          resource: 'User',
          after: { email: facultyUser.email, whitelistId: whitelistEntry.id },
          ip: req.ip,
        });

        return { status: 201, body: { message: 'Faculty user registered successfully', user: facultyUser } };
      }

      // 3C. Student Domain Check
      const domain = tokenEmail.split('@')[1];
      const enforceEdu = process.env.ENFORCE_EDU_DOMAIN === 'true';

      if (enforceEdu && !isEduDomain(domain)) {
        return {
          status: 403,
          body: {
            code: 'UNRECOGNIZED_INSTITUTION',
            error: 'Personal email domains are not allowed. Please use your verified institutional email.',
          },
        };
      }

      // Match tenant by email domain
      const matchingTenant = domain
        ? await tx.tenant.findFirst({
            where: { emailDomain: domain, isActive: true },
          })
        : null;

      if (!matchingTenant) {
        return {
          status: 403,
          body: {
            code: 'UNRECOGNIZED_INSTITUTION',
            error: 'Your educational institution is not registered with Acuity. Contact your institution administrator.',
          },
        };
      }

      // Create Student user with tenantId = matchingTenant.id
      const studentUser = await tx.user.create({
        data: {
          email: tokenEmail,
          cognitoId,
          firstName: firstName || 'Student',
          lastName: lastName || 'Researcher',
          roleId: studentRole.id,
          tenantId: matchingTenant.id,
          isActive: true,
          termsAcceptedAt,
        },
        include: { role: true, tenant: true },
      });

      await auditLog({
        actorId: studentUser.id,
        actorRole: 'Student',
        tenantId: studentUser.tenantId,
        action: 'USER_REGISTERED_STUDENT',
        resource: 'User',
        after: { email: studentUser.email, tenantId: matchingTenant.id },
        ip: req.ip,
      });

      return { status: 201, body: { message: 'Student user registered successfully', user: studentUser } };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Error in /api/auth/sync transaction:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to sync user to database' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Return the verified database user record and session context
 * @access Private
 */
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.dbUser });
});

/**
 * @route GET /api/auth/status
 * @desc Return account state, deactivation metadata, pending reactivation request, and self-reactivation eligibility
 * @access Private (allows inactive users)
 */
router.get('/status', requireAuth.allowInactive, async (req, res) => {
  const user = req.dbUser;

  try {
    let state = 'ACTIVE';
    if (user.isActive === false) {
      state = user.deactivatedBy || 'SELF';
    }

    // Check if faculty whitelist revoked
    if (user.role?.name === 'Faculty') {
      const wl = await prisma.facultyWhitelist.findUnique({
        where: { allowedEmail: user.email },
      });
      if (wl && wl.status === 'REVOKED') {
        state = 'ACCESS_REVOKED';
      }
    }

    // Check if tenant suspended (non-admin)
    if (user.role?.name !== 'Admin' && user.tenant && user.tenant.isActive === false) {
      state = 'TENANT_SUSPENDED';
    }

    // Pending reactivation request
    const pendingRequest = await prisma.reactivationRequest.findFirst({
      where: { userId: user.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    // Self-reactivation window check (SELF_REACTIVATION_DAYS, default 0 = disabled)
    const selfReactivationDays = parseInt(process.env.SELF_REACTIVATION_DAYS || '0', 10);
    let canSelfReactivate = false;
    if (selfReactivationDays > 0 && user.deactivatedBy === 'SELF' && user.deactivatedAt) {
      const elapsedDays = (Date.now() - new Date(user.deactivatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (elapsedDays <= selfReactivationDays) {
        canSelfReactivate = true;
      }
    }

    return res.json({
      state,
      deactivatedBy: user.deactivatedBy,
      deactivatedAt: user.deactivatedAt,
      pendingRequest: pendingRequest
        ? {
            id: pendingRequest.id,
            createdAt: pendingRequest.createdAt,
            message: pendingRequest.message,
            status: pendingRequest.status,
          }
        : null,
      canSelfReactivate,
    });
  } catch (error) {
    console.error('Error fetching auth status:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to fetch account status.' });
  }
});

/**
 * @route POST /api/auth/reactivation-request
 * @desc Submit a request to reactivate an inactive account (1 pending max, 1 per 24 hours)
 * @access Private (allows inactive users)
 */
router.post('/reactivation-request', requireAuth.allowInactive, async (req, res) => {
  const user = req.dbUser;

  // Account must be inactive
  if (user.isActive === true) {
    return res.status(400).json({
      code: 'ACCOUNT_ALREADY_ACTIVE',
      error: 'Your account is already active.',
    });
  }

  // ACCESS_REVOKED or TENANT_SUSPENDED users cannot create a reactivation request
  if (user.role?.name === 'Faculty') {
    const wl = await prisma.facultyWhitelist.findUnique({
      where: { allowedEmail: user.email },
    });
    if (wl && wl.status === 'REVOKED') {
      return res.status(403).json({
        code: 'ACCESS_REVOKED_NO_REQUEST',
        error: 'Reactivation requests are not available for revoked accounts. Contact your administrator.',
      });
    }
  }

  if (user.role?.name !== 'Admin' && user.tenant && user.tenant.isActive === false) {
    return res.status(403).json({
      code: 'TENANT_SUSPENDED_NO_REQUEST',
      error: 'Reactivation requests are not available for suspended institutions. Contact your administrator.',
    });
  }

  // Validate optional message (max 300 characters)
  const { message } = req.body || {};
  if (message !== undefined && message !== null) {
    if (typeof message !== 'string' || message.length > 300) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        error: 'Message must be 300 characters or fewer.',
      });
    }
  }

  try {
    // 1 open request per user (checked in code + backed by unique partial index in DB)
    const existingPending = await prisma.reactivationRequest.findFirst({
      where: { userId: user.id, status: 'PENDING' },
    });
    if (existingPending) {
      return res.status(409).json({
        code: 'DUPLICATE_PENDING_REQUEST',
        error: 'You already have a pending reactivation request.',
      });
    }

    // Max 1 request per 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequest = await prisma.reactivationRequest.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (recentRequest) {
      return res.status(429).json({
        code: 'RATE_LIMITED',
        error: 'You may only submit one reactivation request every 24 hours.',
      });
    }

    // Create the request
    const request = await prisma.reactivationRequest.create({
      data: {
        userId: user.id,
        message: message ? message.trim() : null,
        status: 'PENDING',
      },
    });

    // Notify all active system administrators
    try {
      const adminUsers = await prisma.user.findMany({
        where: { role: { name: 'Admin' }, isActive: true },
      });
      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'REACTIVATION_REQUESTED',
            title: 'Account Reactivation Requested',
            body: `${user.firstName || ''} ${user.lastName || ''} (${user.email}) requested account reactivation.`,
            data: {
              requestId: request.id,
              targetUserId: user.id,
              targetEmail: user.email,
              message: request.message,
            },
          },
        });
      }
    } catch (notifErr) {
      console.warn('Failed to send admin notification for reactivation request:', notifErr.message);
    }

    // Append audit log
    try {
      await auditLog({
        actorId: user.id,
        actorRole: user.role?.name || 'Student',
        tenantId: user.tenantId,
        action: 'ACCOUNT_REACTIVATION_REQUESTED',
        resource: 'ReactivationRequest',
        after: { requestId: request.id, userId: user.id },
        ip: req.ip,
      });
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr.message);
    }

    return res.status(201).json({
      message: 'Request sent.',
      request,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        code: 'DUPLICATE_PENDING_REQUEST',
        error: 'You already have a pending reactivation request.',
      });
    }
    console.error('Error creating reactivation request:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to submit reactivation request.' });
  }
});

/**
 * @route POST /api/auth/self-reactivate
 * @desc Instant self-reactivation within SELF_REACTIVATION_DAYS window
 * @access Private (allows inactive users)
 */
router.post('/self-reactivate', requireAuth.allowInactive, async (req, res) => {
  const user = req.dbUser;

  if (user.isActive === true) {
    return res.status(400).json({ code: 'ACCOUNT_ALREADY_ACTIVE', error: 'Your account is already active.' });
  }

  const selfReactivationDays = parseInt(process.env.SELF_REACTIVATION_DAYS || '0', 10);
  if (selfReactivationDays <= 0) {
    return res.status(403).json({ code: 'SELF_REACTIVATION_DISABLED', error: 'Instant self-reactivation is disabled.' });
  }

  if (user.deactivatedBy !== 'SELF') {
    return res.status(403).json({ code: 'CANNOT_SELF_REACTIVATE', error: 'Only self-deactivated accounts may self-reactivate.' });
  }

  if (!user.deactivatedAt) {
    return res.status(400).json({ code: 'INVALID_DEACTIVATION_STATE', error: 'Deactivation timestamp missing.' });
  }

  const elapsedDays = (Date.now() - new Date(user.deactivatedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (elapsedDays > selfReactivationDays) {
    return res.status(400).json({ code: 'SELF_REACTIVATION_EXPIRED', error: 'Self-reactivation window has expired.' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null,
      },
    });

    try {
      await auditLog({
        actorId: user.id,
        actorRole: user.role?.name || 'Student',
        tenantId: user.tenantId,
        action: 'ACCOUNT_SELF_REACTIVATED',
        resource: 'User',
        after: { isActive: true },
        ip: req.ip,
      });
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr.message);
    }

    return res.status(200).json({ message: 'Your account has been reactivated successfully.', user: updated });
  } catch (error) {
    console.error('Error in self-reactivate:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to reactivate account.' });
  }
});

module.exports = router;
