# 🚀 Deploy Backend to Vercel - Quick Guide

## You Already Have Environment Variables from Render! ✅

Since you've already deployed to Render, you can **copy the same environment variables** to Vercel.

---

## 📋 Step 1: Copy Your Environment Variables from Render

From your screenshot, I can see you have:

```bash
CORS_ORIGINS=management-backend-04cf.onrender.com
DATABASE_URL=postgresql://ai_powered_4rdb_user@dpg-ctvqcq5ds78s73fhqjkg-a.oregon-postgres.render.com/ai_powered_4rdb
FLASK_CONFIG=production
FLASK_ENV=production
FRONTEND_URL=management-frontend-8n4f.onrender.com
GEMINI_API_KEY=gAIz...SyBQkF5g3o37SuDyXpG0VPiQMBULn_zY2WI
GROQ_API_KEY=gsk_...3uawsJVXQBBu_R7Gx...
JWT_SECRET_KEY=wD7...3uawsJVXQBBu_R7Gx...
```

---

## 🔧 Step 2: Add Variables to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. **Go to Vercel:**
   - Visit https://vercel.com/dashboard
   - Click **"Add New..."** → **"Project"**

2. **Import Your GitHub Repository:**
   - Select your repository: `anshumaan2503/Ai-Powered-Smart-Health-Management-System`
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset:** Other (or Flask)
   - **Root Directory:** `./` (keep as root)
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty

4. **Add Environment Variables:**
   
   Click **"Environment Variables"** and add these one by one:

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `FLASK_CONFIG` | `production` | All (Production, Preview, Development) |
   | `FLASK_ENV` | `production` | All |
   | `SECRET_KEY` | Generate new (see below) | All |
   | `JWT_SECRET_KEY` | `wD7...` (copy from Render) | All |
   | `DATABASE_URL` | `postgresql://ai_powered_4rdb_user@dpg-ctvqcq5ds78s73fhqjkg-a.oregon-postgres.render.com/ai_powered_4rdb` | All |
   | `GEMINI_API_KEY` | `AIzaSyBQkF5g3o37SuDyXpG0VPiQMBULn_zY2WI` | All |
   | `GROQ_API_KEY` | `gsk_...` (copy from Render) | All |
   | `CORS_ORIGINS` | `*` (or your Vercel domain after deployment) | All |
   | `FRONTEND_URL` | Will be your Vercel frontend URL | All |

   **⚠️ Important:** For each variable, make sure to select **all three environments**: Production, Preview, and Development

5. **Generate SECRET_KEY:**
   
   Run this in your terminal:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   
   Copy the output and use it as your `SECRET_KEY`

6. **Click Deploy:**
   - Vercel will build and deploy your backend
   - Wait 2-5 minutes for deployment to complete

---

## 🎯 Step 3: Test Your Deployment

After deployment completes, you'll get a URL like: `https://your-app.vercel.app`

### Test the health endpoint:

```bash
# Replace with your actual Vercel URL
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Hospital Management System API is running"
}
```

---

## 🔄 Alternative: Deploy via Vercel CLI

If you prefer using the command line:

```bash
# 1. Install Vercel CLI (if not installed)
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Navigate to your project
cd "c:\Users\HP\OneDrive\Desktop\PROJECTS\AI SMART Health MANAGEMENT SYSTEM"

# 4. Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? ai-health-backend (or your choice)
# - Directory? ./ (press Enter)
# - Override settings? No

# 5. Add environment variables via CLI
vercel env add FLASK_CONFIG
# Enter: production

vercel env add SECRET_KEY
# Paste your generated secret key

vercel env add JWT_SECRET_KEY
# Paste from Render

vercel env add DATABASE_URL
# Paste from Render

vercel env add GEMINI_API_KEY
# Paste from Render

vercel env add GROQ_API_KEY
# Paste from Render

# 6. Deploy to production
vercel --prod
```

---

## 📝 Important Notes

### 1. Database Connection
✅ **Good news:** You can use the **same PostgreSQL database** from Render!

The `DATABASE_URL` from Render will work on Vercel too. No need to create a new database.

### 2. CORS Configuration
After deployment, update `CORS_ORIGINS` to include your Vercel domain:

```bash
CORS_ORIGINS=your-app.vercel.app,management-backend-04cf.onrender.com
```

### 3. Frontend URL
Update `FRONTEND_URL` to your Vercel frontend URL once you deploy the frontend.

---

## 🐛 Troubleshooting

### Issue: "Internal Server Error"

**Check Vercel Logs:**
1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** → Click latest deployment
4. Click **"Functions"** tab
5. Look for error messages

### Issue: "Database Connection Failed"

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Make sure your Render PostgreSQL allows external connections (it should by default)
3. Check if the database is running on Render

### Issue: "Module Not Found"

**Solution:**
1. Make sure all dependencies are in `requirements.txt`
2. Redeploy the project

---

## ✅ Quick Checklist

Before deploying:

- [ ] GitHub repository is up to date
- [ ] `vercel.json` is configured (already done ✅)
- [ ] `api/index.py` exists (already done ✅)
- [ ] `requirements.txt` has all dependencies (already done ✅)
- [ ] Generated new `SECRET_KEY`
- [ ] Have all environment variables from Render ready
- [ ] Ready to add variables to Vercel

After deploying:

- [ ] Deployment successful
- [ ] Health endpoint returns 200 OK
- [ ] Can access `/api/health`
- [ ] Database connection works
- [ ] No errors in Vercel logs

---

## 🎉 You're Ready!

Your backend is already configured for Vercel. Just:

1. **Import your GitHub repo** to Vercel
2. **Copy environment variables** from Render to Vercel
3. **Deploy!**

The same database and API keys will work on both platforms.

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your GitHub Repo:** https://github.com/anshumaan2503/Ai-Powered-Smart-Health-Management-System
- **Vercel Docs:** https://vercel.com/docs

---

## 💡 Pro Tip

You can run **both Render and Vercel** deployments simultaneously:
- **Render:** As your primary backend
- **Vercel:** As a backup or for testing

They'll use the same database, so data stays in sync!
