const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../utils/db');
const { generateProjectCode } = require('../utils/nanoid'); // TODO(Part 2)

const router = express.Router();

/**
 * @route POST /api/projects
 * @desc Create a new research project
 */
router.post('/', requireAuth, async (req, res) => {
  const { name, description } = req.body;
  const cognitoId = req.user.sub;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { cognitoId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // TODO(Part 2): Full project creation rewrite and nanoid validation
    const project = await prisma.project.create({
      data: {
        name,
        description,
        code: generateProjectCode(),
        ownerId: user.id,
        tenantId: user.tenantId,
      }
    });

    return res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * @route GET /api/projects
 * @desc Get all projects for the current user (owned or member)
 */
router.get('/', requireAuth, async (req, res) => {
  const cognitoId = req.user.sub;

  try {
    const user = await prisma.user.findUnique({ where: { cognitoId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const projects = await prisma.project.findMany({
      where: {
        tenantId: user.tenantId,
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * @route GET /api/projects/:id
 * @desc Get a specific project
 */
router.get('/:id', requireAuth, async (req, res) => {
  const cognitoId = req.user.sub;
  const projectId = req.params.id;

  try {
    const user = await prisma.user.findUnique({ where: { cognitoId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: user.tenantId,
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } }
      }
    });

    if (!project) return res.status(404).json({ error: 'Project not found or unauthorized' });

    return res.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * @route POST /api/projects/:id/members
 * @desc Add a collaborator to the project
 */
router.post('/:id/members', requireAuth, async (req, res) => {
  const cognitoId = req.user.sub;
  const projectId = req.params.id;
  const { email, permissionLevel } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const owner = await prisma.user.findUnique({ where: { cognitoId } });
    
    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: owner.id }
    });

    if (!project) return res.status(403).json({ error: 'Only the project owner can add members' });

    // Find the user to add by email (must be in the same tenant)
    const targetUser = await prisma.user.findFirst({
      where: { email, tenantId: owner.tenantId }
    });

    if (!targetUser) return res.status(404).json({ error: 'User not found in your tenant' });
    if (targetUser.id === owner.id) return res.status(400).json({ error: 'Cannot add yourself as a member' });

    // Add them to the project
    const member = await prisma.projectMember.upsert({
      where: {
        projectId_userId: { projectId, userId: targetUser.id }
      },
      update: {
        permissionLevel: permissionLevel || 'VIEWER'
      },
      create: {
        projectId,
        userId: targetUser.id,
        permissionLevel: permissionLevel || 'VIEWER'
      }
    });

    return res.status(201).json({ message: 'Collaborator added', member });
  } catch (error) {
    console.error('Error adding member:', error);
    return res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

module.exports = router;
