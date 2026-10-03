# Acuity: A Multi-Tenant Web Platform for Automated CFU Counting, Morphological Measurement, and Data Translation

## 📖 Short Description

Acuity is an AI-driven multi-tenant web platform that acts as a centralized research hub for biologists and academic students looking to automate biological object detection, morphological measurements, visual annotations, and statistical data translation.

Designed as a modern web alternative to legacy software like ImageJ, it utilizes a SOD-YOLOv8 deep learning model alongside an interactive spatial-calibration canvas. The platform features secure multi-tenant data isolation and a human-in-the-loop correction workflow to ensure scientists can extract and format mathematical data that supports formal statistical analyses.

## ✨ Core Features

- **Automated Macroscopic Enumeration:** Utilizes SOD-YOLOv8 to instantly count Colony Forming Units (CFUs) on standard 90mm Petri dishes.
- **Interactive Annotation Workspace:** Powered by React Konva, allowing researchers to manually add, resize, or delete AI-generated detections.
- **Statistical Data Translation:** Single-click CSV exports formatted specifically for external statistical software like SPSS or R.
- **Multi-Tenant Architecture:** Secure logical separation using PostgreSQL Row-Level Security (RLS) and AWS Cognito to isolate different university laboratory cohorts.

## 🛠️ Technology Stack

**Frontend**

- React.js (Vite) & Tailwind CSS
- React Konva (HTML5 Canvas API)

**Backend & AI**

- Python (FastAPI)
- YOLOv8 (SOD-YOLOv8 Architecture) & OpenCV
- Node.js (Express.js) for tenant routing

**Infrastructure & Database**

- PostgreSQL (Amazon RDS) & Redis
- Amazon S3 Object Storage
- Docker & AWS EC2

## 🚀 Getting Started (For Developers)

### 1. Prerequisites
- **Node.js 18+** & **Docker Desktop** installed and running.
- Ensure your `.env` is configured in `backend/node-api/.env` (see `.env.example`).

### 2. Start Infrastructure (Docker)
From the repository root:
```bash
docker compose up -d
```
*This starts PostgreSQL on port `5432` and Redis on port `6379`.*

### 3. Install Dependencies & Initialize Database (First-time or Reset)
```bash
# 1. Install root & workspace dependencies
npm install

# 2. Run migrations and seed database
cd backend/node-api
npx prisma migrate dev
npx prisma db seed
cd ../..
```
> **Tip:** You can also run `npx prisma migrate reset --force` inside `backend/node-api` to wipe, re-migrate, and re-seed the test accounts in one step.

### 4. Running the Project (3 Terminals)

- **Terminal 1 (Backend API - Port 3000):**
  ```bash
  npm run start:api
  ```
  *(Or `cd backend/node-api && npm run dev` for auto-reloading)*

- **Terminal 2 (Frontend Web App - Port 5173):**
  ```bash
  npm run dev:frontend
  ```
  *(Or `cd frontend && npm run dev`)*

- **Terminal 3 (Prisma Studio - Database UI - Port 5555):**
  ```bash
  cd backend/node-api
  npx prisma studio
  ```
  *Opens `http://localhost:5555` to view and inspect Tenants, Users, Whitelist, and Projects.*

### 5. Running Automated Tests
To run the automated Vitest test suite against `acuity_test`:
```bash
npm run test:api
```
*(Or inside `backend/node-api`: `npm test`)*
