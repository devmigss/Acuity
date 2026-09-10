/**
 * Acuity — Centralized System Administrator Store (Zustand)
 *
 * Single source of truth for platform users, faculty whitelist roster,
 * and admin activity logs.
 *
 * Persists mock changes across navigation using localStorage ('acuity_mock_admin_data').
 * Synchronizes user lifecycle events (creation, role edits, deactivation, deletion)
 * with the mock authentication accounts store ('acuity_mock_accounts').
 */

import { create } from 'zustand'
import { ROLES } from '@/constants/roles'

const ADMIN_STORAGE_KEY = 'acuity_mock_admin_data'
const MOCK_ACCOUNTS_KEY = 'acuity_mock_accounts'

/* ══════════════════════════════════════════════════════════════
   Role Label Mapping
   ══════════════════════════════════════════════════════════════ */
export const ROLE_LABELS = {
  [ROLES.STUDENT]: 'Student',
  [ROLES.FACULTY]: 'Faculty Adviser',
  [ROLES.SYSTEMADMIN]: 'System Admin',
}

/* ══════════════════════════════════════════════════════════════
   Seed Platform Users
   ══════════════════════════════════════════════════════════════ */
const SEED_USERS = [
  {
    id: 'u-admin-01',
    name: 'System Administrator',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@acuity.app',
    role: ROLES.SYSTEMADMIN,
    roleLabel: 'System Admin',
    institution: 'University of Santo Tomas · CICS',
    status: 'Active',
    createdAt: '2026-06-01T08:00:00Z',
    lastActive: '2026-09-01T12:00:00Z',
  },
  {
    id: 'u-faculty-01',
    name: 'Prof. Cruz',
    firstName: 'Prof.',
    lastName: 'Cruz',
    email: 'faculty@adviser.acuity.app',
    role: ROLES.FACULTY,
    roleLabel: 'Faculty Adviser',
    institution: 'University of Santo Tomas · Department of Biological Sciences',
    status: 'Active',
    createdAt: '2026-06-15T09:30:00Z',
    lastActive: '2026-08-30T14:20:00Z',
  },
  {
    id: 'u-faculty-02',
    name: 'Dr. Maria Santos',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@ust.edu.ph',
    role: ROLES.FACULTY,
    roleLabel: 'Faculty Adviser',
    institution: 'University of Santo Tomas · Department of Biological Sciences',
    status: 'Active',
    createdAt: '2026-07-01T10:00:00Z',
    lastActive: '2026-08-28T16:45:00Z',
  },
  {
    id: 'u-student-01',
    name: 'Alex Rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'student@labgroup.acuity.app',
    role: ROLES.STUDENT,
    roleLabel: 'Student',
    institution: 'University of Santo Tomas · Department of Biological Sciences',
    status: 'Active',
    createdAt: '2026-07-15T08:00:00Z',
    lastActive: '2026-08-29T14:30:00Z',
  },
  {
    id: 'u-student-02',
    name: 'Carlos Tan',
    firstName: 'Carlos',
    lastName: 'Tan',
    email: 'carlos.tan@labgroup.acuity.app',
    role: ROLES.STUDENT,
    roleLabel: 'Student',
    institution: 'University of Santo Tomas · Department of Biological Sciences',
    status: 'Active',
    createdAt: '2026-07-16T11:20:00Z',
    lastActive: '2026-08-28T11:20:00Z',
  },
  {
    id: 'u-student-03',
    name: 'Maya Reyes',
    firstName: 'Maya',
    lastName: 'Reyes',
    email: 'maya.reyes@labgroup.acuity.app',
    role: ROLES.STUDENT,
    roleLabel: 'Student',
    institution: 'University of Santo Tomas · Department of Biological Sciences',
    status: 'Active',
    createdAt: '2026-07-18T14:00:00Z',
    lastActive: '2026-08-27T16:45:00Z',
  },
  {
    id: 'u-student-04',
    name: 'Sarah Gomez',
    firstName: 'Sarah',
    lastName: 'Gomez',
    email: 'sarah.gomez@labgroup.acuity.app',
    role: ROLES.STUDENT,
    roleLabel: 'Student',
    institution: 'University of Santo Tomas · Department of Biological Sciences',
    status: 'Active',
    createdAt: '2026-06-20T10:00:00Z',
    lastActive: '2026-08-22T11:00:00Z',
  },
  {
    id: 'u-student-05',
    name: 'Jamie Chen',
    firstName: 'Jamie',
    lastName: 'Chen',
    email: 'jamie.chen@labgroup.acuity.app',
    role: ROLES.STUDENT,
    roleLabel: 'Student',
    institution: 'De La Salle University · Department of Biology',
    status: 'Active',
    createdAt: '2026-07-01T09:00:00Z',
    lastActive: '2026-08-26T10:00:00Z',
  },
  {
    id: 'u-student-06',
    name: 'Rafael Aquino',
    firstName: 'Rafael',
    lastName: 'Aquino',
    email: 'rafael.aquino@labgroup.acuity.app',
    role: ROLES.STUDENT,
    roleLabel: 'Student',
    institution: 'University of Santo Tomas · Department of Biological Sciences',
    status: 'Deactivated',
    createdAt: '2026-06-25T13:10:00Z',
    lastActive: '2026-08-21T15:10:00Z',
  },
]

