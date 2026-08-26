# Acuity — Developer Requirements & System Reference

> **Purpose:** Developer-facing reference extracted from the official Acuity Capstone Project Document.
>
> **Source of truth:** `3ITD - Group 8 - Acuity - Capstone Project Document.docx (1).pdf`
>
> **Important:** This document separates requirements explicitly stated in the capstone from implementation recommendations. Coding agents must not treat recommendations as official requirements unless the team approves them.

---

## 1. Project Overview

**Acuity** is a cloud-hosted, multi-tenant web platform designed for biology students/researchers, faculty advisers/laboratory personnel, and system administrators.

Its primary purpose is to automate the detection and counting of bacterial **Colony Forming Units (CFUs)** from Petri dish images, provide human-in-the-loop correction and morphological measurement, support academic review, and translate finalized annotations into structured data for thesis analysis.

The platform is browser-based and is intended to work with images captured externally using smartphones or digital cameras.

### Core workflow

```text
Petri Dish Image
      ↓
Browser Upload
      ↓
Cloud Storage
      ↓
AI Processing
      ↓
AI Colony Detections
      ↓
Interactive Annotation Canvas
      ↓
Human Verification / Correction
      ↓
Morphological Measurements
      ↓
Faculty Review
      ↓
Approval / Revision
      ↓
Finalized Dataset
      ↓
CSV / PDF Export
```

---

# 2. Primary User Roles

## 2.1 Biology Students / Thesis Researchers

Primary users of the platform.

Core responsibilities:

- Create and manage research projects
- Invite project members
- Upload Petri dish images
- Configure Region of Interest (ROI)
- Configure scale/calibration
- Configure AI confidence threshold
- Monitor AI processing
- Review AI-generated detections
- Manually add, resize, or delete annotations
- Review morphological measurements
- Resolve adviser comments
- Submit projects for faculty review
- Export finalized research data
- Manage their profile

---

## 2.2 Faculty Advisers / Laboratory Personnel

Academic validation layer.

Core responsibilities:

- Authenticate through approved faculty access
- View assigned student projects
- Review project summaries
- Inspect aggregated data
- View group members
- Compare raw Petri dish images with finalized annotations
- Add granular/spatial feedback
- Request revisions
- Approve accurate submissions
- Trigger project finalization/data freeze
- Manage their profile

---

## 2.3 System Administrators

Platform-level management.

Core responsibilities:

- Secure administrator authentication
- Manage users
- Manage academic tenants/institutions
- Manage roles
- Manage approved faculty registration roster
- Monitor audit logs
- Customize public content
- Publish global notices
- Manage documentation/FAQ content
- Maintain system configurations

---

# 3. Confirmed Frontend Technology Stack

The capstone explicitly specifies:

| Technology | Role |
|---|---|
| React.js | Main frontend framework / SPA |
| JavaScript ES6+ | Client-side programming |
| Vite / Node development server | Local frontend development |
| Konva.js / React-Konva | Interactive annotation canvas |
| HTML5 Canvas | Canvas rendering and annotation |
| Git / GitHub | Version control and collaboration |
| VS Code | Full-stack JavaScript development |

### Styling note

The capstone document **does not explicitly specify a CSS framework** such as Tailwind CSS, Bootstrap, Material UI, or similar.

Therefore:

- Styling is required for the actual web interface.
- The styling implementation is an engineering decision.
- Plain CSS/CSS Modules or Tailwind CSS may be considered.
- Coding agents must not claim that Tailwind CSS is a documented requirement.

---

# 4. Confirmed Backend / Infrastructure Stack

The capstone specifies the following server-side technologies and infrastructure:

