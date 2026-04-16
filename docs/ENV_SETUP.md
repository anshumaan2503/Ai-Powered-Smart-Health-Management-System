# 🏥 Environment & Deployment Setup Guide

This guide consolidates all deployment and environment variable configurations for Medicare Pro.

## 🔑 Core Environment Variables
Ensure the following are set in your `.env` file (local) or your deployment platform (Vercel, Railway, Render).

| Variable | Description | Example |
|----------|-------------|---------|
| `FLASK_CONFIG` | Backend execution mode | `development` or `production` |
| `SECRET_KEY` | Flask session secret | `your-secure-random-string` |
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@host:5432/db` |
| `GROQ_API_KEY` | API Key for LLaMA AI services | `gsk_...` |
| `GEMINI_API_KEY` | API Key for Gemini AI services | `AIza...` |
| `JWT_SECRET_KEY` | Secret for JWT Tokens | `another-secure-random-string` |
| `NEXT_PUBLIC_API_URL` | Frontend link to backend | `http://localhost:5000` |

---

## 🚀 Deployment Platforms

### 🌍 Vercel (Frontend & Serverless Backend)
1. **Frontend:** Point Vercel to the `frontend/` directory.
2. **Backend:** If deploying the Flask API as a serverless function, ensure `vercel.json` exists in the root and points to `api/index.py`.
3. **Environment Variables:** Add all variables from the table above in Vercel Dashboard Settings.

### 🛤️ Railway (Full Stack Deployment)
Railway is ideal for deploying the persistent Flask server and PostgreSQL database.
1. Use the `railway-build.sh` script for custom build logic.
2. Ensure `Procfile` is in the root to define the run command (e.g., `web: gunicorn wsgi:app`).

### 💠 Render (Alternative Backend)
Render provides powerful managed services for long-running Flask processes.
1. Connect your GitHub repository.
2. Set "Build Command" to `pip install -r requirements.txt`.
3. Set "Start Command" to `gunicorn wsgi:app`.

---

## 🛠️ Maintenance Scripts
Located in the `scripts/` directory:
- `db_reset.py`: Wipes and reinitializes the database.
- `create_dummy_patients.py`: Populates the system for testing.
- `update_api_key.py`: Helper script to update AI credentials.

---
> [!NOTE]
> For detailed instructions on specific platforms, refer to the legacy files in the `docs/` folder (moved from root).
