# AEGIS

AEGIS, Adaptive Emergency Guidance and Intelligence System, is a full-stack emergency department operations platform with ACUITY, Adaptive Clinical Urgency and Intelligence Triage, embedded as a clinical operations decision support layer.

## Stack

- React, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion, Recharts
- Node.js, Express, TypeScript
- MongoDB with Mongoose
- JWT authentication, RBAC, audit logging, and modular REST services

## Run locally

1. Copy environment files.
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Install dependencies with `npm install`.
3. Start MongoDB locally or set `MONGODB_URI` in `backend/.env` (Atlas works too).
4. Create an admin user via the Settings page or MongoDB directly — the database starts empty.
5. Start both apps (two terminals recommended on Windows):
   - `cd backend && npm run dev`
   - `cd frontend && npm run dev`
6. Open http://localhost:5173

## Notes

ACUITY is clinical decision support for operations and triage prioritization. It does not diagnose, prescribe, or replace clinician judgment.
