/**
 * Acuity — Centralized Project Store (Zustand)
 *
 * Single source of truth for all project-level mock data in the Student workflow.
 * Manages: Projects, Plates, Annotations, Members, Invitations, Adviser Remarks, Activity Log.
 *
 * All Student pages read/write from this store so CRUD operations in one page
 * are immediately reflected across Dashboard, My Projects, Project Workspace,
 * Shared with Me, and Adviser Remarks.
 *
 * NOTE: This is a frontend-only mock data layer. In future phases, each action
 * will be replaced by real API calls to the FastAPI / PostgreSQL backend.
 */

import { create } from 'zustand'

/* ══════════════════════════════════════════════════════════════
   Processing status constants
   ══════════════════════════════════════════════════════════════ */
export const PLATE_STATUS = {
  UPLOADING: 'Uploading',
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'AI Analyzed',
  REVIEWED: 'Reviewed',
  PENDING_ADVISER: 'Pending Adviser',
}

export const INVITATION_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
}

export const REMARK_STATUS = {
  OPEN: 'Open',
  ADDRESSED: 'Addressed',
  RESOLVED: 'Resolved',
}

/* ══════════════════════════════════════════════════════════════
   ID generators
   ══════════════════════════════════════════════════════════════ */
let _projectIdCounter = 100
let _plateIdCounter = 100
let _invitationIdCounter = 100
let _remarkIdCounter = 100
let _activityIdCounter = 100

const genProjectId = () => `proj-${_projectIdCounter++}`
const genPlateId = () => `plate-${_plateIdCounter++}`
const genInvitationId = () => `inv-${_invitationIdCounter++}`
const genRemarkId = () => `remark-${_remarkIdCounter++}`
const genActivityId = () => `activity-${_activityIdCounter++}`

/* ══════════════════════════════════════════════════════════════
   Mock thumbnail images (Unsplash placeholders)
   ══════════════════════════════════════════════════════════════ */
const PETRI_THUMBNAILS = [
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=120&auto=format&fit=crop&q=80',
]

/* ══════════════════════════════════════════════════════════════
   Mock AI result generator
   ══════════════════════════════════════════════════════════════ */
function generateMockAIResults() {
  const colonyCount = Math.floor(Math.random() * 60) + 15
  const confidence = (Math.random() * 10 + 85).toFixed(1)
  const avgDiameter = (Math.random() * 1.5 + 1.2).toFixed(2)
  const avgArea = (Math.random() * 2 + 2.0).toFixed(2)
  return { colonyCount, confidence: `${confidence}%`, avgDiameterMm: `${avgDiameter} mm`, avgAreaMm2: `${avgArea} mm²` }
}

function generateMockAnnotations(plateId, count) {
  const annotations = []
  for (let i = 0; i < count; i++) {
    // Distribute uniformly across circular Petri dish (center: 350, 350, radius: 240)
    const angle = Math.random() * Math.PI * 2
    const dist = Math.sqrt(Math.random()) * 240
    const x = Math.round(350 + dist * Math.cos(angle))
    const y = Math.round(350 + dist * Math.sin(angle))
    annotations.push({
      id: `${plateId}-ann-${i}`,
      x,
      y,
      radius: Math.floor(Math.random() * 10) + 18,
      confidence: parseFloat((Math.random() * 0.15 + 0.82).toFixed(2)),
      source: 'ai',
      corrected: false,
      original: null,
      softDeleted: false,
      type: 'colony',
    })
  }
  return annotations
}

/* ══════════════════════════════════════════════════════════════
   Seed data — matches existing hardcoded mock data
   ══════════════════════════════════════════════════════════════ */

