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

### 1. Initial Setup

Make sure you have Node.js 18+ and Python 3.12+ installed. Run the root install to setup the workspaces:

```bash
npm run install:all
```

### 2. Downloading AI Weights (Required)

Since our PyTorch and YOLOv8 models are too large for Git, they are not included when you clone this repo. You **must** download them manually before running the AI microservice.

Run the provided download script from your terminal:

```bash
cd backend/python-ai
python scripts/download_weights.py
```

_This script will fetch the latest weights and place them securely inside the ignored `ml_core/base_weights/` directory._
