# 🚂 Railway Deployment Guide - Using Existing Neon PostgreSQL

## 📋 **Prerequisites**
- ✅ GitHub account with your repository
- ✅ Railway account (sign up at https://railway.app)
- ✅ **Neon PostgreSQL database** (already set up)
- ✅ Your Neon database connection string

---

## 🎯 **Deployment Strategy**

Since you already have Neon PostgreSQL:
```
Railway Project:
├── 🐍 Backend Service (Flask) → Connects to Neon DB
└── ⚛️ Frontend Service (Next.js) → Connects to Backend
```

**No need to create PostgreSQL on Railway!** ✨

---

## 🚀 **Step-by-Step Deployment**

### **Phase 1: Sign Up & Connect GitHub**

1. **Go to Railway**
   - Visit: https://railway.app
   - Click "Start a New Project"
   - Sign in with GitHub

2. **Authorize Railway**
   - Allow Railway to access your GitHub repositories
   - Select: `Ai-Powered-Smart-Health-Management-System`

---

### **Phase 2: Deploy Backend (Flask)**

1. **Create Backend Service**
   - Click "+ New" → "GitHub Repo"
   - Select your repository
   - Railway will auto-detect Python

2. **Configure Backend Service**
   - **Service Name**: `backend` or `flask-api`
   - **Root Directory**: `/` (leave as root)
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT wsgi:app`

3. **Set Environment Variables for Backend**
   
   Click on Variables tab and add these:

   ```bash
   # Flask Configuration
   FLASK_APP=app.py
   FLASK_ENV=production
   SECRET_KEY=<GENERATE_STRONG_KEY>
   
   # Database - USE YOUR NEON CONNECTION STRING
   DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
   
   # JWT Configuration
   JWT_SECRET_KEY=<GENERATE_STRONG_KEY>
   JWT_ACCESS_TOKEN_EXPIRES=3600
   JWT_REFRESH_TOKEN_EXPIRES=2592000
   
   # AI API Keys
   GROQ_API_KEY=<YOUR_GROQ_KEY>
   GEMINI_API_KEY=<YOUR_GEMINI_KEY>
   
   # CORS (Update after frontend deployment)
   FRONTEND_URL=https://your-frontend.railway.app
   
   # File Upload
   UPLOAD_FOLDER=uploads
   MAX_CONTENT_LENGTH=16777216
   
   # Port (Auto-set by Railway)
   PORT=${{PORT}}
   ```

   **⚠️ IMPORTANT:** Replace `DATABASE_URL` with your actual Neon connection string!

4. **Deploy Backend**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Copy the backend URL: `https://your-backend-xyz.railway.app`

---

### **Phase 3: Deploy Frontend (Next.js)**

1. **Create Frontend Service**
   - In the same Railway project, click "+ New"
   - Select "GitHub Repo" → Choose same repository
   - Railway will auto-detect Next.js

2. **Configure Frontend Service**
   - **Service Name**: `frontend` or `nextjs-app`
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT!**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

3. **Set Environment Variables for Frontend**

   ```bash
   # API Configuration
   NEXT_PUBLIC_API_URL=https://your-backend-xyz.railway.app
   
   # Environment
   NODE_ENV=production
   
   # Port (Auto-set by Railway)
   PORT=${{PORT}}
   ```

   **⚠️ IMPORTANT:** Replace `NEXT_PUBLIC_API_URL` with your actual backend URL from Phase 2!

4. **Deploy Frontend**
   - Click "Deploy"
   - Wait for build (~3-5 minutes)
   - Copy frontend URL: `https://your-frontend-xyz.railway.app`

---

### **Phase 4: Update CORS & Final Configuration**

1. **Update Backend CORS**
   - Go back to Backend service
   - Update `FRONTEND_URL` variable with your actual frontend URL
   - Click "Redeploy" (or it will auto-redeploy)

2. **Verify Everything**
   - Backend should be running
   - Frontend should be running
   - Both should be connected

---

## � **Environment Variables - Complete Reference**

### **Backend Variables (Copy-Paste Template)**

```bash
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=<PASTE_GENERATED_KEY_HERE>
DATABASE_URL=<PASTE_YOUR_NEON_CONNECTION_STRING_HERE>
JWT_SECRET_KEY=<PASTE_GENERATED_KEY_HERE>
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000
GROQ_API_KEY=<YOUR_GROQ_API_KEY>
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
FRONTEND_URL=<YOUR_FRONTEND_RAILWAY_URL>
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
PORT=${{PORT}}
```

### **Frontend Variables (Copy-Paste Template)**

```bash
NEXT_PUBLIC_API_URL=<YOUR_BACKEND_RAILWAY_URL>
NODE_ENV=production
PORT=${{PORT}}
```

---

## � **Generate Secret Keys**

Run this command to generate secure keys:

```bash
python -c "import secrets; print('SECRET_KEY:', secrets.token_hex(32)); print('JWT_SECRET_KEY:', secrets.token_hex(32))"
```

Or run this in Python:
```python
import secrets
print("SECRET_KEY:", secrets.token_hex(32))
print("JWT_SECRET_KEY:", secrets.token_hex(32))
```

---

## � **Where to Find Your Neon Connection String**

1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Click on "Connection Details"
4. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

---

## ✅ **Deployment Checklist**

### **Before Deploying:**
- [ ] Latest code pushed to GitHub
- [ ] Neon database connection string ready
- [ ] GROQ API key ready
- [ ] Gemini API key ready
- [ ] Generated SECRET_KEY and JWT_SECRET_KEY

### **Deployment Steps:**
1. [ ] Create Railway project
2. [ ] Deploy backend service
3. [ ] Add all backend environment variables (including Neon DATABASE_URL)
4. [ ] Wait for backend to deploy
5. [ ] Copy backend URL
6. [ ] Deploy frontend service (set root directory to `frontend`)
7. [ ] Add frontend environment variables
8. [ ] Wait for frontend to deploy
9. [ ] Copy frontend URL
10. [ ] Update backend's FRONTEND_URL
11. [ ] Test the application

### **After Deployment:**
- [ ] Test login (admin/patient)
- [ ] Test appointment booking
- [ ] Test AI chatbot
- [ ] Test file uploads
- [ ] Check Railway logs for errors

---

## 🐛 **Troubleshooting**

### **Backend Won't Start**

**Problem: Database connection failed**
```
Solution: 
1. Verify Neon connection string is correct
2. Ensure it includes ?sslmode=require
3. Check Neon database is active
4. Test connection locally first
```

**Problem: Module not found**
```
Solution:
1. Check requirements.txt is in root directory
2. Ensure all dependencies are listed
3. Check Railway build logs
```

### **Frontend Build Fails**

**Problem: Can't find package.json**
```
Solution:
1. Set Root Directory to "frontend" in Railway
2. Verify package.json exists in frontend folder
3. Check Railway build logs
```

**Problem: API calls return 404**
```
Solution:
1. Verify NEXT_PUBLIC_API_URL is correct
2. Must use https://
3. No trailing slash
4. Backend must be deployed first
```

### **CORS Errors**

**Problem: Frontend can't connect to backend**
```
Solution:
1. Update FRONTEND_URL in backend
2. Redeploy backend
3. Check browser console for exact error
4. Verify URLs don't have trailing slashes
```

---

## � **Your Deployment Architecture**

```
┌─────────────────────────────────────────┐
│         Railway Project                  │
│                                          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Backend (Flask)│  │Frontend (Next) │ │
│  │ Port: Auto     │  │ Port: Auto     │ │
│  │ URL: railway   │  │ URL: railway   │ │
│  └────────┬───────┘  └───────┬────────┘ │
│           │                   │          │
└───────────┼───────────────────┼──────────┘
            │                   │
            │                   │
            ▼                   ▼
    ┌───────────────┐   ┌──────────────┐
    │  Neon PostgreSQL  │   │  Users/Browser  │
    │  (External)    │   │                │
    └───────────────┘   └──────────────┘
```

---

## 💰 **Railway Pricing**

- **Free Tier**: $5 credit/month
- **Your Usage**: 
  - Backend: ~$3-4/month
  - Frontend: ~$1-2/month
  - **Total**: ~$4-6/month (fits in free tier!)

**Neon Database**: Free tier (separate from Railway)

---

## 🎯 **Quick Deployment Summary**

1. **Sign up** on Railway
2. **Connect** GitHub repo
3. **Deploy Backend**:
   - Add Neon DATABASE_URL
   - Add API keys
   - Deploy
4. **Deploy Frontend**:
   - Set root to `frontend`
   - Add backend URL
   - Deploy
5. **Update CORS** in backend
6. **Test** everything!

---

## � **Ready to Deploy?**

Follow these steps in order:

1. Open Railway: https://railway.app
2. Have this guide open
3. Have your Neon connection string ready
4. Generate secret keys
5. Follow Phase 1 → Phase 2 → Phase 3 → Phase 4
6. Test your deployed app!

---

## 📞 **Need Help?**

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Neon Docs**: https://neon.tech/docs

---

**Good luck with your deployment! 🎉**

Your AI Smart Health Management System will be live soon! �✨