const SEED_ADVISEE_GROUPS = [
  {
    id: 'adv-01',
    groupName: 'Group 8 — Microbiology Cohort',
    institution: 'Department of Biological Sciences',
    laboratory: 'Microbiology Research Wing · Lab 402',
    academicYear: 'AY 2025–2026',
    topic: 'Antimicrobial Efficacy of Psidium guajava Extracts',
    leadId: 'demo-student-01',
    leadName: 'Alex Rivera',
    leadEmail: 'student@labgroup.acuity.app',
    status: 'Active',
    adviser: 'Prof. Cruz',
    members: [
      {
        id: 'mem-01',
        name: 'Alex Rivera',
        email: 'student@labgroup.acuity.app',
        role: 'Group Leader',
        isLeader: true,
        platesUploaded: 3,
        lastActive: '2026-08-29T14:30:00Z',
      },
      {
        id: 'mem-02',
        name: 'Carlos Tan',
        email: 'carlos.tan@labgroup.acuity.app',
        role: 'Research Member',
        isLeader: false,
        platesUploaded: 1,
        lastActive: '2026-08-28T11:20:00Z',
      },
      {
        id: 'mem-03',
        name: 'Maya Reyes',
        email: 'maya.reyes@labgroup.acuity.app',
        role: 'Research Member',
        isLeader: false,
        platesUploaded: 0,
        lastActive: '2026-08-27T16:45:00Z',
      },
    ],
  },
  {
    id: 'adv-02',
    groupName: 'Group 3 — Environmental Bio',
    institution: 'Department of Biological Sciences',
    laboratory: 'Environmental Bio & Water Quality Lab · Room 215',
    academicYear: 'AY 2025–2026',
    topic: 'Enumeration of Coliforms in Watershed Samples',
    leadId: 'demo-student-03',
    leadName: 'Sarah Gomez',
    leadEmail: 'sarah.gomez@labgroup.acuity.app',
    status: 'Active',
    adviser: 'Prof. Cruz',
    members: [
      {
        id: 'mem-04',
        name: 'Sarah Gomez',
        email: 'sarah.gomez@labgroup.acuity.app',
        role: 'Group Leader',
        isLeader: true,
        platesUploaded: 2,
        lastActive: '2026-08-22T11:00:00Z',
      },
      {
        id: 'mem-05',
        name: 'Rafael Aquino',
        email: 'rafael.aquino@labgroup.acuity.app',
        role: 'Research Member',
        isLeader: false,
        platesUploaded: 1,
        lastActive: '2026-08-21T15:10:00Z',
      },
      {
        id: 'mem-06',
        name: 'Lea Mendoza',
        email: 'lea.mendoza@labgroup.acuity.app',
        role: 'Research Member',
        isLeader: false,
        platesUploaded: 0,
        lastActive: '2026-08-19T09:30:00Z',
      },
    ],
  },
]

const SEED_PROJECTS = [
  {
    id: 'proj-01',
    groupId: 'adv-01',
    name: 'Antimicrobial Efficacy of Psidium guajava Extracts',
    description: 'Investigating the antimicrobial properties of guava leaf extracts against Staphylococcus aureus using colony counting and zone-of-inhibition assays.',
    organism: 'Staphylococcus aureus',
    ownerId: 'demo-student-01',
    ownerName: 'Alex Rivera',
    adviser: 'Prof. Cruz',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-29T14:30:00Z',
    status: 'Adviser Review',
  },
  {
    id: 'proj-02',
    groupId: 'adv-02',
    name: 'Enumeration of Coliforms in Watershed Samples',
    description: 'Quantifying coliform bacterial density in watershed water samples to assess public health risk.',
    organism: 'Escherichia coli',
    ownerId: 'demo-student-03',
    ownerName: 'Sarah Gomez',
    adviser: 'Prof. Cruz',
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-08-22T11:00:00Z',
    status: 'Adviser Review',
  },
  {
    id: 'proj-03',
    groupId: 'adv-01',
    name: 'Bacterial Inhibition Zone & CFU Viability Assay',
    description: 'Measuring inhibition zones and CFU viability of Pseudomonas aeruginosa exposed to various antiseptic agents.',
    organism: 'Pseudomonas aeruginosa',
    ownerId: 'demo-student-01',
    ownerName: 'Alex Rivera',
    adviser: 'Prof. Cruz',
    validatedBy: 'Prof. Cruz',
    validatedAt: '2026-08-14T16:00:00Z',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-08-14T16:00:00Z',
    status: 'Validated',
  },
  {
    id: 'proj-04',
    groupId: 'adv-01',
    name: 'Synergistic Antibacterial Activity of Guava and Citrus Extracts',
    description: 'Investigating synergistic interactions of crude leaf extracts against Gram-negative bacterial strains in disk diffusion and colony count assays.',
    organism: 'Klebsiella pneumoniae',
    ownerId: 'demo-student-01',
    ownerName: 'Alex Rivera',
    adviser: 'Prof. Cruz',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-27T16:00:00Z',
    status: 'In Progress',
  },
  {
    id: 'proj-05',
    groupId: 'adv-02',
    name: 'Microbial Contamination Index of Urban River Runoff',
    description: 'Assessing total coliform and fecal streptococci levels downstream of industrial and residential discharge points along the river basin.',
    organism: 'Coliform bacteria',
    ownerId: 'demo-student-03',
    ownerName: 'Sarah Gomez',
    adviser: 'Prof. Cruz',
    createdAt: '2026-07-10T11:00:00Z',
    updatedAt: '2026-08-25T14:00:00Z',
    status: 'Revision Required',
  },
  // A shared project owned by another student
  {
    id: 'proj-shared-01',
    groupId: null,
    name: 'Comparative Bacterial Density in Commercial Probiotics',
    description: 'Cross-laboratory comparative study of probiotic bacterial density using standardized colony counting.',
    organism: 'Lactobacillus acidophilus',
    ownerId: 'demo-student-02',
    ownerName: 'Jamie Chen',
    adviser: 'Prof. Cruz',
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-08-26T10:00:00Z',
    status: 'In Progress',
  },
]

