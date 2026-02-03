# 🚂 Railway Monorepo Deployment - Both Services Together

## 🎯 **Strategy: One Repository, Two Services**

Railway will automatically detect both services from your single repository and deploy them together!

---

## 🚀 **Quick Deployment Steps**

### **Step 1: Go to Railway**
1. Visit: https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub
4. Select repository: `Ai-Powered-Smart-Health-Management-System`

### **Step 2: Railway Auto-Detection**
Railway will automatically detect:
- ✅ **Python/Flask** in root directory (Backend)
- ✅ **Next.js** in `frontend/` directory (Frontend)

### **Step 3: Create Both Services**

#### **Service 1: Backend**
1. Railway shows "New Service Detected"
2. Click "Add Service"
3. Name it: `backend`
4. **Root Directory**: `/` (root)
5. **Start Command**: `gunicorn --bind 0.0.0.0:$PORT wsgi:app`

#### **Service 2: Frontend**  
1. Click "+ New" → "GitHub Repo" (same repo)
2. Name it: `frontend`
3. **Root Directory**: `frontend` ⚠️ **IMPORTANT**
4. **Start Command**: `npm start`

---

## 🔑 **Environment Variables**

### **Backend Service Variables:**
```bash
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=<GENERATE_STRONG_KEY>
DATABASE_URL=<YOUR_NEON_CONNECTION_STRING>
JWT_SECRET_KEY=<GENERATE_STRONG_KEY>
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000
GROQ_API_KEY=<YOUR_GROQ_KEY>
GEMINI_API_KEY=<YOUR_GEMINI_KEY>
FRONTEND_URL=${{frontend.RAILWAY_PUBLIC_DOMAIN}}
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
PORT=${{PORT}}
```

### **Frontend Service Variables:**
```bash
NEXT_PUBLIC_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
PORT=${{PORT}}
```

**✨ Notice**: We're using Railway's service references (`${{backend.RAILWAY_PUBLIC_DOMAIN}}`) to automatically link services!

---

## 📋 **Complete Deployment Checklist**

### **Before Starting:**
- [ ] Generate SECRET_KEY: `python -c "import secrets; print(secrets.token_hex(32))"`
- [ ] Generate JWT_SECRET_KEY: `python -c "import secrets; print(secrets.token_hex(32))"`
- [ ] Get Neon database connection string from https://console.neon.tech
- [ ] Have GROQ API key ready
- [ ] Have Gemini API key ready

### **Deployment Steps:**

1. [ ] **Create Railway Project**
   - Go to railway.app
   - Click "New Project"
   - Select your GitHub repo

2. [ ] **Deploy Backend Service**
   - Railway auto-detects Python
   - Set root directory: `/`
   - Add all backend environment variables
   - Use `${{frontend.RAILWAY_PUBLIC_DOMAIN}}` for FRONTEND_URL
   - Deploy

3. [ ] **Deploy Frontend Service**
   - Click "+ New" → Same GitHub repo
   - Set root directory: `frontend`
   - Add frontend environment variables
   - Use `${{backend.RAILWAY_PUBLIC_DOMAIN}}` for API URL
   - Deploy

4. [ ] **Verify Deployment**
   - Check both services are running
   - Test backend: `https://backend-xyz.railway.app/health`
   - Test frontend: `https://frontend-xyz.railway.app`

---

## 🏗️ **Project Structure on Railway**

```
Railway Project: AI Health System
│
├── 📦 Service: backend
│   ├── Root: /
│   ├── Runtime: Python
│   ├── Port: Auto-assigned
│   └── URL: https://backend-xyz.railway.app
│
└── 📦 Service: frontend
    ├── Root: /frontend
    ├── Runtime: Node.js
    ├── Port: Auto-assigned
    └── URL: https://frontend-xyz.railway.app
```

Both services are in the **same Railway project** but run independently!

---

## 🔗 **Service Linking (Automatic)**

Railway automatically links services using references:

**In Backend:**
```bash
FRONTEND_URL=${{frontend.RAILWAY_PUBLIC_DOMAIN}}
# Becomes: https://frontend-xyz.railway.app
```

**In Frontend:**
```bash
NEXT_PUBLIC_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
# Becomes: https://backend-xyz.railway.app
```

**Benefits:**
- ✅ No manual URL updates needed
- ✅ Automatic HTTPS
- ✅ Services communicate seamlessly
- ✅ Easy to manage

---

## ⚙️ **Detailed Configuration**