/* ══════════════════════════════════════════════════════════════
   Seed Faculty Whitelist
   ══════════════════════════════════════════════════════════════ */
const SEED_WHITELIST = [
  {
    id: 'wl-01',
    email: 'faculty@adviser.acuity.app',
    institution: 'University of Santo Tomas',
    department: 'Department of Biological Sciences · Lab 402',
    status: 'Claimed', // 'Claimed' | 'Invitation Sent'
    invitedAt: '2026-06-15T08:00:00Z',
    claimedAt: '2026-06-15T09:30:00Z',
    whitelistedBy: 'System Administrator',
  },
  {
    id: 'wl-02',
    email: 'maria.santos@ust.edu.ph',
    institution: 'University of Santo Tomas',
    department: 'Department of Biological Sciences · Room 215',
    status: 'Claimed',
    invitedAt: '2026-07-01T08:00:00Z',
    claimedAt: '2026-07-01T10:00:00Z',
    whitelistedBy: 'System Administrator',
  },
  {
    id: 'wl-03',
    email: 'j.reyes@dlsu.edu.ph',
    institution: 'De La Salle University',
    department: 'Biology Research Wing · Cell & Tissue Lab',
    status: 'Invitation Sent',
    invitedAt: '2026-08-25T14:30:00Z',
    claimedAt: null,
    whitelistedBy: 'System Administrator',
  },
  {
    id: 'wl-04',
    email: 'e.valdez@upm.edu.ph',
    institution: 'University of the Philippines Manila',
    department: 'College of Public Health · Microbiology Wing',
    status: 'Invitation Sent',
    invitedAt: '2026-08-28T11:15:00Z',
    claimedAt: null,
    whitelistedBy: 'System Administrator',
  },
]

/* ══════════════════════════════════════════════════════════════
   Seed Admin Activities
   ══════════════════════════════════════════════════════════════ */
const SEED_ACTIVITIES = [
  {
    id: 'act-01',
    timestamp: '2026-08-28T11:15:00Z',
    actor: 'System Administrator',
    action: 'WHITELIST_INVITE',
    details: 'Pre-approved faculty invitation sent to e.valdez@upm.edu.ph (UP Manila)',
  },
  {
    id: 'act-02',
    timestamp: '2026-08-25T14:30:00Z',
    actor: 'System Administrator',
    action: 'WHITELIST_INVITE',
    details: 'Pre-approved faculty invitation sent to j.reyes@dlsu.edu.ph (DLSU)',
  },
  {
    id: 'act-03',
    timestamp: '2026-08-21T15:15:00Z',
    actor: 'System Administrator',
    action: 'USER_DEACTIVATE',
    details: 'Deactivated account for Rafael Aquino (rafael.aquino@labgroup.acuity.app)',
  },
  {
    id: 'act-04',
    timestamp: '2026-07-15T08:00:00Z',
    actor: 'System Administrator',
    action: 'USER_PROVISION',
    details: 'Provisioned student account for Alex Rivera (student@labgroup.acuity.app)',
  },
]

