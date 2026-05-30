# Deploying AEGIS to Render

AEGIS deploys as a **single Render web service** that serves the Express API and
the built React frontend from one origin. Same-origin means auth cookies and API
calls work with zero cross-site/CORS configuration.

MongoDB is **not** part of this service — Render no longer offers managed MongoDB.
Use a free MongoDB Atlas cluster.

---

## 1. MongoDB Atlas (one time)

1. Create a free cluster at https://www.mongodb.com/atlas .
2. Database Access → add a database user (username + password).
3. Network Access → allow `0.0.0.0/0` (or Render's outbound IPs).
4. Copy the connection string and append the db name, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/aegis?retryWrites=true&w=majority`

## 2. Push to GitHub

From the project root:

```bash
git init
git add .
git commit -m "AEGIS: deploy-ready (single Render service)"
git branch -M main
# Create the repo on github.com first, then:
git remote add origin https://github.com/<you>/aegis.git
git push -u origin main
```

`.env` is gitignored, so your local secrets are not pushed.

## 3. Create the Render service

Either method works:

**Blueprint (recommended):** Render dashboard → New → Blueprint → pick your repo.
Render reads `render.yaml` and provisions the service.

**Manual:** New → Web Service → connect repo, then set:
- Runtime: Node
- Build command: `npm install --include=dev && npm run build`
- Start command: `node backend/dist/server.js`
- Health check path: `/health`

## 4. Environment variables (Render dashboard)

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | a long random string (Blueprint auto-generates one) |
| `JWT_EXPIRES_IN` | `2h` |
| `COOKIE_SECURE` | `true` |
| `VITE_API_URL` | `/api` |
| `MONGODB_URI` | your Atlas connection string |
| `ANTHROPIC_API_KEY` | optional (ACUITY uses its rule engine if unset) |

`FRONTEND_URL` and `CORS_ORIGIN` are not required — they default to Render's
injected `RENDER_EXTERNAL_URL`.

## 5. Create the first login

The database starts empty and there is no public sign-up, so create the first
admin directly against Atlas. Run locally with your Atlas URI:

```bash
cd backend
MONGODB_URI="<your atlas uri>" node --input-type=module -e '
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
await mongoose.connect(process.env.MONGODB_URI);
const passwordHash = await bcrypt.hash("ChangeMe_LongPassword123", 12);
await mongoose.connection.collection("users").insertOne({
  name: "Admin", email: "admin@local", passwordHash, role: "admin",
  department: "Emergency Department", active: true, failedLoginAttempts: 0,
  createdAt: new Date(), updatedAt: new Date()
});
console.log("Admin created: admin@local"); await mongoose.disconnect();
'
```

Then open the Render URL and log in with `admin@local` / your chosen password.

## Notes

- Free web services sleep after ~15 min idle; the first request after that takes
  ~30–60s to wake.
- If a build ever fails with `Cannot find module @rollup/rollup-linux-...`,
  that's the npm optional-dependency bug — a clean install on Render's Linux
  fixes it automatically (it only happens when `node_modules` is copied across
  operating systems).