### **Backend Configuration**

**Detected Files:**
- `requirements.txt` → Installs Python dependencies
- `wsgi.py` → Entry point for Flask app
- `app.py` → Main Flask application

**Build Process:**
1. Railway detects Python
2. Installs dependencies from `requirements.txt`
3. Sets up environment variables
4. Starts with: `gunicorn --bind 0.0.0.0:$PORT wsgi:app`

### **Frontend Configuration**

**Detected Files:**
- `frontend/package.json` → Installs Node dependencies
- `frontend/next.config.js` → Next.js configuration

**Build Process:**
1. Railway detects Next.js
2. Runs `npm install`
3. Runs `npm run build`
4. Starts with: `npm start`

---

## 🎨 **Visual Deployment Flow**

```
┌─────────────────────────────────────────────┐
│           Your GitHub Repository             │
│   Ai-Powered-Smart-Health-Management-System │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│          Railway Platform                    │
│                                              │
│  ┌────────────────┐    ┌─────────────────┐ │
│  │ Backend Service│◄───┤Frontend Service │ │
│  │                │    │                 │ │
│  │ Flask/Python   │    │ Next.js/Node    │ │
│  │ Port: 8080     │    │ Port: 3000      │ │
│  └───────┬────────┘    └────────┬────────┘ │
│          │                      │          │
└──────────┼──────────────────────┼──────────┘
           │                      │
           ▼                      ▼
    ┌─────────────┐      ┌──────────────┐
    │  Neon DB    │      │   Users      │
    │ (External)  │      │  (Browser)   │
    └─────────────┘      └──────────────┘
```

---

## 💰 **Cost Breakdown**

**Railway Free Tier: $5/month credit**

- Backend Service: ~$2-3/month
- Frontend Service: ~$1-2/month
- **Total**: ~$3-5/month ✅ **Fits in free tier!**

**Neon Database**: Free tier (separate)

---

## 🐛 **Troubleshooting**

### **Problem: Railway only detects one service**
**Solution:**
1. Deploy backend first (auto-detected)
2. Then click "+ New" → "GitHub Repo"
3. Select same repository
4. Set different root directory for frontend

### **Problem: Frontend can't find backend**
**Solution:**
1. Use Railway service reference: `${{backend.RAILWAY_PUBLIC_DOMAIN}}`
2. Make sure both services are in same project
3. Check environment variables are set correctly

### **Problem: Build fails**
**Solution:**
1. Check Railway logs for specific error
2. Verify `requirements.txt` and `package.json` are correct
3. Ensure root directories are set properly

### **Problem: CORS errors**
**Solution:**
1. Backend FRONTEND_URL must match frontend domain
2. Use `${{frontend.RAILWAY_PUBLIC_DOMAIN}}` reference
3. Redeploy backend after frontend is deployed

---

## ✅ **Quick Start Commands**

### **Generate Keys:**
```bash
python -c "import secrets; print('SECRET_KEY:', secrets.token_hex(32)); print('JWT_SECRET_KEY:', secrets.token_hex(32))"
```

### **Test After Deployment:**
```bash
# Test backend
curl https://your-backend.railway.app/health

# Test frontend
curl https://your-frontend.railway.app
```

---

## 📱 **Access Your Deployed App**

After deployment:

**Frontend (User Access):**
```
https://frontend-xyz.railway.app
```
Share this URL with users!

**Backend (API):**
```
https://backend-xyz.railway.app
```
Used internally by frontend.

---

## 🎯 **Deployment Timeline**

1. **Setup Railway Project**: 2 minutes
2. **Deploy Backend**: 3-5 minutes
3. **Deploy Frontend**: 5-7 minutes
4. **Configure & Test**: 2-3 minutes

**Total Time**: ~15 minutes ⚡

---

## 🚀 **Ready to Deploy?**

### **Step-by-Step:**

1. **Open Railway**: https://railway.app
2. **Sign in** with GitHub
3. **Create New Project** → Select your repository
4. **Add Backend Service**:
   - Root: `/`
   - Add environment variables
   - Deploy
5. **Add Frontend Service**:
   - Click "+ New" → Same repo
   - Root: `frontend`
   - Add environment variables
   - Deploy
6. **Test** both services
7. **Done!** 🎉

---

## 📞 **Need Help?**

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check logs in Railway dashboard

---

**Your AI Smart Health Management System will be live in ~15 minutes!** 🏥✨

Both backend and frontend deployed together from one repository! 🚂