| Technology | Role |
|---|---|
| Node.js + Express.js | Primary REST API, multi-tenant routing, WebSockets |
| Python 3 + FastAPI | Computer Vision / AI microservice |
| OpenCV | ROI masking and computer vision processing |
| SOD-YOLOv8 | Small-object colony detection model |
| Amazon RDS / PostgreSQL | Primary relational database |
| Amazon DynamoDB | Supplementary storage for raw AI output logs and audit trails |
| Redis | Processing queue / in-memory store |
| Amazon S3 | Raw and web-resolution image storage |
| AWS Cognito | Authentication, JWTs, OTPs |
| AWS SES or SendGrid | Email delivery |
| Nginx | Web server / reverse proxy |
| PM2 or Gunicorn | Process management |
| AWS EC2 | Backend hosting |
| AWS SageMaker | AI compute |
| Hostinger or AWS Amplify | Frontend hosting |
| Postman | API development/testing |

---

# 5. Local Development Environment

The documented local environment includes:

```text
Frontend:
Vite / Node development server

Backend:
Local Express.js instance

AI:
Local FastAPI instance

Database:
Local PostgreSQL

Queue:
Local Redis

Optional:
Docker containers for local PostgreSQL/Redis
```

The frontend should be independently runnable during early development.

---

# 6. Client-Side Requirements

The web application is browser-based.

Supported browsers identified by the capstone:

- Google Chrome
- Mozilla Firefox
- Apple Safari
- Microsoft Edge (Chromium-based)

JavaScript ES6+ must be enabled.

The client-side requirements also identify:

- HTML5 Canvas API
- WebSockets / Server-Sent Events
- Local/session storage for short-lived authentication token handling
- Browser caching for lightweight image variants
- Browser PDF viewer
- Minimum recommended upload bandwidth of 5 Mbps

Students/advisers are recommended to use a 1920×1080 display for detailed annotation and verification workflows.

---

# 7. Authentication Requirements

The platform includes authentication workflows for its different roles.

Frontend must account for:

- Login
- OTP verification
- Password reset
- Forgot password
- Password validation
- Logout
- Inactive accounts
- Role-aware routing
- Protected application routes
- Unauthorized/forbidden states
- Session/token handling
- Authentication errors
- Login lockout behavior

### Security principle

The frontend must never be treated as the final authorization boundary.

Role and tenant authorization must ultimately be enforced by the backend.

---

# 8. Multi-Tenancy

Acuity is explicitly designed as a multi-tenant platform.

The frontend must be prepared to work with:

- Tenant context
- User role
- Project ownership
- Project membership
- Adviser assignment
- Tenant-scoped resources
- Tenant-aware navigation
- Unauthorized cross-tenant access responses

The frontend must not attempt to provide tenant isolation merely by hiding UI elements.

---

# 9. Project Management

Students/researchers can:

- Create projects
- Manage projects
- Avoid duplicate project names within their account scope
- Initialize isolated project workspaces
- Invite project members
- Share project repositories/workspaces
- Manage project membership

Project membership permissions affect access to shared project repositories and annotation workspaces.

---

# 10. Collaboration

The project collaboration workflow includes:

- Invite peers
- Check whether invited users already have accounts
- Send registration invitations when necessary
- Provide Join Project functionality
- Validate invitation tokens
- Add members to project rosters
- Synchronize project permissions
- Allow active members to work within shared project repositories and annotation workspaces

---

# 11. Profile Management

Users can:

- Edit display name
- Edit biography
- Upload profile avatar
- Change password
- Deactivate account

Account deactivation requires confirmation and causes the account to become inactive for future login.

---

# 12. Image Upload Requirements

The image upload workflow is explicitly defined.

### Supported formats

- JPEG
- JPG
- PNG

### Batch constraints

- 1–10 Petri dish images per batch
- Maximum cumulative upload size: 50 MB

### Upload UI requirements

The frontend should support:

- Drag-and-drop upload
- Local file selection
- Client-side file type validation
- Client-side size validation
- File rejection messages
- Upload progress
- Processing status
- Upload success/failure states
- Transition into AI processing

Images are captured externally using a smartphone or digital camera before upload.

---

# 13. AI Processing Workflow

After successful upload:

```text
Validated Image
    ↓
Cloud Project Workspace
    ↓
AI Processing Queue
    ↓
Computer Vision Processing
    ↓
Detection Results
    ↓
Annotation Workspace
```

The frontend must be able to represent asynchronous processing.

