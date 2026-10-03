# Acuity — Master Developer & Deployment Roadmap (Unified & Hardened)

> **How to use:** Work top-to-bottom. Each part builds directly on the foundation of the previous one.
> Check off items as they are completed. All cloud decisions, budget constraints, security gaps, and paper requirements are folded into this single guide.

---

## 0. Cloud Architecture, Budget & Risk Register

### 0.1 Account, Credit & Service Parameters
- [x] **AWS Account Type:** Created **September 30, 2026** on the **Credit-Based Free Plan** ($100 initial credits + up to $100 earned via console activities). Free plan expires **March 30, 2027** (~6 months). Credits extend up to 12 months if upgraded to paid tier, but initial pilot budget must strictly assume **$100 confirmed credits**.
- [x] **Cognito User Pool:** Created **September 30, 2026** (`ap-southeast-2_1YI8kasZj`) → **10,000 free MAU** (Lite tier, $0 cost for pilot).
- [ ] **Cognito Security & Admin 2FA:** Enable TOTP Multi-Factor Authentication (MFA) in the User Pool. Require TOTP MFA for all accounts with the `Admin` role to satisfy capstone security requirements.
- [x] **Region Anchor:** **ap-southeast-2 (Sydney)** for all AWS services (Cognito, S3, SES, DynamoDB, EC2).
- [ ] **Pilot Hosting Target:** ~$35–$45/month (1× EC2 `t3.medium` running Node + FastAPI + Redis + Nginx, CPU AI inference, S3 storage, On-Demand DynamoDB).
- [ ] **Hidden Costs & Safeguards:**
  - Account for AWS public IPv4 address charge (~$0.005/hour ≈ $3.60/month).
  - Configure multi-tiered **AWS Budgets alerts** in Billing console: `$10`, `$25`, `$50`, and a credit-burn velocity notification.
  - EC2 `t3.medium` burstable CPU: Configure a 4 GB swap file on the instance and set a CloudWatch **CPUCreditBalance** alarm (< 50 credits) to prevent inference throttling.
- [ ] **Infrastructure Sizing Deviation:** Document panel deviation: Table 3.4 in the capstone paper specifies an 8 GB server; the pilot deploys on 1× `t3.medium` (4 GB RAM + 4 GB swap) with local CPU inference to conserve credits.

### 0.2 Parallel Tracks (Lead-Time & Risk De-Risking)
- [ ] **ML Benchmark & Labeling (Start immediately in parallel with Part 2):**
  - Collect and label initial 50+ Petri dish images (Roboflow/CVAT).
  - Benchmark CPU inference latency of YOLOv8n/s on a local machine / `t3.medium` instance to confirm viability before Phase 10.
  - Time-box: If fine-tuned SOD-YOLOv8 does not reach F1 ≥ 80% by week 6, activate fallback (assisted human annotation / rule-based contour detector + manual correction).
- [ ] **SES Sending & Domain Verification (Start in Phase 6):**
  - Purchase domain early; verify DKIM/SPF/DMARC in SES `ap-southeast-2`.
  - Submit AWS SES sandbox removal request immediately (approval takes several business days; default sandbox limits to 50 emails/day to verified emails only).

---

# MILESTONE 1: Core Governance, Auth & Tenancy (Parts 1–5)

## PART 1 — Schema, Migration Baseline, Seed & Test Harness ✅ (COMPLETED)

