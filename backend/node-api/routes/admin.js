const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../utils/db');

const router = express.Router();

/**
 * @route GET /api/admin/whitelist
 * @desc Get all faculty whitelist entries
 */
router.get('/whitelist', requireAuth, async (req, res) => {
  try {
    const whitelist = await prisma.facultyWhitelist.findMany({
      orderBy: { invitedAt: 'desc' }
    });
    return res.json({ whitelist });
  } catch (error) {
    console.error('Error fetching whitelist:', error);
    return res.status(500).json({ error: 'Failed to fetch whitelist' });
  }
});

/**
 * @route POST /api/admin/whitelist
 * @desc Add a new faculty member to the whitelist
 */
router.post('/whitelist', requireAuth, async (req, res) => {
  const { email, institution, department } = req.body;
  if (!email || !institution) {
    return res.status(400).json({ error: 'Email and institution are required.' });
  }

  try {
    const existing = await prisma.facultyWhitelist.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Email already whitelisted.' });
    }

    const newEntry = await prisma.facultyWhitelist.create({
      data: {
        email: email.toLowerCase(),
        institution,
        department,
        whitelistedBy: 'System Administrator', // Ideally derived from req.user
      }
    });
    
    return res.status(201).json({ message: 'Added to whitelist', entry: newEntry });
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    return res.status(500).json({ error: 'Failed to add to whitelist' });
  }
});

/**
 * @route DELETE /api/admin/whitelist/:id
 * @desc Revoke/delete a whitelist entry
 */
router.delete('/whitelist/:id', requireAuth, async (req, res) => {
  try {
    await prisma.facultyWhitelist.delete({
      where: { id: req.params.id }
    });
    return res.json({ message: 'Whitelist entry revoked.' });
  } catch (error) {
    console.error('Error revoking whitelist:', error);
    return res.status(500).json({ error: 'Failed to revoke whitelist' });
  }
});

module.exports = router;