Suggested UI states:

```text
idle
validating
uploading
uploaded
queued
processing
completed
failed
```

These state names are implementation suggestions; the backend contract should ultimately define the actual status values.

---

# 14. Annotation Workspace

This is a core Acuity feature.

The document requires an interactive HTML5/React Konva canvas.

### Required capabilities

- Display Petri dish image
- Overlay AI-generated bounding boxes
- Display confidence scores
- Adjust confidence threshold
- Add new colony annotations
- Resize bounding boxes
- Delete false positives
- Track updated colony totals
- Save annotation changes
- Preserve original automated detections
- Preserve human adjustments as a separate data tier

### Confidence threshold

The documented UI includes a slider from:

```text
50% → 100%
```

Each displayed bounding box can show its AI confidence percentage.

### Important architecture rule

Do NOT build the annotation workspace as one huge component.

Separate:

```text
Canvas rendering
Annotation state
Coordinate calculations
History
API synchronization
Morphology calculations
Toolbar controls
Sidebar/panels
```

---

# 15. Morphological Measurements

The platform is designed to provide analytical colony measurements.

The documented system includes measurements such as:

- Colony area
- Diameter
- Total colony count
- Colony size distribution
- Scale-calibrated measurements

The system must maintain consistency between canvas coordinates and stored records.

---

# 16. ROI and Calibration

Students/researchers can configure:

- Region of Interest (ROI)
- Scale/calibration

The scale calibration maps canvas pixel measurements to real-world millimeter dimensions.

Frontend implementation must keep coordinate transformations consistent between:

```text
Original Image
Canvas
Bounding Boxes
ROI
Pixel Measurements
Real-World Measurements
```

Do not invent the final calibration formula unless it is defined by the backend/AI implementation.

---

# 17. Faculty Review

Faculty advisers have a dedicated review workflow.

### Review features

- View projects ready for evaluation
- Inspect project summaries
- View aggregated data tables
- View trend graphs
- View group members
- Open Petri dish annotations
- Compare finalized annotations against the raw image
- Read annotation information
- Add spatial/granular comments
- Request revisions
- Approve projects

### Read-only review

The documented faculty canvas preview opens in read-only mode to prevent unintended modification of student data.

---

# 18. Revision Workflow

If a faculty adviser identifies an issue:

```text
Faculty Review
      ↓
Issue Identified
      ↓
Mandatory Feedback
      ↓
Revision Required
      ↓
Student Team Notified
      ↓
Student Resolves Feedback
      ↓
Resubmission
      ↓
Faculty Review
```

Frontend should clearly distinguish revision-required projects from approved projects.

---

# 19. Approval / Data Freeze

If a project is scientifically accurate:

```text
Faculty Approves
      ↓
Project Status = Approved
      ↓
Student Editing Locked
      ↓
Verified Event Recorded
      ↓
Final Export Available
```

The frontend must reflect the locked/read-only state after approval.

Actual authorization and data freezing must be enforced by the backend.

---

# 20. CSV / PDF Export

The platform provides project data export.

### CSV

The system:

- verifies authorization
- filters project-specific records
- excludes contaminated/discarded samples
- aggregates verified colony metrics
- generates structured CSV data
- provides browser download

### PDF

The system also supports PDF report generation and preview.

The finalized data is intended to be compatible with statistical software such as:

- SPSS
- R

The frontend should provide clear export states:

```text
Preparing
Generating
Ready
Failed
```

---

# 21. Administration

Admin functionality includes:

### User management

- User CRUD
- Role management
- Account activation/deactivation

### Tenant management

- Academic institution/tenant management
- Tenant configuration

### Faculty roster

- Pre-approved faculty email entries
- Faculty registration management

### Content management

- Public page text
- System links
- Graphic descriptions
- Documentation
- Training materials
- FAQs

### Global notices

- Banner announcements
- Maintenance notices
- Notification scheduling
- Alert expiration

### Audit / monitoring

- Audit log access
- System monitoring

---

# 22. Non-Functional Frontend Considerations

## Accuracy