/* ══════════════════════════════════════════════════════════════
   Seed System Announcements
   ══════════════════════════════════════════════════════════════ */
export const SEED_ANNOUNCEMENTS = [
  {
    id: 'ann-01',
    title: 'Scheduled Server Optimization',
    alertType: 'Maintenance',
    message: 'Backend AI inference queue updates scheduled for Saturday, 02:00 AM UTC. Direct-to-S3 uploads will remain unaffected.',
    startDate: '2026-08-30',
    expirationDate: '2026-09-05',
    audience: 'All Users',
    status: 'Active',
    createdAt: '2026-08-30T08:00:00Z',
    updatedAt: '2026-08-30T08:00:00Z',
  },
  {
    id: 'ann-02',
    title: 'New Spatial Calibration Model Released',
    alertType: 'Info',
    message: 'SOD-YOLOv8 v2.1 is now active across all institutions with improved circular ROI detection on 90mm dishes.',
    startDate: '2026-09-01',
    expirationDate: '2026-09-15',
    audience: 'Faculty Only',
    status: 'Active',
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'ann-03',
    title: 'Upcoming Database Migration Window',
    alertType: 'System Alert',
    message: 'PostgreSQL RDS maintenance window scheduled for Sunday from 01:00 AM to 03:00 AM UTC. Canvas saves may experience brief delays.',
    startDate: '2026-09-12',
    expirationDate: '2026-09-13',
    audience: 'Students Only',
    status: 'Scheduled',
    createdAt: '2026-09-02T10:30:00Z',
    updatedAt: '2026-09-02T10:30:00Z',
  },
  {
    id: 'ann-04',
    title: 'Semester Break Archive Notice',
    alertType: 'Info',
    message: 'Archived project freeze period completed for Academic Term 2025-2026.',
    startDate: '2026-06-01',
    expirationDate: '2026-06-30',
    audience: 'All Users',
    status: 'Archived',
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-30T23:59:59Z',
  },
]

/* ══════════════════════════════════════════════════════════════
   Seed Public Page Content (Figure 3.41)
   ══════════════════════════════════════════════════════════════ */
export const SEED_PUBLIC_CONTENT = {
  landing: {
    headline: 'Colony counting, without the eye strain.',
    subtitle: 'Acuity automates CFU detection and measurement on Petri dish photos, so biology thesis groups spend less time tallying and more time analyzing.',
    metrics: '80%+ Target detection F1 | 40–70 Fine-tuning images | 1-click CSV export',
    heroGraphicUrl: '',
  },
  about: {
    headline: 'Smarter colony counting for better research.',
    mission: 'Acuity is a web-based computer vision platform engineered to assist biology students, thesis researchers, and laboratory groups with automated Colony Forming Unit (CFU) detection, spatial calibration, morphological measurement, and academic verification.',
    challengeTitle: 'Why Manual Colony Counting Falls Short',
    previewGraphicUrl: '',
  },
  login: {
    tagline: 'Colony counting, without the eye strain.',
    stats: '85%+ Target detection F1 · 40-70 Fine-tuning images · 1-click CSV export',
    brandGraphicUrl: '',
  },
}

/* ══════════════════════════════════════════════════════════════
   Seed Institutional Documentation Repository
   ══════════════════════════════════════════════════════════════ */
