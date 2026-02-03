# 🚀 Vercel Backend Deployment Guide

## Complete Guide to Deploy Flask Backend on Vercel

### ⚠️ Important Considerations

**Vercel Serverless Limitations:**
- ✅ Great for: API endpoints, lightweight operations
- ❌ Not ideal for: Long-running tasks, large file uploads, WebSockets
- **Max execution time:** 10 seconds (Hobby), 60 seconds (Pro)
- **Max payload:** 4.5MB
- **No persistent file system** (use external storage like S3, Cloudinary)

### 📋 Prerequisites

1. **Vercel Account:** Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository:** Your code must be on GitHub
3. **PostgreSQL Database:** Required (SQLite won't work on Vercel)
   - Recommended: [Supabase](https://supabase.com) (Free tier)
   - Alternative: [Neon](https://neon.tech), [Railway](https://railway.app)

---

## 🔧 Step 1: Update Configuration Files

### 1.1 Update `vercel.json`

Your current `vercel.json` is configured for frontend. Update it to:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ],
  "env": {
    "FLASK_CONFIG": "production"
  },
  "functions": {
    "api/index.py": {
      "maxDuration": 30
    }
  }
}
```

### 1.2 Verify `api/index.py`

Your `api/index.py` should be the entry point. Current file looks good, but ensure it exports `app`:

```python
#!/usr/bin/env python3
"""
Vercel serverless function entry point for Hospital Management System
"""

import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Set up environment variables for Vercel
os.environ.setdefault('FLASK_CONFIG', 'production')

try:
    # Import Flask app
    from hospital import create_app, db
    
    # Create Flask application
    app = create_app()
    
    # Initialize database for serverless
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database initialized")
        except Exception as e:
            print(f"⚠️ Database initialization warning: {e}")

except Exception as e:
    print(f"❌ Error: {e}")
    from flask import Flask, jsonify
    app = Flask(__name__)
    
    @app.route('/api/health')
    @app.route('/health')
    def health():
        return jsonify({"status": "error", "message": str(e)})

# Export for Vercel
# This is the WSGI application
```

---

## 🗄️ Step 2: Set Up PostgreSQL Database

### Option A: Supabase (Recommended - Free)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string:
   - Go to **Project Settings** → **Database**
   - Copy the **Connection String** (URI format)
   - Example: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

### Option B: Neon (Serverless PostgreSQL)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Create a PostgreSQL database
3. Copy the `DATABASE_URL`

---

## 🔐 Step 3: Configure Environment Variables

### 3.1 Required Environment Variables

Add these in **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**:

```bash
# Flask Configuration
FLASK_CONFIG=production
SECRET_KEY=your-super-secure-random-secret-key-min-32-chars
JWT_SECRET_KEY=your-super-secure-jwt-secret-key-min-32-chars

# Database (REQUIRED - Use PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# AI API Keys
GEMINI_API_KEY=your-gemini-api-key-here
GROQ_API_KEY=your-groq-api-key-here

# Email Configuration (Optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password

# File Upload (Optional - for production)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### 3.2 Generate Secure Keys

Run these commands locally to generate secure keys:

```bash
# For SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# For JWT_SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🚀 Step 4: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**

2. **Import Repository:**
   - Select your GitHub repository
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as root)
   - **Build Command:** Leave empty (or `pip install -r requirements.txt`)
   - **Output Directory:** Leave empty
   - **Install Command:** `pip install -r requirements.txt`

4. **Add Environment Variables:**
   - Click **"Environment Variables"**
   - Add all variables from Step 3
   - Make sure to add them for **Production**, **Preview**, and **Development**

5. **Deploy:**
   - Click **"Deploy"**
   - Wait for deployment to complete (2-5 minutes)

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd "c:\Users\HP\OneDrive\Desktop\PROJECTS\AI SMART Health MANAGEMENT SYSTEM"
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? ai-health-backend
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## ✅ Step 5: Test Your Deployment

### 5.1 Test Health Endpoint

```bash
# Replace with your Vercel URL
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Hospital Management System API is running"
}
```

### 5.2 Test Authentication

```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 5.3 Common Test URLs

- Health Check: `https://your-app.vercel.app/api/health`
- Login: `https://your-app.vercel.app/api/auth/login`
- Hospitals: `https://your-app.vercel.app/api/hospitals`
- AI Chat: `https://your-app.vercel.app/api/ai/chat`

---

## 🐛 Step 6: Troubleshooting

### Issue 1: "Internal Server Error" (500)

**Solution:**
1. Check Vercel Function Logs:
   - Go to **Vercel Dashboard** → **Your Project** → **Deployments**
   - Click on the latest deployment
   - Click **"Functions"** tab
   - Check logs for errors

2. Common causes:
   - Missing environment variables
   - Database connection issues
   - Import errors

### Issue 2: "Module Not Found" Error

**Solution:**
1. Ensure all dependencies are in `requirements.txt`
2. Redeploy the project

### Issue 3: Database Connection Failed

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Ensure PostgreSQL is accessible from external connections
3. Check database credentials

### Issue 4: CORS Errors

**Solution:**
Already configured in your Flask app with `Flask-CORS`. If issues persist, check:
```python
# In hospital/__init__.py
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### Issue 5: Function Timeout

**Solution:**
- Optimize slow database queries
- Use database indexes
- Consider moving long operations to background jobs
- Upgrade to Vercel Pro for 60s timeout

---

## 📊 Step 7: Monitor Your Deployment

### View Logs

1. **Real-time Logs:**
   ```bash
   vercel logs your-app.vercel.app
   ```

2. **Dashboard Logs:**
   - Vercel Dashboard → Your Project → Deployments → Functions

### Performance Monitoring

- Check function execution time
- Monitor database query performance
- Track API response times

---

## 🔄 Step 8: Update Your Frontend

After backend is deployed, update your frontend to use the new API URL:

### In `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

Or if frontend is on the same Vercel project:
```bash
NEXT_PUBLIC_API_URL=/api
```

---

## 🎯 Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use different keys for development and production
- ✅ Rotate keys regularly

### 2. Database
- ✅ Use connection pooling
- ✅ Add database indexes for frequently queried fields
- ✅ Regular backups

### 3. Security
- ✅ Use HTTPS only (Vercel provides this automatically)
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use prepared statements (SQLAlchemy does this)

### 4. File Uploads
- ✅ Use Cloudinary or S3 for file storage
- ✅ Don't store files on Vercel's filesystem (it's ephemeral)

---

## 🆘 Need Help?

### Check Vercel Documentation
- [Python on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### Common Commands

```bash
# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel remove your-app

# Pull environment variables
vercel env pull
```

---

## ✨ Success Checklist

- [ ] PostgreSQL database set up and accessible
- [ ] All environment variables added to Vercel
- [ ] `vercel.json` configured correctly
- [ ] `api/index.py` exports Flask app
- [ ] Deployed successfully to Vercel
- [ ] Health endpoint returns 200 OK
- [ ] Authentication works
- [ ] Database queries work
- [ ] Frontend connected to backend API
- [ ] CORS configured properly
- [ ] Logs show no errors

---

## 🎉 You're Done!

Your Flask backend is now deployed on Vercel! 

**Your API is available at:** `https://your-app.vercel.app/api`

**Next Steps:**
1. Test all API endpoints
2. Connect your frontend
3. Monitor logs for any issues
4. Set up custom domain (optional)