The frontend must preserve data consistency between:

- AI results
- Canvas coordinates
- Manual corrections
- Database records
- Exported results

## Reliability

The interface should remain responsive while AI processing occurs in the background.

Failed processing should not unnecessarily interrupt active user sessions.

## Usability

The document calls for:

- Intuitive navigation
- Straightforward UI
- Reactive controls
- Simple on-screen sliders

## Performance

The system is designed around:

- Direct-to-cloud upload using pre-signed channels
- Client-side annotation updates
- Immediate metric updates

## Scalability

Frontend architecture must not assume a single laboratory or single project.

## Security

Research data must only be accessible to authorized users.

Authentication, tenant boundaries, and authorization must be enforced by the backend.

The system is intended to comply with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).

## Portability

The application should operate in modern standard web browsers without requiring local software installation.

---

# 23. Suggested Frontend Folder Architecture

This is a **recommended implementation structure**, not an explicit requirement from the capstone.

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── navigation/
│   │   └── feedback/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── upload/
│   │   ├── annotation/
│   │   ├── collaboration/
│   │   ├── faculty-review/
│   │   ├── exports/
│   │   ├── admin/
│   │   └── profile/
│   │
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   ├── StudentLayout.jsx
│   │   ├── FacultyLayout.jsx
│   │   └── AdminLayout.jsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   ├── student/
│   │   ├── faculty/
│   │   └── admin/
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── services/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── websocket/
│   │   └── storage/
│   │
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── constants/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── package.json
└── vite.config.js
```

---

# 24. Recommended Initial Routes

These are implementation recommendations and must be validated against the final UI/UX design:

```text
/auth/login
/auth/otp
/auth/forgot-password
/auth/reset-password

/student/dashboard
/student/projects
/student/projects/:projectId
/student/projects/:projectId/workspace
/student/projects/:projectId/annotation
/student/projects/:projectId/export

/faculty/dashboard
/faculty/projects
/faculty/projects/:projectId/review

/admin/dashboard
/admin/users
/admin/tenants
/admin/audit-logs
/admin/content
/admin/settings

/profile
```

Do not create routes merely because they appear in this list. Confirm them against the actual requirements and UI design.

---

# 25. API Boundary

The frontend communicates with backend services.

Recommended separation:

```text
React UI
   ↓
Frontend Service Layer
   ↓
Node.js / Express REST API
   ↓
PostgreSQL / DynamoDB / Redis / S3

React UI
   ↓
Real-Time Client
   ↓
Express WebSocket/SSE Layer

Backend
   ↓
FastAPI
   ↓