export const SEED_DOCUMENTS = [
  {
    id: 'doc-01',
    title: 'Microservice Architecture Guide',
    category: 'Technical Reference',
    format: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2026-08-20',
    description: 'Overview of Node.js Express primary API, Python FastAPI computer vision worker, Redis task queue, and PostgreSQL RDS tenant isolation.',
    status: 'Active',
    fileUrl: '/docs/architecture_guide.pdf',
  },
  {
    id: 'doc-02',
    title: 'Spatial Calibration & ROI Extraction',
    category: 'Technical Reference',
    format: 'Markdown',
    size: '420 KB',
    uploadedAt: '2026-08-24',
    description: 'Hough circle transform algorithms, standard 90mm Petri dish pixel-to-millimeter ratio derivation, and circular mask generation.',
    status: 'Active',
    fileUrl: '/docs/spatial_calibration.md',
  },
  {
    id: 'doc-03',
    title: 'Student & Faculty Onboarding Playbook',
    category: 'Getting Started',
    format: 'PDF',
    size: '1.8 MB',
    uploadedAt: '2026-08-28',
    description: 'Step-by-step guidance for biological thesis cohorts on registering, batch uploading petri dish plates, and submitting for adviser review.',
    status: 'Active',
    fileUrl: '/docs/onboarding_playbook.pdf',
  },
  {
    id: 'doc-04',
    title: 'Institutional Research Data Governance & Privacy',
    category: 'Policies',
    format: 'PDF',
    size: '950 KB',
    uploadedAt: '2026-07-15',
    description: 'Multi-tenant isolation policies, FERPA/institutional compliance, and permanent data freeze protocols for validated macroscopic colony counts.',
    status: 'Active',
    fileUrl: '/docs/data_governance.pdf',
  },
  {
    id: 'doc-05',
    title: 'AI Baseline Validation Guidelines',
    category: 'Technical Reference',
    format: 'Markdown',
    size: '310 KB',
    uploadedAt: '2026-08-01',
    description: 'SOD-YOLOv8 microservice confidence thresholds, human-in-the-loop colony annotation audit standards, and error margin formulas.',
    status: 'Active',
    fileUrl: '/docs/ai_validation.md',
  },
]

/* ══════════════════════════════════════════════════════════════
   Storage Helpers
   ══════════════════════════════════════════════════════════════ */
function loadAdminData() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        users: parsed.users || SEED_USERS,
        facultyWhitelist: parsed.facultyWhitelist || SEED_WHITELIST,
        adminActivities: parsed.adminActivities || SEED_ACTIVITIES,
        announcements: parsed.announcements || SEED_ANNOUNCEMENTS,
        publicContent: parsed.publicContent ? {
          landing: { ...SEED_PUBLIC_CONTENT.landing, ...(parsed.publicContent.landing || {}) },
          about: { ...SEED_PUBLIC_CONTENT.about, ...(parsed.publicContent.about || {}) },
          login: { ...SEED_PUBLIC_CONTENT.login, ...(parsed.publicContent.login || {}) },
        } : SEED_PUBLIC_CONTENT,
        documents: parsed.documents || SEED_DOCUMENTS,
      }
    }
  } catch {
    // Fall back to seed
  }
  return {
    users: SEED_USERS,
    facultyWhitelist: SEED_WHITELIST,
    adminActivities: SEED_ACTIVITIES,
    announcements: SEED_ANNOUNCEMENTS,
    publicContent: SEED_PUBLIC_CONTENT,
    documents: SEED_DOCUMENTS,
  }
}