const SEED_PLATES = [
  {
    id: 'plate-01',
    projectId: 'proj-01',
    fileName: 'Plate_A1_24h_100x.png',
    fileSize: '4.8 MB',
    status: PLATE_STATUS.COMPLETED,
    colonyCount: 42,
    avgAreaMm2: '3.45 mm²',
    avgDiameterMm: '2.09 mm',
    confidence: '92.4%',
    thumbnail: PETRI_THUMBNAILS[0],
    uploadedAt: '2026-08-28T12:04:00Z',
  },
  {
    id: 'plate-02',
    projectId: 'proj-01',
    fileName: 'Plate_A2_24h_100x.png',
    fileSize: '5.1 MB',
    status: PLATE_STATUS.REVIEWED,
    colonyCount: 56,
    avgAreaMm2: '3.38 mm²',
    avgDiameterMm: '2.07 mm',
    confidence: '94.1%',
    thumbnail: PETRI_THUMBNAILS[1],
    uploadedAt: '2026-08-28T12:10:00Z',
  },
  {
    id: 'plate-03',
    projectId: 'proj-01',
    fileName: 'Plate_A3_24h_100x.png',
    fileSize: '4.6 MB',
    status: PLATE_STATUS.PENDING_ADVISER,
    colonyCount: 50,
    avgAreaMm2: '3.42 mm²',
    avgDiameterMm: '2.08 mm',
    confidence: '91.8%',
    thumbnail: PETRI_THUMBNAILS[2],
    uploadedAt: '2026-08-28T12:15:00Z',
  },
  {
    id: 'plate-04',
    projectId: 'proj-02',
    fileName: 'WS_Sample_01.png',
    fileSize: '3.9 MB',
    status: PLATE_STATUS.COMPLETED,
    colonyCount: 28,
    avgAreaMm2: '2.10 mm²',
    avgDiameterMm: '1.63 mm',
    confidence: '89.5%',
    thumbnail: PETRI_THUMBNAILS[0],
    uploadedAt: '2026-08-20T09:30:00Z',
  },
  {
    id: 'plate-05',
    projectId: 'proj-02',
    fileName: 'WS_Sample_02.png',
    fileSize: '4.2 MB',
    status: PLATE_STATUS.COMPLETED,
    colonyCount: 34,
    avgAreaMm2: '2.25 mm²',
    avgDiameterMm: '1.69 mm',
    confidence: '91.0%',
    thumbnail: PETRI_THUMBNAILS[1],
    uploadedAt: '2026-08-20T09:35:00Z',
  },
  {
    id: 'plate-06',
    projectId: 'proj-shared-01',
    fileName: 'Probiotic_A_48h.png',
    fileSize: '5.5 MB',
    status: PLATE_STATUS.COMPLETED,
    colonyCount: 120,
    avgAreaMm2: '1.80 mm²',
    avgDiameterMm: '1.51 mm',
    confidence: '93.2%',
    thumbnail: PETRI_THUMBNAILS[2],
    uploadedAt: '2026-08-24T14:00:00Z',
  },
  {
    id: 'plate-07',
    projectId: 'proj-03',
    fileName: 'Inhibition_P_aeruginosa_01.png',
    fileSize: '4.7 MB',
    status: PLATE_STATUS.COMPLETED,
    colonyCount: 38,
    avgAreaMm2: '2.95 mm²',
    avgDiameterMm: '1.94 mm',
    confidence: '93.5%',
    thumbnail: PETRI_THUMBNAILS[0],
    uploadedAt: '2026-08-12T09:15:00Z',
  },
  {
    id: 'plate-08',
    projectId: 'proj-03',
    fileName: 'Inhibition_P_aeruginosa_02.png',
    fileSize: '4.9 MB',
    status: PLATE_STATUS.COMPLETED,
    colonyCount: 44,
    avgAreaMm2: '3.10 mm²',
    avgDiameterMm: '1.98 mm',
    confidence: '94.2%',
    thumbnail: PETRI_THUMBNAILS[1],
    uploadedAt: '2026-08-12T09:20:00Z',
  },
  {
    id: 'plate-09',
    projectId: 'proj-04',
    fileName: 'Guava_Citrus_Synergy_01.png',
    fileSize: '4.1 MB',
    status: PLATE_STATUS.PENDING,
    colonyCount: 15,
    avgAreaMm2: '2.50 mm²',
    avgDiameterMm: '1.78 mm',
    confidence: '88.0%',
    thumbnail: PETRI_THUMBNAILS[2],
    uploadedAt: '2026-08-26T15:00:00Z',
  },
  {
    id: 'plate-10',
    projectId: 'proj-05',
    fileName: 'Urban_Runoff_StationA_01.png',
    fileSize: '4.3 MB',
    status: PLATE_STATUS.REVIEWED,
    colonyCount: 65,
    avgAreaMm2: '2.85 mm²',
    avgDiameterMm: '1.90 mm',
    confidence: '90.5%',
    thumbnail: PETRI_THUMBNAILS[0],
    uploadedAt: '2026-08-24T11:00:00Z',
  },
]

