const { prisma } = require('../utils/db');

/**
 * Enforces that the authenticated user possesses one of the allowed roles.
 * Must be used after requireAuth.
 * @param  {...string} allowedRoles (e.g. 'Admin', 'Faculty', 'Student')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.dbUser?.role?.name;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        error: 'Insufficient role permissions',
      });
    }

    next();
  };
}

/**
 * Enforces tenant isolation.
 * Admin users bypass tenant checks.
 * For non-admins, cross-tenant requests return 404 (NOT 403) to prevent resource enumeration.
 * @param {Function} tenantIdExtractor Function extracting resource tenantId from req
 */
function requireSameTenant(tenantIdExtractor) {
  return async (req, res, next) => {
    if (!req.dbUser) {
      return res.status(401).json({ code: 'UNAUTHORIZED', error: 'Authentication required' });
    }

    // System Admins have cross-tenant authority
    if (req.dbUser.role?.name === 'Admin') {
      return next();
    }

    try {
      const resourceTenantId = typeof tenantIdExtractor === 'function'
        ? await tenantIdExtractor(req)
        : req.params.tenantId;

      if (!resourceTenantId || resourceTenantId !== req.dbUser.tenantId) {
        // Return 404 to avoid leaking existence of cross-tenant resources
        return res.status(404).json({
          code: 'NOT_FOUND',
          error: 'Resource not found',
        });
      }

      next();
    } catch (err) {
      console.error('Error verifying tenant isolation:', err);
      return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to verify tenant isolation' });
    }
  };
}

/**
 * Verifies access to a research project.
 * Checks project tenant isolation, ownership, project membership, and active adviser status.
 * @param {object} options { role: 'owner' | 'member' | 'adviser' | 'any' }
 */
function requireProjectAccess(options = { role: 'any' }) {
  const requiredAccess = options.role || 'any';

  return async (req, res, next) => {
    if (!req.dbUser) {
      return res.status(401).json({ code: 'UNAUTHORIZED', error: 'Authentication required' });
    }

    const projectId = req.params.projectId || req.params.id;
    if (!projectId) {
      return res.status(400).json({ code: 'BAD_REQUEST', error: 'Missing project ID parameter' });
    }

    // Admins have override access
    if (req.dbUser.role?.name === 'Admin') {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) return res.status(404).json({ code: 'NOT_FOUND', error: 'Project not found' });
      req.project = project;
      return next();
    }

    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: true,
          advisers: { where: { status: 'ACTIVE' } },
        },
      });

      if (!project) {
        return res.status(404).json({ code: 'NOT_FOUND', error: 'Project not found' });
      }

      // 1. Cross-tenant check: return 404 to prevent resource enumeration
      if (project.tenantId !== req.dbUser.tenantId) {
        return res.status(404).json({ code: 'NOT_FOUND', error: 'Project not found' });
      }

      const isOwner = project.ownerId === req.dbUser.id;
      const isMember = project.members.some((m) => m.userId === req.dbUser.id);
      const isAdviser = project.advisers.some((a) => a.adviserUserId === req.dbUser.id);

      if (requiredAccess === 'owner' && !isOwner) {
        return res.status(403).json({ code: 'FORBIDDEN', error: 'Only the project owner can perform this action' });
      }

      if (requiredAccess === 'adviser' && !isAdviser) {
        return res.status(403).json({ code: 'FORBIDDEN', error: 'Only an active project adviser can perform this action' });
      }

      if (requiredAccess === 'member' && !isOwner && !isMember) {
        return res.status(403).json({ code: 'FORBIDDEN', error: 'Only project members can perform this action' });
      }

      if (requiredAccess === 'any' && !isOwner && !isMember && !isAdviser) {
        return res.status(403).json({ code: 'FORBIDDEN', error: 'You do not have access to this project' });
      }

      req.project = project;
      req.projectPermissions = { isOwner, isMember, isAdviser };
      next();
    } catch (err) {
      console.error('Error verifying project access:', err);
      return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to verify project access' });
    }
  };
}

/**
 * Query helper returning a tenant filter for Prisma queries.
 * For Admins: returns {} (no filter).
 * For Non-Admins: returns { tenantId: user.tenantId }.
 * Throws if a non-admin has no tenantId.
 */
function tenantScope(user) {
  if (!user) {
    throw new Error('tenantScope requires a valid user object');
  }

  if (user.role?.name === 'Admin') {
    return {};
  }

  if (!user.tenantId) {
    throw new Error(`Non-admin user ${user.id} has no assigned tenantId`);
  }

  return { tenantId: user.tenantId };
}

/**
 * Standardized audit logging helper writing to the immutable PostgreSQL AuditLog table.
 */
async function auditLog({ actorId, actorRole, tenantId, action, resource, before, after, ip }) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        actorRole: actorRole || 'System',
        tenantId: tenantId || null,
        action,
        resource: resource || null,
        before: before || undefined,
        after: after || undefined,
        ip: ip || '127.0.0.1',
      },
    });
  } catch (err) {
    console.warn(`AuditLog creation failed for action [${action}]:`, err.message);
    return null;
  }
}

module.exports = {
  requireRole,
  requireSameTenant,
  requireProjectAccess,
  tenantScope,
  auditLog,
};