function saveAdminData(data) {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    const existing = raw ? JSON.parse(raw) : {}
    const merged = { ...existing, ...data }
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Synchronizes user state with auth accounts in localStorage
 */
function syncWithAuthAccounts(user, action = 'update') {
  try {
    const raw = localStorage.getItem(MOCK_ACCOUNTS_KEY)
    let accounts = raw ? JSON.parse(raw) : []

    const userEmail = (user.email || '').toLowerCase().trim()
    const index = accounts.findIndex((acc) => acc.email?.toLowerCase() === userEmail)

    if (action === 'delete') {
      accounts = accounts.filter((acc) => acc.email?.toLowerCase() !== userEmail)
    } else if (action === 'add') {
      if (index === -1) {
        accounts.push({
          id: user.id,
          username: userEmail.split('@')[0],
          displayName: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: userEmail,
          password: user.role, // Default dev password matching role
          role: user.role,
          title: user.roleLabel,
          tenant: user.institution,
          authProvider: 'native',
          verified: true,
          deactivated: user.status === 'Deactivated',
          createdAt: user.createdAt,
        })
      }
    } else if (index !== -1) {
      accounts[index] = {
        ...accounts[index],
        displayName: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        title: user.roleLabel,
        tenant: user.institution,
        deactivated: user.status === 'Deactivated',
      }
    }

    localStorage.setItem(MOCK_ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // Ignore sync errors
  }
}

/* ══════════════════════════════════════════════════════════════
   Zustand Store
   ══════════════════════════════════════════════════════════════ */
const initialData = loadAdminData()

let _userCounter = 100
let _wlCounter = 100
let _actCounter = 100

export const useAdminStore = create((set, get) => ({
  users: initialData.users,
  platformUsers: initialData.users,
  facultyWhitelist: initialData.facultyWhitelist,
  adminActivities: initialData.adminActivities,
  announcements: initialData.announcements,
  publicContent: initialData.publicContent,
  documents: initialData.documents,

  /* ── Getters ── */
  getUser: (id) => get().users.find((u) => u.id === id) || null,

  getUserByEmail: (email) => {
    const clean = (email || '').toLowerCase().trim()
    return get().users.find((u) => u.email.toLowerCase() === clean) || null
  },

  isEmailWhitelisted: (email) => {
    const clean = (email || '').toLowerCase().trim()
    return get().facultyWhitelist.some((wl) => wl.email.toLowerCase() === clean)
  },

  getStats: () => {
    const users = get().users
    const whitelist = get().facultyWhitelist

    const institutions = new Set(users.map((u) => u.institution).filter(Boolean))
    whitelist.forEach((wl) => {
      if (wl.institution) institutions.add(wl.institution)
    })

    return {
      totalUsers: users.length,
      studentCount: users.filter((u) => u.role === ROLES.STUDENT).length,
      facultyCount: users.filter((u) => u.role === ROLES.FACULTY).length,
      adminCount: users.filter((u) => u.role === ROLES.SYSTEMADMIN || u.role === ROLES.ADMIN).length,
      activeUsers: users.filter((u) => u.status === 'Active').length,
      deactivatedUsers: users.filter((u) => u.status === 'Deactivated').length,
      totalWhitelisted: whitelist.length,
      claimedWhitelisted: whitelist.filter((w) => w.status === 'Claimed').length,
      pendingWhitelisted: whitelist.filter((w) => w.status === 'Invitation Sent').length,
      activeTenantsCount: institutions.size,
    }
  },

  /* ── User Actions ── */
  addUser: (userData) => {
    const { name, firstName, lastName, email, role, institution, tenant, labGroup, id } = userData
    const trimmedEmail = (email || '').trim().toLowerCase()

    // Validate duplicate email in directory
    const existing = get().users.find((u) => u.email.toLowerCase() === trimmedEmail)
    if (existing) {
      throw new Error(`User with email ${trimmedEmail} already exists in directory.`)
    }

    const constructedName = (name || `${firstName || ''} ${lastName || ''}`).trim()
    const roleKeyMap = {
      Student: ROLES.STUDENT,
      'Faculty Adviser': ROLES.FACULTY,
      'System Admin': ROLES.SYSTEMADMIN,
      student: ROLES.STUDENT,
      faculty: ROLES.FACULTY,
      systemadmin: ROLES.SYSTEMADMIN,
    }
    const roleKey = roleKeyMap[role] || ROLES.STUDENT
    const roleLabel = ROLE_LABELS[roleKey] || (role === 'Student' || role === 'Faculty Adviser' || role === 'System Admin' ? role : 'Student')
    const tenantValue = tenant || institution || 'University of Santo Tomas (UST)'

    const newUser = {
      id: id || `usr_${Date.now()}_${_userCounter++}`,
      name: constructedName,
      firstName: firstName || constructedName.split(' ')[0] || '',
      lastName: lastName || constructedName.split(' ').slice(1).join(' ') || '',
      email: trimmedEmail,
      role: roleKey,
      roleLabel,
      tenant: tenantValue,
      institution: tenantValue,
      labGroup: (role === 'Student' || roleKey === ROLES.STUDENT) ? labGroup : undefined,
      status: 'Active',
      createdAt: userData.createdAt || new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }

    const updatedUsers = [newUser, ...get().users]

    // Record activity
    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'USER_PROVISION',
      details: `Provisioned ${roleLabel} account for ${constructedName} (${trimmedEmail}) at ${tenantValue}`,
    }

    set({
      users: updatedUsers,
      platformUsers: updatedUsers,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      users: updatedUsers,
      facultyWhitelist: get().facultyWhitelist,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    syncWithAuthAccounts(newUser, 'add')
    return newUser
  },

  updateUser: (id, updates) => {
    const users = get().users
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return null

    const current = users[index]
    const updatedRole = updates.role || current.role
    const updatedRoleLabel = ROLE_LABELS[updatedRole] || current.roleLabel

    const updated = {
      ...current,
      ...updates,
      role: updatedRole,
      roleLabel: updatedRoleLabel,
      name: updates.name || current.name,
    }

    const updatedUsers = [...users]
    updatedUsers[index] = updated

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'USER_UPDATE',
      details: `Updated permissions/profile for ${updated.name} (${updated.email})`,
    }

    set({
      users: updatedUsers,
      platformUsers: updatedUsers,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      users: updatedUsers,
      facultyWhitelist: get().facultyWhitelist,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    syncWithAuthAccounts(updated, 'update')
    return updated
  },

  deactivateUser: (id) => {
    return get().updateUser(id, { status: 'Deactivated' })
  },

  reactivateUser: (id) => {
    return get().updateUser(id, { status: 'Active' })
  },

  deleteUser: (id, currentAdminEmail = 'admin@acuity.app') => {
    const user = get().getUser(id)
    if (!user) return false

    // Prevent deleting self
    if (user.email.toLowerCase() === currentAdminEmail.toLowerCase()) {
      throw new Error('You cannot delete your own active administrator account.')
    }

    const updatedUsers = get().users.filter((u) => u.id !== id)

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'USER_DELETE',
      details: `Deleted user record for ${user.name} (${user.email})`,
    }

    set({
      users: updatedUsers,
      platformUsers: updatedUsers,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      users: updatedUsers,
      facultyWhitelist: get().facultyWhitelist,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    syncWithAuthAccounts(user, 'delete')
    return true
  },

  /* ── Faculty Whitelist Actions ── */
  addFacultyWhitelist: ({ email, institution, department, invitedBy = 'System Administrator' }) => {
    const trimmedEmail = (email || '').trim().toLowerCase()

    if (!trimmedEmail) {
      throw new Error('Faculty email is required.')
    }

    // Check duplicate
    if (get().isEmailWhitelisted(trimmedEmail)) {
      throw new Error('Email already whitelisted.')
    }

    // Check if user already exists as registered faculty
    const existingUser = get().getUserByEmail(trimmedEmail)
    const isAlreadyRegistered = Boolean(existingUser && existingUser.role === ROLES.FACULTY)

    const newEntry = {
      id: `wl-${Date.now()}-${_wlCounter++}`,
      email: trimmedEmail,
      institution: (institution || 'University of Santo Tomas').trim(),
      department: (department || 'Department of Biological Sciences').trim(),
      status: isAlreadyRegistered ? 'Claimed' : 'Invitation Sent',
      invitedAt: new Date().toISOString(),
      claimedAt: isAlreadyRegistered ? new Date().toISOString() : null,
      whitelistedBy: invitedBy,
    }

    const updatedWhitelist = [newEntry, ...get().facultyWhitelist]

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: invitedBy,
      action: 'WHITELIST_INVITE',
      details: `Pre-approved faculty invitation sent to ${trimmedEmail} (${newEntry.institution})`,
    }

    set({
      facultyWhitelist: updatedWhitelist,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      users: get().users,
      facultyWhitelist: updatedWhitelist,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return newEntry
  },

  updateWhitelistEntry: (id, updates) => {
    const list = get().facultyWhitelist
    const index = list.findIndex((w) => w.id === id)
    if (index === -1) return null

    const current = list[index]
    const updated = { ...current, ...updates }

    const updatedList = [...list]
    updatedList[index] = updated

    set({ facultyWhitelist: updatedList })

    saveAdminData({
      users: get().users,
      facultyWhitelist: updatedList,
      adminActivities: get().adminActivities,
    })

    return updated
  },

  resendWhitelistInvitation: (id) => {
    const entry = get().facultyWhitelist.find((w) => w.id === id)
    if (!entry) return false

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'WHITELIST_RESEND',
      details: `Resent faculty onboarding invitation to ${entry.email}`,
    }

    set({
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      users: get().users,
      facultyWhitelist: get().facultyWhitelist,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return true
  },

  revokeWhitelistEntry: (id) => {
    const entry = get().facultyWhitelist.find((w) => w.id === id)
    if (!entry) return false

    const updatedList = get().facultyWhitelist.filter((w) => w.id !== id)

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'WHITELIST_REVOKE',
      details: `Revoked faculty authorization for ${entry.email}`,
    }

    set({
      facultyWhitelist: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      users: get().users,
      facultyWhitelist: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return true
  },

  /* ══════════════════════════════════════════════════════════════
     System Announcements Actions
     ══════════════════════════════════════════════════════════════ */
  addAnnouncement: (announcementData, status = 'Active') => {
    const newId = `ann-${Date.now()}`
    const now = new Date().toISOString()
    const newAnnouncement = {
      id: newId,
      title: announcementData.title || 'Untitled Notice',
      alertType: announcementData.alertType || 'Info',
      message: announcementData.message || '',
      startDate: announcementData.startDate || now.split('T')[0],
      expirationDate: announcementData.expirationDate || '',
      audience: announcementData.audience || 'All Users',
      status: status, // 'Active' | 'Scheduled'
      createdAt: now,
      updatedAt: now,
    }

    const updatedAnnouncements = [newAnnouncement, ...get().announcements]

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: now,
      actor: 'System Administrator',
      action: status === 'Scheduled' ? 'ANNOUNCEMENT_SCHEDULE' : 'ANNOUNCEMENT_PUBLISH',
      details: `${status === 'Scheduled' ? 'Scheduled' : 'Broadcasted'} platform notice "${newAnnouncement.title}" [${newAnnouncement.alertType}]`,
    }

    set({
      announcements: updatedAnnouncements,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      announcements: updatedAnnouncements,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return newAnnouncement
  },

  updateAnnouncement: (id, updates) => {
    const list = get().announcements
    const index = list.findIndex((a) => a.id === id)
    if (index === -1) return null

    const current = list[index]
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    const updatedList = [...list]
    updatedList[index] = updated

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'ANNOUNCEMENT_UPDATE',
      details: `Updated platform notice "${updated.title}"`,
    }

    set({
      announcements: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      announcements: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return updated
  },

  archiveAnnouncement: (id) => {
    const list = get().announcements
    const target = list.find((a) => a.id === id)
    if (!target) return false

    const updatedList = list.map((a) =>
      a.id === id
        ? { ...a, status: 'Archived', updatedAt: new Date().toISOString() }
        : a
    )

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'ANNOUNCEMENT_ARCHIVE',
      details: `Archived platform notice "${target.title}"`,
    }

    set({
      announcements: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      announcements: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return true
  },

  restoreAnnouncement: (id) => {
    const list = get().announcements
    const target = list.find((a) => a.id === id)
    if (!target) return false

    const todayStr = new Date().toISOString().split('T')[0]
    const newStatus = target.startDate && target.startDate > todayStr ? 'Scheduled' : 'Active'

    const updatedList = list.map((a) =>
      a.id === id
        ? { ...a, status: newStatus, updatedAt: new Date().toISOString() }
        : a
    )

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'ANNOUNCEMENT_RESTORE',
      details: `Restored platform notice "${target.title}" to ${newStatus}`,
    }

    set({
      announcements: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      announcements: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return true
  },

  /* ══════════════════════════════════════════════════════════════
     Public Page Content Actions (Figure 3.41)
     ══════════════════════════════════════════════════════════════ */
  updatePublicContent: (pageKey, newContent) => {
    const current = get().publicContent || SEED_PUBLIC_CONTENT
    const updatedPage = {
      ...(current[pageKey] || {}),
      ...newContent,
    }

    const updatedPublicContent = {
      ...current,
      [pageKey]: updatedPage,
    }

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'PUBLIC_LAYOUT_UPDATE',
      details: `Updated public content configuration for ${pageKey} page`,
    }

    set({
      publicContent: updatedPublicContent,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      publicContent: updatedPublicContent,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return updatedPage
  },

  resetPublicContent: (pageKey) => {
    const current = get().publicContent || SEED_PUBLIC_CONTENT
    const resetPage = SEED_PUBLIC_CONTENT[pageKey] || {}

    const updatedPublicContent = {
      ...current,
      [pageKey]: resetPage,
    }

    set({
      publicContent: updatedPublicContent,
    })

    saveAdminData({
      publicContent: updatedPublicContent,
    })

    return resetPage
  },

  /* ══════════════════════════════════════════════════════════════
     Institutional Documentation Actions
     ══════════════════════════════════════════════════════════════ */
  addDocument: (docData) => {
    const newId = `doc-${Date.now()}`
    const today = new Date().toISOString().split('T')[0]
    const newDoc = {
      id: newId,
      title: docData.title || 'Untitled Document',
      category: docData.category || 'Technical Reference',
      format: docData.format || 'PDF',
      size: docData.size || '1.2 MB',
      uploadedAt: today,
      description: docData.description || '',
      status: 'Active',
      fileUrl: docData.fileUrl || `/docs/${newId}.pdf`,
    }

    const updatedDocs = [newDoc, ...get().documents]

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'DOCUMENT_UPLOAD',
      details: `Uploaded repository document "${newDoc.title}" [${newDoc.format}]`,
    }

    set({
      documents: updatedDocs,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      documents: updatedDocs,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return newDoc
  },

  updateDocument: (id, updates) => {
    const list = get().documents
    const index = list.findIndex((d) => d.id === id)
    if (index === -1) return null

    const current = list[index]
    const updated = {
      ...current,
      ...updates,
    }

    const updatedList = [...list]
    updatedList[index] = updated

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'DOCUMENT_UPDATE',
      details: `Updated metadata for document "${updated.title}"`,
    }

    set({
      documents: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      documents: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return updated
  },

  archiveDocument: (id) => {
    const list = get().documents
    const target = list.find((d) => d.id === id)
    if (!target) return false

    const updatedList = list.map((d) =>
      d.id === id ? { ...d, status: 'Archived' } : d
    )

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'DOCUMENT_ARCHIVE',
      details: `Archived repository document "${target.title}"`,
    }

    set({
      documents: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      documents: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return true
  },

  restoreDocument: (id) => {
    const list = get().documents
    const target = list.find((d) => d.id === id)
    if (!target) return false

    const updatedList = list.map((d) =>
      d.id === id ? { ...d, status: 'Active' } : d
    )

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'DOCUMENT_RESTORE',
      details: `Restored repository document "${target.title}"`,
    }

    set({
      documents: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      documents: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return true
  },

  deleteDocument: (id) => {
    const list = get().documents
    const target = list.find((d) => d.id === id)
    if (!target) return false

    const updatedList = list.filter((d) => d.id !== id)

    const newActivity = {
      id: `act-${Date.now()}-${_actCounter++}`,
      timestamp: new Date().toISOString(),
      actor: 'System Administrator',
      action: 'DOCUMENT_DELETE',
      details: `Permanently removed document "${target.title}"`,
    }

    set({
      documents: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    saveAdminData({
      documents: updatedList,
      adminActivities: [newActivity, ...get().adminActivities],
    })

    return true
  },
}))