// Pre-generate annotations for seed plates
const SEED_ANNOTATIONS = {}
SEED_PLATES.forEach((plate) => {
  if (plate.status === PLATE_STATUS.COMPLETED || plate.status === PLATE_STATUS.REVIEWED || plate.status === PLATE_STATUS.PENDING_ADVISER) {
    SEED_ANNOTATIONS[plate.id] = generateMockAnnotations(plate.id, plate.colonyCount)
  }
})

const SEED_MEMBERS = [
  // Group 8 (adv-01) members:
  { projectId: 'proj-01', userId: 'demo-student-01', userName: 'Alex Rivera', email: 'student@labgroup.acuity.app', role: 'Owner', joinedAt: '2026-07-15T08:00:00Z' },
  { projectId: 'proj-01', userId: 'demo-student-carlos', userName: 'Carlos Tan', email: 'carlos.tan@labgroup.acuity.app', role: 'Co-Annotator', joinedAt: '2026-07-16T09:00:00Z' },
  { projectId: 'proj-01', userId: 'demo-student-maya', userName: 'Maya Reyes', email: 'maya.reyes@labgroup.acuity.app', role: 'Co-Annotator', joinedAt: '2026-07-16T09:00:00Z' },
  { projectId: 'proj-03', userId: 'demo-student-01', userName: 'Alex Rivera', email: 'student@labgroup.acuity.app', role: 'Owner', joinedAt: '2026-05-10T09:00:00Z' },
  { projectId: 'proj-04', userId: 'demo-student-01', userName: 'Alex Rivera', email: 'student@labgroup.acuity.app', role: 'Owner', joinedAt: '2026-08-01T10:00:00Z' },

  // Group 3 (adv-02) members (Sarah Gomez is leader, not Alex Rivera):
  { projectId: 'proj-02', userId: 'demo-student-03', userName: 'Sarah Gomez', email: 'sarah.gomez@labgroup.acuity.app', role: 'Owner', joinedAt: '2026-06-20T10:00:00Z' },
  { projectId: 'proj-02', userId: 'demo-student-rafael', userName: 'Rafael Aquino', email: 'rafael.aquino@labgroup.acuity.app', role: 'Co-Annotator', joinedAt: '2026-06-21T10:00:00Z' },
  { projectId: 'proj-02', userId: 'demo-student-lea', userName: 'Lea Mendoza', email: 'lea.mendoza@labgroup.acuity.app', role: 'Co-Annotator', joinedAt: '2026-06-21T10:00:00Z' },
  { projectId: 'proj-05', userId: 'demo-student-03', userName: 'Sarah Gomez', email: 'sarah.gomez@labgroup.acuity.app', role: 'Owner', joinedAt: '2026-07-10T11:00:00Z' },

  // Shared project:
  { projectId: 'proj-shared-01', userId: 'demo-student-02', userName: 'Jamie Chen', email: 'jamie.chen@labgroup.acuity.app', role: 'Owner', joinedAt: '2026-07-01T09:00:00Z' },
  { projectId: 'proj-shared-01', userId: 'demo-student-01', userName: 'Alex Rivera', email: 'student@labgroup.acuity.app', role: 'Co-Annotator', joinedAt: '2026-08-26T10:00:00Z' },
]

const SEED_INVITATIONS = [
  {
    id: 'inv-01',
    projectId: 'proj-01',
    projectName: 'Antimicrobial Efficacy of Psidium guajava Extracts',
    inviterId: 'demo-student-01',
    inviterName: 'Alex Rivera',
    inviteeEmail: 'carlos.martinez@labgroup.acuity.app',
    inviteeName: 'Carlos Martinez',
    status: INVITATION_STATUS.PENDING,
    createdAt: '2026-08-28T15:00:00Z',
  },
]

const SEED_REMARKS = [
  {
    id: 'remark-01',
    projectId: 'proj-01',
    projectName: 'Antimicrobial Efficacy of Psidium guajava Extracts',
    plateId: 'plate-02',
    plateName: 'Plate_A2_24h_100x.png',
    adviserId: 'demo-faculty-01',
    adviserName: 'Prof. Cruz',
    comment: 'Please re-verify the clustered colony bounding boxes on Plate A2 near the perimeter. Several overlapping colonies should be separated manually.',
    date: '2026-08-30T10:00:00Z',
    status: REMARK_STATUS.OPEN,
  },
  {
    id: 'remark-02',
    projectId: 'proj-02',
    projectName: 'Enumeration of Coliforms in Watershed Samples',
    plateId: null,
    plateName: null,
    adviserId: 'demo-faculty-01',
    adviserName: 'Prof. Cruz',
    comment: 'The overall coliform counts look consistent. Please submit the final CSV export for review and include the standard deviation calculations.',
    date: '2026-08-25T14:00:00Z',
    status: REMARK_STATUS.ADDRESSED,
  },
  {
    id: 'remark-03',
    projectId: 'proj-05',
    projectName: 'Microbial Contamination Index of Urban River Runoff',
    plateId: 'plate-10',
    plateName: 'Urban_Runoff_StationA_01.png',
    adviserId: 'demo-faculty-01',
    adviserName: 'Prof. Cruz',
    comment: 'Significant background turbidity detected on Station A plates. Please adjust the segmentation confidence threshold to 90% and separate the peripheral cluster before resubmitting.',
    date: '2026-08-29T16:00:00Z',
    status: REMARK_STATUS.OPEN,
  },
]