OpenCV / SOD-YOLOv8
```

The frontend must not:

- connect directly to PostgreSQL
- connect directly to Redis
- execute AI inference
- contain AWS secret credentials
- implement backend authorization
- assume undocumented API endpoints

---

# 26. Environment Variables

Frontend environment variables may include only client-safe configuration.

Possible examples:

```env
VITE_API_BASE_URL=
VITE_WS_URL=
VITE_COGNITO_REGION=
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
```

These are examples, not confirmed final variable names.

Never expose:

- AWS secret access keys
- database credentials
- private backend secrets
- server-side API keys

---

# 27. Testing Expectations

The capstone identifies the following testing/quality tools:

- Postman
- Cypress
- Apache JMeter
- Sentry
- BrowserStack
- Google Lighthouse
- SonarQube
- OWASP ZAP

Frontend-specific concerns include:

- Authentication
- Route protection
- Upload validation
- Upload progress
- AI processing status
- Canvas interaction
- Annotation persistence
- Faculty read-only review
- Revision workflows
- Approval/data lock
- CSV/PDF export
- Browser compatibility
- Performance
- Error handling

---

# 28. Important Implementation Rules for Coding Agents

1. Read this document before making architectural changes.
2. Inspect the existing repository before modifying files.
3. Preserve existing work.
4. Do not invent undocumented API endpoints.
5. Do not invent database schemas.
6. Do not invent AI response payloads.
7. Use mock data only when clearly labeled as mock data.
8. Keep API logic separate from UI components.
9. Keep feature-specific logic inside feature modules.
10. Avoid giant components.
11. Avoid unnecessary dependencies.
12. Do not put secrets in frontend code.
13. Do not treat frontend authorization as sufficient security.
14. Implement loading, empty, error, unauthorized, forbidden, and not-found states.
15. Keep the annotation canvas modular.
16. Preserve AI-generated data separately from human corrections.
17. Maintain responsive behavior without sacrificing desktop annotation usability.
18. Do not silently change the documented technology stack.
19. Clearly identify recommendations versus documented requirements.
20. Ask for clarification when an implementation decision materially affects the system architecture.

---

# 29. Explicitly Documented vs Recommended

## Explicitly documented

- React.js
- JavaScript ES6+
- Vite / Node development server
- Konva.js
- HTML5 Canvas
- Node.js / Express.js
- Python / FastAPI
- OpenCV
- SOD-YOLOv8
- PostgreSQL / Amazon RDS
- Amazon DynamoDB
- Redis
- Amazon S3
- AWS Cognito
- WebSockets / SSE
- Git / GitHub
- AWS EC2
- AWS SageMaker
- Hostinger or AWS Amplify
- AWS SES or SendGrid
- Nginx
- PM2 or Gunicorn
- Postman
- Cypress
- JMeter
- Sentry
- BrowserStack
- Lighthouse
- SonarQube
- OWASP ZAP

## Not explicitly specified as frontend technologies

- Tailwind CSS
- Bootstrap
- Material UI
- shadcn/ui
- Redux
- Zustand
- TanStack Query
- Axios
- TypeScript

These may be considered by the development team, but must not be presented as requirements from the capstone.

---

# 30. Known Decisions Requiring Team Confirmation

Before locking implementation architecture, confirm:

- Final styling approach (plain CSS/CSS Modules vs Tailwind or another framework)
- Exact frontend route names
- Exact API endpoint naming
- API request/response schemas
- Authentication frontend integration details
- Exact Cognito configuration
- WebSocket vs SSE implementation details
- AI processing status payload
- Annotation persistence payload
- Morphology calculation ownership (frontend vs backend)
- Exact project status enumeration
- Exact export API behavior
- Final visual design system
- Final responsive behavior
- Whether a dedicated state-management library is necessary

---

# 31. Recommended Frontend Development Order

```text
1. Initialize React + Vite
2. Establish folder architecture
3. Configure routing
4. Establish base layouts
5. Establish styling/design system
6. Build authentication UI
7. Build authentication state
8. Build Student dashboard
9. Build project management
10. Build image upload workflow
11. Build AI processing status UI
12. Build annotation canvas foundation
13. Render AI detections
14. Implement manual annotation
15. Implement ROI/calibration UI
16. Implement morphology presentation
17. Implement collaboration
18. Build Faculty review
19. Build revision/approval workflow
20. Build export UI
21. Build Admin modules
22. Integrate real-time events
23. Integrate backend APIs
24. Test
25. Optimize
26. Prepare deployment
```

---

# 32. Definition of Done for Frontend Features

A frontend feature should not be considered complete merely because the happy-path UI renders.

Each feature should have:

- Functional UI
- Correct routing
- Responsive layout
- Loading state
- Empty state where applicable
- Error state
- Unauthorized/forbidden handling where applicable
- Form validation where applicable
- API integration or explicitly labeled mock integration
- Accessible interactions
- Consistent visual styling
- No hardcoded secrets
- No duplicated business logic
- Reasonable component boundaries
- Git commit with a meaningful message

---

# 33. Agent Behavior

When implementing Acuity:

> **Prefer correctness and alignment with the capstone document over speed or unnecessary abstraction.**

If the document does not specify something:

1. Identify the gap.
2. Recommend a reasonable implementation.
3. Clearly label it as a recommendation.
4. Do not silently treat it as an official requirement.
5. Ask for confirmation when the decision is architecturally significant.

The goal is a maintainable capstone implementation that accurately reflects the approved Acuity system design.