### 1.1 Schema Changes
Edit [`backend/node-api/prisma/schema.prisma`](file:///c:/Acuity%20-%20Github/Acuity/backend/node-api/prisma/schema.prisma):
- [x] **Tenant model** — `institutionName`, lowercase unique `emailDomain`, `isActive Boolean @default(true)`.
- [x] **User model** — `isActive Boolean @default(true)`, `termsAcceptedAt DateTime?`, nullable `tenantId` (`String?`) for Admins.
- [x] **FacultyWhitelist model** — `allowedEmail` (unique lowercase), `tenantId` (FK → Tenant), `status` enum (`PENDING_REGISTRATION | REGISTERED | REVOKED`), `addedByAdminId`, `registeredUserId` (unique nullable FK), `dateAdded`, `revokedAt`.
- [x] **Project model** — `status` enum: `DRAFT | PROCESSING | READY_FOR_REVIEW | REVISION_REQUIRED | RESUBMITTED | APPROVED`. Unique `code String @unique` (10-char nanoid).
- [x] **ProjectAdviser model** — `projectId`, `adviserUserId`, `status` enum (`PENDING | ACTIVE | DECLINED | EXPIRED | REMOVED | CANCELLED`), `initiatedBy` enum (`STUDENT | ADVISER | ADMIN`), `requestedByUserId`, `reason String?`, `createdAt`, `respondedAt`, `expiresAt`.
- [x] **Notification model** — `id`, `userId` FK → User, `type String`, `title String`, `body String`, `data Json?`, `readAt DateTime?`, `createdAt DateTime @default(now())`.
- [x] **AuditLog model** — `id`, `at DateTime @default(now())`, `actorId String?`, `actorRole String?`, `tenantId String?`, `action String`, `resource String?`, `before Json?`, `after Json?`, `ip String?`.

### 1.2 Migration Baseline
- [x] Ran `npx prisma migrate reset` and `npx prisma migrate dev --name init`.
- [x] Raw SQL appended to `migration.sql`:
  - Partial unique index `one_open_adviser_link_per_project` on `ProjectAdviser(projectId)` where `status IN ('PENDING', 'ACTIVE')`.
  - Postgres trigger `audit_log_no_update_delete` enforcing append-only immutability on `AuditLog`.
- [x] Migration committed to version control.

### 1.3 Seed Script & Env Variables
- [x] `backend/node-api/prisma/seed.js` idempotent upserts for roles, dev tenant (`gmail.com`), Admin (`warry4958@gmail.com`), Faculty (`warrenrchua@gmail.com`), and whitelist entry.
- [x] Added `ENFORCE_EDU_DOMAIN=false`, `ADVISER_REQUEST_TTL_DAYS=14`, `MAX_ADVISERS_PER_PROJECT=1` to `.env`.

### 1.4 Test Harness Setup
- [x] Vitest test harness in `backend/node-api/tests` passing 4 baseline database tests (unique index enforcement, trigger immutability on update/delete, seed idempotency).

---

## PART 2 — Auth Rewrite, Route Guarding & Middleware Stack ⏳ (NEXT TO ACCOMPLISH)

### 2.1 Centralized Token Handling & Frontend Interceptor
- [ ] Refactor [`frontend/src/services/api/apiClient.js`](file:///c:/Acuity%20-%20Github/Acuity/frontend/src/services/api/apiClient.js) to be the **single source of truth** for all API communication:
  - Inject Cognito **ID Token** via `getIdToken()` into `Authorization: Bearer <token>` header for all requests.
  - Refactor stores ([`useAdminStore.js`](file:///c:/Acuity%20-%20Github/Acuity/frontend/src/stores/useAdminStore.js), [`useProjectStore.js`](file:///c:/Acuity%20-%20Github/Acuity/frontend/src/stores/useProjectStore.js), [`ProfilePage.jsx`](file:///c:/Acuity%20-%20Github/Acuity/frontend/src/pages/profile/ProfilePage.jsx)) to use `apiClient` instead of making ad-hoc `fetch()` calls.
- [ ] Add global Axios/fetch response interceptor in `apiClient.js` / [`AuthContext.jsx`](file:///c:/Acuity%20-%20Github/Acuity/frontend/src/context/AuthContext.jsx):
  - Intercept backend `401 NOT_SYNCED` → trigger `/api/auth/sync` flow.
  - Intercept backend `403` error codes: `ACCESS_REVOKED`, `UNRECOGNIZED_INSTITUTION`, `ACCOUNT_DEACTIVATED`, `TENANT_SUSPENDED`.
  - Display user-friendly modal with "Access Denied: Contact your administrator" and initiate Cognito sign-out.
  - **Remove silent fallback to Student role** across frontend stores.

### 2.2 Backend Token Verification (`middleware/auth.js`)
- [ ] Switch `CognitoJwtVerifier` in `backend/node-api/middleware/auth.js` to `tokenUse: "id"`.
- [ ] In `requireAuth`:
  - Verify JWT and extract claims: `sub`, `email`, `email_verified`, `given_name`, `family_name`.
  - Reject (`401`) if `email` is missing or `email_verified !== true`.
  - Query DB for user where `cognitoId = sub`, including `role` and `tenant`.
  - If user not found:
    - If route has `allowUnsynced` flag (specifically `POST /api/auth/sync`) → proceed.
    - Otherwise → return `401 { code: 'NOT_SYNCED', error: 'User account not synced to local database' }`.
  - If user found:
    - If `user.isActive === false` → return `403 { code: 'ACCOUNT_DEACTIVATED' }`.
    - If user role is NOT Admin and `tenant.isActive === false` → return `403 { code: 'TENANT_SUSPENDED' }`.
    - Attach `req.dbUser = user` and `req.user = payload` (token payload for backwards compatibility).

### 2.3 RBAC & Tenant Scoping Middleware (`middleware/rbac.js`)
Create [`backend/node-api/middleware/rbac.js`](file:///c:/Acuity%20-%20Github/Acuity/backend/node-api/middleware/rbac.js):
- [ ] **`requireRole(...roles)`** — checks `req.dbUser.role.name` against allowed roles. Returns `403 { code: 'FORBIDDEN', error: 'Insufficient role permissions' }` on mismatch.
- [ ] **`requireSameTenant(tenantIdExtractor)`** — verifies `req.dbUser.tenantId` matches resource tenant. Returns `404` (not 403) to prevent cross-tenant resource enumeration.
- [ ] **`requireProjectAccess({ role: 'owner' | 'member' | 'adviser' | 'any' })`** — verifies caller is project owner, `ProjectMember`, or active `ProjectAdviser`.
- [ ] **`tenantScope(user)`** helper:
  - If user has `Admin` role → returns `{}` (or explicit query filter).
  - For non-admins → returns `{ tenantId: user.tenantId }`. Throws an error if `tenantId` is null/undefined for non-admins.
- [ ] **`auditLog({ actorId, actorRole, tenantId, action, resource, before, after, ip })`** helper — writes to PostgreSQL `AuditLog` (swapped to DynamoDB in Phase 6 without touching callers).

### 2.4 Immediate Route Inventory & Guarding
Protect all existing route files immediately so tests pass and no endpoints remain exposed:
- [ ] [`backend/node-api/routes/admin.js`](file:///c:/Acuity%20-%20Github/Acuity/backend/node-api/routes/admin.js):
  - Apply `requireAuth` AND `requireRole('Admin')` to all endpoints (`GET /whitelist`, `POST /whitelist`, `DELETE /whitelist/:id`).
- [ ] [`backend/node-api/routes/users.js`](file:///c:/Acuity%20-%20Github/Acuity/backend/node-api/routes/users.js):
  - `GET /` (list all users) → add `requireRole('Admin')`.
  - `PUT /profile` → keep `requireAuth`, update caller's profile.
- [ ] [`backend/node-api/routes/uploads.js`](file:///c:/Acuity%20-%20Github/Acuity/backend/node-api/routes/uploads.js):
  - Guard `POST /image` with `requireAuth`. Validate uploaded file size (< 15MB) and mime-type. (Kept until presigned S3 pipeline in Phase 7).
- [ ] [`backend/node-api/routes/projects.js`](file:///c:/Acuity%20-%20Github/Acuity/backend/node-api/routes/projects.js):
  - Ensure project queries scope by `tenantScope(req.dbUser)`.
  - In `POST /`, ensure `code: generateProjectCode()` is called and validated.

### 2.5 Rewrite `POST /api/auth/sync` (`routes/auth.js`)
Edit [`backend/node-api/routes/auth.js`](file:///c:/Acuity%20-%20Github/Acuity/backend/node-api/routes/auth.js):
- [ ] Extract email strictly from `req.user.email` (never trust `req.body.email`).
- [ ] Extract names with fallback: `token.given_name || ''`, `token.family_name || ''`.
- [ ] Wrap sync logic in a Prisma `$transaction`.
- [ ] **Seed Linking (Dev Only):** If `NODE_ENV !== 'production'`, find user by email where `cognitoId LIKE 'seed:%'` and update `cognitoId = sub`.
- [ ] **Existing User:**
  - If `isActive === false` → `403 ACCOUNT_DEACTIVATED`.
  - If Faculty and `FacultyWhitelist.status === 'REVOKED'` → `403 ACCESS_REVOKED`.
  - Do NOT overwrite existing `firstName` and `lastName` if user has already modified their profile in DB.
  - Update `lastLogin: new Date()`, return user.
- [ ] **New User Flow:**
  - Check `FacultyWhitelist` by `allowedEmail = email.toLowerCase()`.
  - Atomic claim: `updateMany({ where: { allowedEmail, status: 'PENDING_REGISTRATION' }, data: { status: 'REGISTERED' } })`.
  - If claimed → create `Faculty` user with whitelist's `tenantId`, link `registeredUserId = user.id`.
  - If whitelist entry is `REVOKED` → `403 ACCESS_REVOKED`.
  - If whitelist entry is `REGISTERED` with another user → `409 WHITELIST_CONFLICT`.
  - If no whitelist match:
    - Extract email domain.
    - Query `Tenant` where `emailDomain = domain` AND `isActive = true`.
    - If `ENFORCE_EDU_DOMAIN === true` and domain is not educational → `403 UNRECOGNIZED_INSTITUTION`.
    - If no matching tenant found → `403 UNRECOGNIZED_INSTITUTION`.
    - If tenant found → create `Student` user with `tenantId = tenant.id`.
- [ ] **Security Invariant:** Never allow `Admin` role creation or arbitrary `tenantId` assignment from `req.body`.
- [ ] Handle `termsAcceptedAt` timestamp when client sends `termsAccepted: true`.

### 2.6 Production Admin Bootstrap Path
- [ ] Create CLI script `backend/node-api/scripts/bootstrap-admin.js` (`npm run admin:bootstrap -- --email <email>`):
  - Validates `email` exists in local DB or creates an initial Admin record with `tenantId: null`, `role: Admin`, `cognitoId: <cognito-sub>`.
  - Verifies user email is verified in Cognito.
  - Only runnable via CLI with database administrative credentials.
- [ ] Support optional env allowlist `ADMIN_BOOTSTRAP_EMAILS="warry4958@gmail.com"` to allow designated email to sync as Admin during initial production launch.

### 2.7 Resolve All `// TODO(Part 2)` Markers
- [ ] Grep and resolve all 10 `// TODO(Part 2)` markers across:
  - `routes/auth.js` (sync rewrite, whitelist linking).
  - `routes/admin.js` (whitelist lookup by `allowedEmail`, tenantId, and admin ID).
  - `routes/projects.js` (project code generation via `nanoid.js`).
  - `routes/users.js` (`tenant.institutionName` formatting).
  - `force-sync.js` (tenant schema updates).

### 2.8 Security Hardening & CI
- [ ] Install and configure `helmet` for HTTP security headers in Express.
- [ ] Configure strict `cors` allowlist (reading from `FRONTEND_URL` env variable).
- [ ] Add rate limiting using `express-rate-limit`:
  - 10 requests / 15 minutes on `/api/auth/sync`.
  - 30 requests / minute on search routes.
- [ ] Create `.github/workflows/test.yml` to run Vitest tests on PRs and pushes.

### 2.9 Part 2 Automated Tests (`tests/auth.test.js` & `tests/rbac.test.js`)
- [ ] Both seeded dev accounts sync successfully (seed linking works).
- [ ] Forged `req.body.email` is ignored (email taken strictly from verified token).
- [ ] Token without `email_verified: true` is rejected (`401`).
- [ ] Whitelisted email creates Faculty user assigned to the whitelist's `tenantId`.
- [ ] Non-whitelisted email with unknown domain returns `403 UNRECOGNIZED_INSTITUTION`.
- [ ] Revoked faculty whitelist returns `403 ACCESS_REVOKED`.
- [ ] Deactivated user (`isActive: false`) with valid token returns `403` on all routes.
- [ ] User from suspended tenant returns `403 TENANT_SUSPENDED`.
- [ ] Concurrent sync requests claim whitelist atomically without duplicate user creation.
- [ ] Non-sync route accessed by un-synced Cognito token returns `401 NOT_SYNCED`.
- [ ] Non-admin user hitting `/api/admin/*` returns `403 FORBIDDEN`.
- [ ] Existing user name is not overwritten on sync if DB already contains custom profile name.

> **DONE WHEN (Part 2):**
> 1. `npm test` runs all Part 1 and Part 2 tests cleanly.
> 2. Non-admin users attempting to access `/api/admin/whitelist` or `/api/users` receive `403 FORBIDDEN`.
> 3. Frontend `apiClient.js` passes ID tokens and interceptor triggers modal on 403s without fallback.
> 4. Zero `// TODO(Part 2)` markers remain in `backend/node-api`.

---

## PART 3 — Admin Governance API & Admin UI (Slice A Demo)

### 3.1 Tenant Management Endpoints (`routes/admin.js`)
- [ ] `GET /api/admin/tenants` — list all institutions with active user counts and faculty counts.
- [ ] `POST /api/admin/tenants` — create tenant (`institutionName`, lowercase unique `emailDomain`). Audit log action `TENANT_CREATED`.
- [ ] `PATCH /api/admin/tenants/:id` — update `institutionName`, toggle `isActive`.
  - **Invariant:** Block changing `emailDomain` if tenant has existing registered users (`409 EMAIL_DOMAIN_LOCKED`). Audit log action `TENANT_UPDATED`.

### 3.2 Faculty Whitelist Management
- [ ] `GET /api/admin/faculty-whitelist?tenantId=&status=&search=` — filterable and paginated list.
- [ ] `POST /api/admin/faculty-whitelist`:
  - Validate email format, lowercase.
  - Reject (`409`) if email already whitelisted or belongs to existing User.
  - Domain must match `Tenant.emailDomain` (unless `ENFORCE_EDU_DOMAIN=false`).
  - Create entry with status `PENDING_REGISTRATION`, `addedByAdminId: req.dbUser.id`. Audit log.
- [ ] `PATCH /api/admin/faculty-whitelist/:id/revoke` — **single transaction**:
  - Update whitelist: `status = REVOKED`, `revokedAt = now()`.
  - If user exists: set `user.isActive = false`.
  - Cascade to adviser links: set open `PENDING` adviser requests to `CANCELLED`, `ACTIVE` links to `REMOVED`.
  - Projects **keep their workflow status** (no reset to unassigned).
  - Create in-app `Notification` for each affected project owner.
  - Audit log action `FACULTY_REVOKED`.

### 3.3 Admin User Management Endpoints (Paper Requirement)
- [ ] `GET /api/admin/users?tenantId=&role=&status=&q=` — paginated list of all users across institutions.
- [ ] `PATCH /api/admin/users/:id/status` — toggle user `isActive` status (`true` / `false`):
  - Invalidate active sessions, audit log action `USER_STATUS_TOGGLED`.
  - If deactivating Faculty: cascade cancel/remove open adviser links.

### 3.4 Admin Audit Log Viewer Endpoints (Paper Requirement)
- [ ] `GET /api/admin/audit-logs?tenantId=&actorId=&action=&from=&to=&page=&limit=`:
  - Query PostgreSQL `AuditLog` table (Phase 6 moves read path to DynamoDB GSI).
  - Include pagination metadata.
- [ ] `GET /api/admin/audit-logs/export` — export filtered audit trail as CSV for compliance audits.

### 3.5 Admin Adviser Override Endpoints
- [ ] `PUT /api/admin/projects/:id/adviser`:
  - Require mandatory `reason` string (`400` if missing).
  - Verify new adviser is active, registered Faculty belonging to the same tenant as the project.
  - Transaction: mark existing open link `CANCELLED`/`REMOVED`, create new `ACTIVE` link (`initiatedBy: ADMIN`).
  - Audit log action `ADMIN_ADVISER_ASSIGNED` with reason.
- [ ] `DELETE /api/admin/projects/:id/adviser`:
  - Require mandatory `reason` string.
  - Mark active link `REMOVED`. Project keeps its workflow status.
  - Audit log action `ADMIN_ADVISER_REMOVED` with reason.

### 3.6 Faculty Search API (Student Facing)
- [ ] `GET /api/faculty?q=`:
  - Minimum query length: 2 characters. Limit: 20 results.
  - Filter: `tenantId = req.dbUser.tenantId`, `role = Faculty`, `user.isActive = true`, `whitelist.status = REGISTERED`.
  - Return: `{ id, firstName, lastName, email }` only (never expose internal admin metadata).

### 3.7 Notifications Service Basics
- [ ] Create `backend/node-api/services/notificationService.js`:
  - `createNotification({ userId, type, title, body, data })`.
- [ ] `GET /api/me/notifications?page=&limit=` — paginated, sorted newest first.
- [ ] `PATCH /api/me/notifications/:id/read` — mark notification as read.
- [ ] `PATCH /api/me/notifications/read-all` — mark all notifications as read.

### 3.8 Frontend — Admin UI Implementation
Replace mock store [`frontend/src/stores/useAdminStore.js`](file:///c:/Acuity%20-%20Github/Acuity/frontend/src/stores/useAdminStore.js) with real API calls:
- [ ] **Tenants Management Tab:** List tenants with counts, add modal, edit/suspend toggles.
- [ ] **Faculty Whitelist Management Tab:** Tenant selection dropdown, table with status badges (`PENDING_REGISTRATION`, `REGISTERED`, `REVOKED`), date added, Revoke confirmation dialog.
- [ ] **User Management Tab:** Search users, filter by role/tenant, activate/deactivate user switch.
- [ ] **Audit Log Viewer Tab:** Searchable log table with timestamp, actor, action, tenant, IP, and CSV export button.
- [ ] Scope Decision: Admin Banners / Content Management deferred beyond pilot; simple system announcement badge if needed.

### 3.9 Part 3 Automated Tests (`tests/admin.test.js`)
- [ ] Non-admin calling any `/api/admin/*` endpoint returns `403 FORBIDDEN`.
- [ ] Creating duplicate whitelist email returns `409 CONFLICT`.
- [ ] Whitelist revoke executes atomically (deactivates user, cancels pending links, removes active links, notifies owners, preserves project workflow status).
- [ ] Admin adviser override without `reason` returns `400 BAD_REQUEST`.
- [ ] Faculty search enforces strict tenant isolation (cannot search or view faculty from other tenants).
- [ ] Changing `emailDomain` of a tenant with active users returns `409 EMAIL_DOMAIN_LOCKED`.
- [ ] User status deactivation prevents subsequent requests.

> **DONE WHEN (Part 3):**
> 1. All Part 3 automated tests pass cleanly.
> 2. Admin dashboard in frontend operates completely on real API endpoints (no mock data in `useAdminStore`).
> 3. Whitelist revocation cascade cleans up adviser links and notifies project owners.
> 4. Multi-tenant isolation verified across faculty search and tenant management.

---

## PART 4 — Adviser Linking & Project Workflow (Slice B)

### 4.1 Project State Machine & Submission Gate
Create `backend/node-api/utils/projectStateMachine.js`:
- [ ] Allowed status transitions:
  - `DRAFT → PROCESSING`
  - `PROCESSING → READY_FOR_REVIEW`
  - `READY_FOR_REVIEW → REVISION_REQUIRED`
  - `REVISION_REQUIRED → RESUBMITTED`
  - `RESUBMITTED → REVISION_REQUIRED`
  - `RESUBMITTED → APPROVED`
  - `READY_FOR_REVIEW → APPROVED`
- [ ] Helper `needsAdviser(projectId)`: returns `true` if project lacks an `ACTIVE` `ProjectAdviser` link.
- [ ] `POST /api/projects/:id/submit`:
  - Caller must be project owner or editor member.
  - State check: status must be `DRAFT`.
  - **Adviser Gate:** If `needsAdviser(projectId) === true` → return `409 { code: 'ADVISER_REQUIRED', error: 'An active faculty adviser must be linked before submitting for review' }`.
  - Transition status to `READY_FOR_REVIEW`, notify adviser, audit log.
- [ ] `POST /api/projects/:id/resubmit`:
  - State check: status must be `REVISION_REQUIRED`.
  - Transition to `RESUBMITTED`, notify adviser, audit log.

### 4.2 Student-Initiated Adviser Requests
- [ ] `POST /api/projects/:id/adviser-requests`:
  - Body: `{ adviserUserId }`.
  - Caller must be project owner (`403` if not owner).
  - Verify adviser is active, registered Faculty in the **same tenant** as the project.
  - Check open links: Reject with `409 CONFLICT` if a `PENDING` or `ACTIVE` link already exists.
  - Calculate `expiresAt = now() + ADVISER_REQUEST_TTL_DAYS (14 days)`.
  - Create `ProjectAdviser` row (`status: PENDING`, `initiatedBy: STUDENT`, `requestedByUserId: req.dbUser.id`).
  - Create in-app notification for faculty; audit log.
- [ ] `POST /api/adviser-requests/:id/cancel`:
  - Caller must be project owner.
  - Request must be in `PENDING` status.
  - Update `status = CANCELLED`.

### 4.3 Faculty Response Flow
- [ ] `GET /api/me/adviser-requests` — list pending requests for logged-in Faculty:
  - Lazy expiry check: If `expiresAt < now()` and status is `PENDING`, update to `EXPIRED` before returning.
- [ ] `POST /api/adviser-requests/:id/accept`:
  - Caller must be the assigned `adviserUserId`.
  - Re-verify `expiresAt > now()` (return `410 GONE` if expired).
  - **Prisma Transaction:**
    - Catch `P2002` (unique index constraint violation) if another request became active concurrently → return `409 CONFLICT`.
    - Update request: `status = ACTIVE`, `respondedAt = now()`.
    - Notify project owner and members.
    - Audit log action `ADVISER_REQUEST_ACCEPTED`.
- [ ] `POST /api/adviser-requests/:id/decline`:
  - Caller must be `adviserUserId`. Body: `{ reason }`.
  - Update: `status = DECLINED`, `reason`, `respondedAt = now()`.
  - Notify project owner; audit log.

### 4.4 Adviser-Initiated Path (Project Code Lookup)
- [ ] `POST /api/projects/by-code/:code/adviser-access-requests`:
  - Caller must be active Faculty.
  - Query project by `code` within caller's `tenantId` (**must return `404`** if code belongs to another tenant).
  - Create request: `status: PENDING`, `initiatedBy: ADVISER`.
  - Notify project owner.
- [ ] `POST /api/adviser-requests/:id/approve` & `/deny`:
  - Project owner approves or denies faculty-initiated request.

### 4.5 Project Collaborators (Clarification vs Join Tokens)
- [ ] Maintain direct collaborator addition `POST /api/projects/:id/members` within the same tenant.
- [ ] Document design decision: Direct member addition by email is approved for the pilot; token-based email invite links are deferred to post-pilot.

### 4.6 Frontend — Student & Faculty UI
- [ ] **Student Team Management:**
  - Search faculty within same tenant.
  - Display pending adviser request with countdown timer and Cancel button.
  - Display linked adviser card with active badge.
  - Block "Submit for Review" button with warning banner if no adviser is linked.
- [ ] **Faculty Advisee Dashboard:**
  - "Pending Advising Invitations" card with Accept / Decline modals.
  - "My Advisee Projects" list with project status pills.

### 4.7 Part 4 Automated Tests (`tests/adviser.test.js`)
- [ ] Cross-tenant adviser request returns `403` or `404`.
- [ ] Non-owner student requesting adviser returns `403 FORBIDDEN`.
- [ ] Duplicate pending adviser request returns `409 CONFLICT` (enforced by DB index).
- [ ] Concurrent accept race condition caught cleanly with `409 CONFLICT`.
- [ ] Expired request cannot be accepted (`410 GONE`).
- [ ] Owner cancellation frees project to request another adviser.
- [ ] Project code lookup enforces tenant isolation (unknown in different tenant).
- [ ] Revoked adviser preserves project workflow status (does not revert to DRAFT).
- [ ] Project submission blocked (`409 ADVISER_REQUIRED`) without an active adviser.

> **DONE WHEN (Part 4):**
> 1. All Part 4 tests pass cleanly.
> 2. Full student request → faculty accept/decline lifecycle executes via UI and API.
> 3. State machine strictly enforces active adviser presence before review submission.
> 4. Cross-tenant adviser linkage is impossible via either request path.

---

## PART 5 — Core Documentation & Capstone Corrections

- [ ] Create `docs/ARCHITECTURE.md` (multi-tenancy isolation model, ID token auth flow, component diagram).
- [ ] Create `docs/RBAC.md` (role × resource permission matrix, state transition table).
- [ ] Create `docs/ADVISER_LINKING.md` (state machine, request lifecycle, edge cases).
- [ ] Update Capstone Paper Panel Deviations section:
  - Table 3.5: AWS Credit-based Free Plan ($100 initial + $100 earned, 6-month validity) + Cognito 10k MAU.
  - Hardware: 1× EC2 `t3.medium` (4 GB RAM + 4 GB swap) running Docker Compose (replaces Table 3.4 8 GB server).
  - AI Engine: Local CPU inference in FastAPI container (replaces SageMaker always-on instance).
  - Database: Local Docker Postgres (dev) + EC2 Postgres / Supabase (pilot) (replaces paid RDS).
  - Audit Trail: On-Demand DynamoDB table (replaces provisioned capacity).

---

# MILESTONE 2: Cloud Pipelines, AI & Processing (Phases 6–11)

## PHASE 6 — AWS Foundation, SES Email & DynamoDB

- [ ] Multi-tier AWS Budgets alerts ($10, $25, $50) and IAM instance profile (no hardcoded keys).
- [ ] Purchase domain and configure DNS records.
- [ ] **SES Configuration:**
  - Verify domain identity, configure DKIM, SPF, and DMARC records.
  - Submit AWS SES sandbox removal request for production quota early.
- [ ] **Cognito → SES:** Switch User Pool email delivery from default (50/day) to verified SES identity.
- [ ] **DynamoDB Tables (`ap-southeast-2`):**
  - **Billing Mode:** Configure **On-Demand** (`PAY_PER_REQUEST`) to prevent burst write throttling.
  - `acuity_audit_logs`: PK `pk` (`<tenantId>|GLOBAL`), SK `sk` (`<ISO timestamp>#<uuid>`), GSI1 `actorId`, GSI2 `projectId`.
    - **IAM Policy:** Grant `dynamodb:PutItem` and `dynamodb:Query` on table AND index ARNs (`acuity_audit_logs/index/*`).
  - `acuity_ai_logs`: PK `imageId`, SK `<jobId>#<timestamp>`, TTL attribute `expiresAt` (90 days).
    - Provide evaluation export script before TTL deletion so research F1 metrics are preserved.
- [ ] Swap `auditLog()` helper implementation to write to DynamoDB; batch audit writes for annotation edits.
- [ ] Wire SES mailer module behind notification helper for transactional emails.

---

## PHASE 7 — S3 Presigned Upload Pipeline

- [ ] Private S3 bucket in `ap-southeast-2` with public access blocked, CORS enabled for frontend domain.
- [ ] `POST /api/projects/:id/images/presign`:
  - Verify caller is project owner or editor member.
  - Validate image count (1–10 per batch) and cumulative file size (≤ 50 MB total, ≤ 15 MB per file).
  - Generate S3 **Presigned POST** policies (preferred over PUT to enforce exact `content-length-range` server-side) with 15-minute expiration.
- [ ] Client uploads raw images directly to S3.
- [ ] `POST /api/projects/:id/images/confirm`:
  - Server verifies uploaded S3 objects: check size and inspect magic bytes (`image/jpeg`, `image/png`) to prevent extension spoofing. Delete oversized/invalid objects immediately.
  - Create `PetriDishImage` database rows.
- [ ] Generate web-resolution variants via `sharp` for canvas performance; S3 lifecycle rule purging unconfirmed uploads after 24 hours.
- [ ] Remove legacy `routes/uploads.js` and `multer-s3` dependency.

---

## PHASE 8 — Redis Job Queue & AI Worker Pipeline

- [ ] Redis configured in Docker Compose: internal Docker bridge network only, **no exposed port 6379 to host**, protected with password (`requirepass`).
- [ ] Job Queue with BullMQ:
  - Configure **3 retries with exponential backoff**.
  - Configure Dead Letter Queue (DLQ) for failed jobs.
- [ ] **Define `/detect` API Contract:**
  - Request: `{ imageUrl: "<short-lived-presigned-s3-get-url>", confidenceThreshold: 0.25, plateType: "standard" }`. (FastAPI worker receives pre-signed URL; no broad AWS credentials needed).
  - Response: `{ detections: [{ bbox: [ymin, xmin, ymax, xmax], confidence: 0.94, class: "colony" }], totalCount: 42, modelVersion: "sod-yolov8n-v1", latencyMs: 310 }`.
- [ ] Mock FastAPI `/detect` worker returning realistic bounding boxes and colony counts (simulating 2–4s inference).
- [ ] `AIProcessingJob` tracking model and status polling endpoint `GET /api/projects/:id/jobs/:jobId`.
- [ ] Log raw AI inference results to DynamoDB `acuity_ai_logs`.

---

## PHASE 9 — Canvas Annotations API & Research Data Schema

- [ ] Schema updates for `CFUAnnotation` and `PetriDishImage`:
  - **Pixel-Space Coordinates:** Store all bounding box coordinates and centers in **original image pixel space** (`naturalWidth` × `naturalHeight`), guaranteeing zero-drift across different display resolutions.
  - Add `isContaminated: Boolean @default(false)` and `isDiscarded: Boolean @default(false)` flags to sample/plate schema to support capstone research exclusions.
  - `source` enum: `AI | MANUAL | EDITED`.
- [ ] Endpoints for annotation CRUD and batch save:
  - `PUT /api/images/:id/annotations/batch`: atomic upsert/delete of annotation sets.
  - Concurrency handling: optimistic locking using `version` counter.
  - Audit log recorded **per batch save** (not per individual colony).
- [ ] Server-side metric calculations: total CFU, average colony area, size distribution histogram.
- [ ] Access control: Canvas is **strictly read-only** for Faculty advisers and for projects in `APPROVED` status.

---

## PHASE 10 — Real SOD-YOLOv8 Model & CPU Inference Optimization

- [ ] Train baseline SOD-YOLOv8 on public agar plate datasets (AGAR, Roboflow) using Kaggle / Colab free GPU tier.
- [ ] Fine-tune on local pilot dataset (50+ annotated Petri dish images).
- [ ] Evaluate model: target **F1 score ≥ 80%** against expert manual counts.
- [ ] Package `best.pt` / ONNX runtime into FastAPI Docker container with OpenCV pre-processing.
- [ ] Benchmark and optimize CPU inference latency on EC2 `t3.medium` (target < 3 seconds per standard plate image).

---

## PHASE 11 — Review Workflow, Reports & Academic Export

- [ ] Spatial canvas comments (`AnnotationComment` anchored to image pixel coordinates).
- [ ] Review endpoints:
  - `POST /api/projects/:id/review/request-revision` (mandatory notes).
  - `POST /api/projects/:id/review/approve` (locks project canvas permanently).
- [ ] Transactional SES email notifications sent on all review actions.
- [ ] **Academic Data Export:**
  - CSV export formatted specifically for SPSS and R (including colony counts, area distributions, and `isContaminated`/`isDiscarded` flags).
  - PDF Summary Report generation (project summary, representative plate images, AI vs manual count comparison, approval signature block).
- [ ] `ExportedReport` database tracking records.

---

# MILESTONE 3: Production Deployment & Pilot Readiness (Phase 12)

## PHASE 12 — EC2 Deployment & Pilot Launch

- [ ] Provision 1× EC2 `t3.medium` in Sydney (`ap-southeast-2`):
  - Configure 4 GB swap file (`/swapfile`).
  - Configure CloudWatch alarms for Budget, CPU Utilization, and CPU Credit Balance.
- [ ] Security Groups:
  - Inbound ports: 80 (HTTP), 443 (HTTPS).
  - Port 22 (SSH): strictly whitelisted to developer IP.
  - All internal ports (Postgres, Redis, FastAPI) closed to public internet.
- [ ] Docker Compose production setup:
  - Node.js API, FastAPI AI worker, Redis (internal), Nginx reverse proxy.
  - Automatic TLS certificate generation and renewal via Let's Encrypt / Certbot.
- [ ] Deploy Vite SPA to production static hosting (AWS Amplify or Nginx).
- [ ] Database setup:
  - Set production `DATABASE_URL` and `DIRECT_URL`.
  - Configure automated daily `pg_dump` backup script uploading encrypted dumps to private S3 bucket.
  - Execute and document a test database restore drill.
- [ ] Update Cognito User Pool:
  - Add production domain to Allowed Callback URLs and Sign-Out URLs.
  - Update Google OAuth redirect URIs.
- [ ] **Production Admin Provisioning:**
  - Execute `npm run admin:bootstrap -- --email <admin-email>` to establish initial production Admin account.
  - Verify Admin TOTP MFA setup.
- [ ] Production settings:
  - `ENFORCE_EDU_DOMAIN=true`.
  - Remove dev seed tenant (`gmail.com`).
  - Provision real pilot tenant (e.g., Adamson University) and initial faculty whitelist.
- [ ] Run end-to-end smoke test: login → faculty whitelist sync → project creation → image upload → mock AI detection → adviser review → approval → SPSS CSV export.
