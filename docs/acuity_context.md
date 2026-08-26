# SYSTEM CONTEXT: PROJECT ACUITY (BACKEND)

Please ingest this architectural context for our project. **DO NOT generate any code, files, or scaffolding yet. Just acknowledge that you have received and
understood these constraints and await my next prompt.**

## 1. Project Identity

- **Name:** Acuity: A Multi-Tenant Web Platform for Automated CFU Counting, Morphological Measurement, and Data Translation.
- **Purpose:** A centralized SaaS for biologists to automate macroscopic CFU counting on 90mm Petri dishes, measure morphology, and export statistical CSVs
  for SPSS/R.

## 2. Core Tech Stack (Microservice Architecture)

- **Primary API Server:** Node.js + Express.js (Handles REST routing, multi-tenant logic, and WebSockets).
- **AI Microservice:** Python 3.12.10 + FastAPI (Strictly handles OpenCV preprocessing, PyTorch/CUDA, and SOD-YOLOv8).
- **Databases:** PostgreSQL (Primary relational/multi-tenant data) and Amazon DynamoDB (Audit trails & raw AI logs).
- **Infrastructure:** Redis 8.8 (Background task queue), AWS S3 (Image storage via boto3), AWS Cognito (JWT Auth & OTP).

## 3. Mandatory Architectural Patterns

- **Multi-Tenant Data Isolation:** PostgreSQL queries must enforce strict `project_id` foreign key filtering or Row-Level Security (RLS). S3 uses path-prefix isolation.
- **Presigned URL Direct-Upload:** The backend MUST NOT process raw 50MB image uploads directly. It generates AWS S3 Presigned URLs for direct-to-cloud client uploads.
- **Asynchronous Inference Worker Pattern:** Images are pushed to the Redis queue. A Python background worker runs OpenCV checks, executes SOD-YOLOv8 inference, and saves coordinates to PostgreSQL.
- **Human-in-the-Loop & Soft Deletes:** AI baseline bounding boxes are immutable. Manual canvas edits are saved as a separate layer (soft deletes) with timestamped audit logs sent to DynamoDB.

**ACTION REQUIRED:** Reply ONLY with a brief 1-sentence acknowledgment (e.g., "Context ingested.") to save token quota.