const SEED_ACTIVITY = [
  { id: 'activity-01', type: 'plate_uploaded', projectId: 'proj-01', projectName: 'Antimicrobial Efficacy of Psidium guajava Extracts', detail: 'Plate_A3_24h_100x.png uploaded', timestamp: '2026-08-28T12:15:00Z' },
  { id: 'activity-02', type: 'plate_analyzed', projectId: 'proj-01', projectName: 'Antimicrobial Efficacy of Psidium guajava Extracts', detail: '42 colonies detected on Plate_A1', timestamp: '2026-08-28T12:20:00Z' },
  { id: 'activity-03', type: 'remark_received', projectId: 'proj-01', projectName: 'Antimicrobial Efficacy of Psidium guajava Extracts', detail: 'New remark from Dr. Maria Santos', timestamp: '2026-08-30T10:00:00Z' },
  { id: 'activity-04', type: 'project_created', projectId: 'proj-02', projectName: 'Enumeration of Coliforms in Watershed Samples', detail: 'Project created', timestamp: '2026-06-20T10:00:00Z' },
]

/* ══════════════════════════════════════════════════════════════
   Store
   ══════════════════════════════════════════════════════════════ */

export const useProjectStore = create((set, get) => ({
  // ── State ──
  adviseeGroups: [...SEED_ADVISEE_GROUPS],
  projects: [...SEED_PROJECTS],
  plates: [...SEED_PLATES],
  annotations: { ...SEED_ANNOTATIONS },
  members: [...SEED_MEMBERS],
  invitations: [...SEED_INVITATIONS],
  adviserRemarks: [...SEED_REMARKS],
  activityLog: [...SEED_ACTIVITY],

  /* ──────────────────────────────────────────────────────────
     PROJECT CRUD
     ────────────────────────────────────────────────────────── */

  createProject: (name, description, user) => {
    const id = genProjectId()
    const now = new Date().toISOString()
    const newProject = {
      id,
      name,
      description: description || '',
      organism: '',
      ownerId: user.id,
      ownerName: user.displayName,
      adviser: '',
      createdAt: now,
      updatedAt: now,
      status: 'In Progress',
    }
    const newMember = {
      projectId: id,
      userId: user.id,
      userName: user.displayName,
      email: user.email,
      role: 'Owner',
      joinedAt: now,
    }
    const activity = {
      id: genActivityId(),
      type: 'project_created',
      projectId: id,
      projectName: name,
      detail: 'Project created',
      timestamp: now,
    }
    set((state) => ({
      projects: [newProject, ...state.projects],
      members: [...state.members, newMember],
      activityLog: [activity, ...state.activityLog],
    }))
    return id
  },

  updateProject: (projectId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }))
  },

  deleteProject: (projectId) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      plates: state.plates.filter((p) => p.projectId !== projectId),
      members: state.members.filter((m) => m.projectId !== projectId),
      invitations: state.invitations.filter((i) => i.projectId !== projectId),
    }))
  },

  /* ──────────────────────────────────────────────────────────
     PLATE CRUD
     ────────────────────────────────────────────────────────── */

  addPlates: (projectId, files) => {
    const now = new Date().toISOString()
    const projectName = get().projects.find((p) => p.id === projectId)?.name || ''
    const newPlates = files.map((file) => ({
      id: genPlateId(),
      projectId,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: PLATE_STATUS.UPLOADING,
      colonyCount: 0,
      avgAreaMm2: '—',
      avgDiameterMm: '—',
      confidence: '—',
      thumbnail: PETRI_THUMBNAILS[Math.floor(Math.random() * PETRI_THUMBNAILS.length)],
      uploadedAt: now,
      // Store the File object reference for local preview (not uploaded to S3)
      _localFile: file,
    }))

    const activities = newPlates.map((plate) => ({
      id: genActivityId(),
      type: 'plate_uploaded',
      projectId,
      projectName,
      detail: `${plate.fileName} uploaded`,
      timestamp: now,
    }))

    set((state) => ({
      plates: [...state.plates, ...newPlates],
      activityLog: [...activities, ...state.activityLog],
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, updatedAt: now } : p
      ),
    }))

    // Start simulated processing for each new plate
    newPlates.forEach((plate) => {
      get().simulateProcessing(plate.id)
    })

    return newPlates.map((p) => p.id)
  },

  deletePlate: (plateId) => {
    const plate = get().plates.find((p) => p.id === plateId)
    if (!plate) return

    set((state) => {
      const newAnnotations = { ...state.annotations }
      delete newAnnotations[plateId]
      return {
        plates: state.plates.filter((p) => p.id !== plateId),
        annotations: newAnnotations,
        projects: state.projects.map((p) =>
          p.id === plate.projectId ? { ...p, updatedAt: new Date().toISOString() } : p
        ),
      }
    })
  },

  updatePlateStatus: (plateId, status) => {
    set((state) => ({
      plates: state.plates.map((p) =>
        p.id === plateId ? { ...p, status } : p
      ),
    }))
  },

  /* ──────────────────────────────────────────────────────────
     SIMULATED AI PROCESSING
     ────────────────────────────────────────────────────────── */

  simulateProcessing: (plateId) => {
    const steps = [
      { status: PLATE_STATUS.PENDING, delay: 800 },
      { status: PLATE_STATUS.PROCESSING, delay: 1500 },
      { status: PLATE_STATUS.COMPLETED, delay: 2000 },
    ]

    let elapsed = 0
    steps.forEach(({ status, delay }) => {
      elapsed += delay
      setTimeout(() => {
        if (status === PLATE_STATUS.COMPLETED) {
          // Generate mock AI results
          const results = generateMockAIResults()
          const mockAnnotations = generateMockAnnotations(plateId, results.colonyCount)
          const plate = get().plates.find((p) => p.id === plateId)
          const projectName = plate ? get().projects.find((pr) => pr.id === plate.projectId)?.name || '' : ''

          set((state) => ({
            plates: state.plates.map((p) =>
              p.id === plateId
                ? {
                    ...p,
                    status,
                    colonyCount: results.colonyCount,
                    avgAreaMm2: results.avgAreaMm2,
                    avgDiameterMm: results.avgDiameterMm,
                    confidence: results.confidence,
                  }
                : p
            ),
            annotations: {
              ...state.annotations,
              [plateId]: mockAnnotations,
            },
            activityLog: [
              {
                id: genActivityId(),
                type: 'plate_analyzed',
                projectId: plate?.projectId,
                projectName,
                detail: `${results.colonyCount} colonies detected on ${plate?.fileName || plateId}`,
                timestamp: new Date().toISOString(),
              },
              ...state.activityLog,
            ],
          }))
        } else {
          get().updatePlateStatus(plateId, status)
        }
      }, elapsed)
    })
  },

  /* ──────────────────────────────────────────────────────────
     ANNOTATION BRIDGE
     ────────────────────────────────────────────────────────── */

  getAnnotationsForPlate: (plateId) => {
    return get().annotations[plateId] || []
  },

  saveAnnotationsForPlate: (plateId, annotationList) => {
    // Count active (non-deleted) annotations
    const activeCount = annotationList.filter((a) => !a.softDeleted).length

    set((state) => ({
      annotations: {
        ...state.annotations,
        [plateId]: annotationList,
      },
      plates: state.plates.map((p) =>
        p.id === plateId ? { ...p, colonyCount: activeCount, updatedAt: new Date().toISOString() } : p
      ),
    }))
  },

  /* ──────────────────────────────────────────────────────────
     MEMBERS & INVITATIONS
     ────────────────────────────────────────────────────────── */

  inviteMember: (projectId, email, inviterUser) => {
    const project = get().projects.find((p) => p.id === projectId)
    if (!project) return null

    const id = genInvitationId()
    const invitation = {
      id,
      projectId,
      projectName: project.name,
      inviterId: inviterUser.id,
      inviterName: inviterUser.displayName,
      inviteeEmail: email,
      inviteeName: email.split('@')[0],
      status: INVITATION_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      invitations: [...state.invitations, invitation],
    }))
    return id
  },

  acceptInvitation: (invitationId, user) => {
    const invitation = get().invitations.find((i) => i.id === invitationId)
    if (!invitation) return

    const now = new Date().toISOString()
    set((state) => ({
      invitations: state.invitations.map((i) =>
        i.id === invitationId ? { ...i, status: INVITATION_STATUS.ACCEPTED } : i
      ),
      members: [
        ...state.members,
        {
          projectId: invitation.projectId,
          userId: user.id,
          userName: user.displayName,
          email: user.email,
          role: 'Collaborator',
          joinedAt: now,
        },
      ],
      projects: state.projects.map((p) =>
        p.id === invitation.projectId ? { ...p, updatedAt: now } : p
      ),
    }))
  },

  declineInvitation: (invitationId) => {
    set((state) => ({
      invitations: state.invitations.map((i) =>
        i.id === invitationId ? { ...i, status: INVITATION_STATUS.DECLINED } : i
      ),
    }))
  },

  cancelInvitation: (invitationId) => {
    set((state) => ({
      invitations: state.invitations.filter((i) => i.id !== invitationId),
    }))
  },

  /* ──────────────────────────────────────────────────────────
     ADVISER REMARKS
     ────────────────────────────────────────────────────────── */

  updateRemarkStatus: (remarkId, status) => {
    set((state) => ({
      adviserRemarks: state.adviserRemarks.map((r) =>
        r.id === remarkId ? { ...r, status } : r
      ),
    }))
  },

  /* ──────────────────────────────────────────────────────────
     FACULTY REVIEW & DECISION ACTIONS
     ────────────────────────────────────────────────────────── */

  /**
   * Flag project for correction: requires non-empty feedback,
   * updates status to 'Revision Required', creates adviser remark,
   * leaves student editing enabled.
   */
  flagProjectForRevision: (projectId, feedback, facultyUser) => {
    const project = get().projects.find((p) => p.id === projectId)
    if (!project) return null

    const now = new Date().toISOString()
    const remarkId = genRemarkId()
    const newRemark = {
      id: remarkId,
      projectId,
      projectName: project.name,
      plateId: null,
      plateName: null,
      adviserId: facultyUser?.id || 'demo-faculty-01',
      adviserName: facultyUser?.displayName || 'Prof. Cruz',
      comment: feedback.trim(),
      date: now,
      status: REMARK_STATUS.OPEN,
    }

    const activity = {
      id: genActivityId(),
      type: 'remark_received',
      projectId,
      projectName: project.name,
      detail: `Revision requested by ${facultyUser?.displayName || 'Prof. Cruz'}: "${feedback.trim().slice(0, 60)}${feedback.length > 60 ? '...' : ''}"`,
      timestamp: now,
    }

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, status: 'Revision Required', updatedAt: now } : p
      ),
      adviserRemarks: [newRemark, ...state.adviserRemarks],
      activityLog: [activity, ...state.activityLog],
    }))

    return newRemark
  },

  /**
   * Approve project and freeze data: sets status to 'Validated',
   * locks student editing with immutable data freeze notice,
   * moves project to Validated Archive.
   */
  approveProjectAndFreeze: (projectId, facultyUser) => {
    const project = get().projects.find((p) => p.id === projectId)
    if (!project) return null

    const now = new Date().toISOString()
    const validatedBy = facultyUser?.displayName || 'Prof. Cruz'
    const activity = {
      id: genActivityId(),
      type: 'project_validated',
      projectId,
      projectName: project.name,
      detail: `Approved and frozen by ${validatedBy} (Data Freeze Enforced)`,
      timestamp: now,
    }

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: 'Validated',
              updatedAt: now,
              validatedAt: now,
              validatedBy,
            }
          : p
      ),
      activityLog: [activity, ...state.activityLog],
    }))

    return true
  },

  /**
   * Add spatial remark on a specific plate from faculty review canvas.
   */
  addAdviserRemark: (projectId, plateId, comment, facultyUser) => {
    const project = get().projects.find((p) => p.id === projectId)
    const plate = get().plates.find((p) => p.id === plateId)
    if (!project) return null

    const now = new Date().toISOString()
    const remarkId = genRemarkId()
    const newRemark = {
      id: remarkId,
      projectId,
      projectName: project.name,
      plateId: plateId || null,
      plateName: plate?.fileName || null,
      adviserId: facultyUser?.id || 'demo-faculty-01',
      adviserName: facultyUser?.displayName || 'Prof. Cruz',
      comment: comment.trim(),
      date: now,
      status: REMARK_STATUS.OPEN,
    }

    set((state) => ({
      adviserRemarks: [newRemark, ...state.adviserRemarks],
    }))

    return newRemark
  },

  /* ══════════════════════════════════════════════════════════════
     COMPUTED SELECTORS
     ══════════════════════════════════════════════════════════════ */

  /** Projects owned by a specific user */
  getOwnedProjects: (userId) => {
    return get().projects.filter((p) => p.ownerId === userId)
  },

  /** Projects where the user is a member but NOT the owner */
  getSharedProjects: (userId) => {
    const memberProjectIds = get()
      .members.filter((m) => m.userId === userId)
      .map((m) => m.projectId)
    return get().projects.filter(
      (p) => memberProjectIds.includes(p.id) && p.ownerId !== userId
    )
  },

  /** All projects a user can access (owned + shared) */
  getAccessibleProjects: (userId) => {
    const memberProjectIds = get()
      .members.filter((m) => m.userId === userId)
      .map((m) => m.projectId)
    return get().projects.filter((p) => memberProjectIds.includes(p.id))
  },

  /** Plates belonging to a specific project */
  getPlatesForProject: (projectId) => {
    return get().plates.filter((p) => p.projectId === projectId)
  },

  /** Members of a specific project */
  getMembersForProject: (projectId) => {
    return get().members.filter((m) => m.projectId === projectId)
  },

  /** Invitations for a specific project */
  getInvitationsForProject: (projectId) => {
    return get().invitations.filter((i) => i.projectId === projectId)
  },

  /** Adviser remarks for a specific user's projects */
  getRemarksForUser: (userId) => {
    const ownedProjectIds = get()
      .projects.filter((p) => p.ownerId === userId)
      .map((p) => p.id)
    return get().adviserRemarks.filter((r) => ownedProjectIds.includes(r.projectId))
  },

  /** Computed stats for a project */
  getProjectStats: (projectId) => {
    const plates = get().getPlatesForProject(projectId)
    const completedPlates = plates.filter(
      (p) => p.status === PLATE_STATUS.COMPLETED || p.status === PLATE_STATUS.REVIEWED || p.status === PLATE_STATUS.PENDING_ADVISER
    )
    const totalCFU = completedPlates.reduce((sum, p) => sum + (p.colonyCount || 0), 0)
    const avgArea = completedPlates.length > 0
      ? (completedPlates.reduce((sum, p) => sum + parseFloat(p.avgAreaMm2) || 0, 0) / completedPlates.length).toFixed(2)
      : '0.00'
    const avgDiameter = completedPlates.length > 0
      ? (completedPlates.reduce((sum, p) => sum + parseFloat(p.avgDiameterMm) || 0, 0) / completedPlates.length).toFixed(2)
      : '0.00'
    const memberCount = get().getMembersForProject(projectId).length
    const processing = plates.filter((p) => p.status === PLATE_STATUS.PROCESSING || p.status === PLATE_STATUS.PENDING).length

    return {
      totalPlates: plates.length,
      completedPlates: completedPlates.length,
      totalCFU,
      avgArea: `${avgArea} mm²`,
      avgDiameter: `${avgDiameter} mm`,
      memberCount,
      processing,
    }
  },

  /** Recent activity (last N items) */
  getRecentActivity: (limit = 10) => {
    return get().activityLog.slice(0, limit)
  },

  /** Recent plates across all accessible projects */
  getRecentPlates: (userId, limit = 5) => {
    const accessibleProjectIds = get()
      .getAccessibleProjects(userId)
      .map((p) => p.id)
    return get()
      .plates.filter((p) => accessibleProjectIds.includes(p.projectId))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, limit)
  },

  /** Plates currently processing across all accessible projects */
  getProcessingPlates: (userId) => {
    const accessibleProjectIds = get()
      .getAccessibleProjects(userId)
      .map((p) => p.id)
    return get()
      .plates.filter(
        (p) =>
          accessibleProjectIds.includes(p.projectId) &&
          (p.status === PLATE_STATUS.UPLOADING || p.status === PLATE_STATUS.PENDING || p.status === PLATE_STATUS.PROCESSING)
      )
  },

  /** Get a single project by ID */
  getProject: (projectId) => {
    return get().projects.find((p) => p.id === projectId) || null
  },

  /** Get a single plate by ID */
  getPlate: (plateId) => {
    return get().plates.find((p) => p.id === plateId) || null
  },

  /** Generate CSV data for a project's plates */
  generateCSVData: (projectId) => {
    const plates = get().getPlatesForProject(projectId)
    const completedPlates = plates.filter(
      (p) => p.status === PLATE_STATUS.COMPLETED || p.status === PLATE_STATUS.REVIEWED || p.status === PLATE_STATUS.PENDING_ADVISER
    )
    const header = 'Plate ID,File Name,Colony Count (CFU),Avg Area (mm²),Avg Diameter (mm),AI Confidence,Status'
    const rows = completedPlates.map(
      (p) => `${p.id},${p.fileName},${p.colonyCount},${p.avgAreaMm2},${p.avgDiameterMm},${p.confidence},${p.status}`
    )
    return [header, ...rows].join('\n')
  },

  /** Pending review submissions for Faculty review queue */
  getPendingReviewProjects: () => {
    return get().projects.filter(
      (p) => p.status === 'Adviser Review' || p.status === 'Pending Review'
    )
  },

  /** Validated projects for Faculty Validated Archive */
  getValidatedProjects: () => {
    return get().projects.filter((p) => p.status === 'Validated')
  },

  /** Get advisee group by ID */
  getAdviseeGroup: (groupId) => {
    return get().adviseeGroups.find((g) => g.id === groupId) || null
  },

  /** Get projects belonging to an advisee group */
  getProjectsForGroup: (groupId) => {
    return get().projects.filter((p) => p.groupId === groupId)
  },

  /** Get members for an advisee group */
  getMembersForGroup: (groupId) => {
    const group = get().getAdviseeGroup(groupId)
    return group?.members || []
  },
}))
