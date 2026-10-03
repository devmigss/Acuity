const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { tenantScope, auditLog } = require('../middleware/rbac');
const { prisma } = require('../utils/db');
const { generateProjectCode } = require('../utils/nanoid');

const router = express.Router();

/**
 * @route POST /api/projects
 * @desc Create a new research project
 * @access Private
 */
router.post('/', requireAuth, async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ code: 'BAD_REQUEST', error: 'Project name is required' });
  }

  const user = req.dbUser;

  try {
    const code = generateProjectCode();

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        code,
        ownerId: user.id,
        tenantId: user.tenantId,
        status: 'DRAFT',
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await auditLog({
      actorId: user.id,
      actorRole: user.role?.name || 'Student',
      tenantId: user.tenantId,
      action: 'PROJECT_CREATED',
      resource: 'Project',
      after: { projectId: project.id, code, name: project.name },
      ip: req.ip,
    });

    return res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to create project' });
  }
});

/**
 * @route GET /api/projects
 * @desc Get all projects for current user within their tenant
 * @access Private
 */
router.get('/', requireAuth, async (req, res) => {
  const user = req.dbUser;

  try {
    const scope = tenantScope(user);

    const projects = await prisma.project.findMany({
      where: {
        ...scope,
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
          { advisers: { some: { adviserUserId: user.id, status: 'ACTIVE' } } },
        ],
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        advisers: {
          where: { status: 'ACTIVE' },
          include: {
            adviserUser: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to fetch projects' });
  }
});

/**
 * @route GET /api/projects/:id
 * @desc Get a specific project with tenant scoping
 * @access Private
 */
router.get('/:id', requireAuth, async (req, res) => {
  const user = req.dbUser;
  const projectId = req.params.id;

  try {
    const scope = tenantScope(user);

    // 1. First check tenant isolation (masks cross-tenant resources with 404)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ...scope,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        advisers: {
          include: {
            adviserUser: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!project) {
      // 404 masks cross-tenant or non-existent projects
      return res.status(404).json({ code: 'NOT_FOUND', error: 'Project not found' });
    }

    // 2. Check project membership (owner, member, active adviser, or platform admin)
    const isOwner = project.ownerId === user.id;
    const isMember = project.members.some((m) => m.userId === user.id);
    const isAdviser = project.advisers.some((a) => a.adviserUserId === user.id && a.status === 'ACTIVE');
    const isAdmin = user.role?.name === 'Admin';

    if (!isOwner && !isMember && !isAdviser && !isAdmin) {
      return res.status(403).json({ code: 'FORBIDDEN', error: 'You do not have permission to access this project' });
    }

    return res.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to fetch project' });
  }
});

/**
 * @route POST /api/projects/:id/members
 * @desc Add a collaborator to the project (must be in same tenant)
 * @access Private
 */
router.post('/:id/members', requireAuth, async (req, res) => {
  const user = req.dbUser;
  const projectId = req.params.id;
  const { email, permissionLevel } = req.body;

  if (!email) return res.status(400).json({ code: 'BAD_REQUEST', error: 'Email is required' });

  try {
    const scope = tenantScope(user);

    // Verify project exists and user is owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: user.id,
        ...scope,
      },
    });

    if (!project) {
      return res.status(403).json({ code: 'FORBIDDEN', error: 'Only the project owner can add members' });
    }

    // Find target user in same tenant
    const targetUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        ...scope,
      },
    });

    if (!targetUser) {
      return res.status(404).json({ code: 'NOT_FOUND', error: 'User not found in your educational institution' });
    }

    if (targetUser.id === user.id) {
      return res.status(400).json({ code: 'BAD_REQUEST', error: 'Cannot add yourself as a collaborator' });
    }

    const member = await prisma.projectMember.upsert({
      where: {
        projectId_userId: { projectId, userId: targetUser.id },
      },
      update: {
        permissionLevel: permissionLevel || 'EDITOR',
      },
      create: {
        projectId,
        userId: targetUser.id,
        permissionLevel: permissionLevel || 'EDITOR',
      },
    });

    await auditLog({
      actorId: user.id,
      actorRole: user.role?.name || 'Student',
      tenantId: user.tenantId,
      action: 'PROJECT_MEMBER_ADDED',
      resource: 'ProjectMember',
      after: { projectId, addedUserId: targetUser.id, permissionLevel: member.permissionLevel },
      ip: req.ip,
    });

    return res.status(201).json({ message: 'Collaborator added successfully', member });
  } catch (error) {
    console.error('Error adding member:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to add collaborator' });
  }
});

module.exports = router;
