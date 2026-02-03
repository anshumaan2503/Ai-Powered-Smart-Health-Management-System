# Vercel Environment Variables - Copy and Paste These

## 🔐 Required Variables (MUST ADD)

### Flask Configuration
FLASK_CONFIG=production
SECRET_KEY=your-super-secure-random-secret-key-min-32-chars-here
JWT_SECRET_KEY=your-super-secure-jwt-secret-key-min-32-chars-here

### Database (PostgreSQL - REQUIRED)
DATABASE_URL=postgresql://username:password@hostname:port/database_name

### AI API Keys
GEMINI_API_KEY=your-gemini-api-key-here
GROQ_API_KEY=your-groq-api-key-here

---

## 📧 Optional Variables (Email Functionality)

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password

---

## 🔑 How to Generate Secure Keys

Run these commands in your terminal to generate secure random keys:

```bash
# For SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# For JWT_SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🗄️ Database Setup Options

### Option 1: Supabase (Recommended - Free Tier)
1. Go to https://supabase.com
2. Create new project
3. Go to Project Settings → Database
4. Copy "Connection String" (URI format)
5. Replace [YOUR-PASSWORD] with your actual password

Example:
```
DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Option 2: Neon (Serverless PostgreSQL - Free Tier)
1. Go to https://neon.tech
2. Create new project
3. Copy connection string

Example:
```
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
```

### Option 3: Railway (Free Trial)
1. Go to https://railway.app
2. Create PostgreSQL database
3. Copy DATABASE_URL from variables

Example:
```
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

---

## 📋 How to Add Variables to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. For each variable:
   - **Name:** Variable name (e.g., SECRET_KEY)
   - **Value:** Variable value
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

### Method 2: Vercel CLI

```bash
# Add a single variable
vercel env add SECRET_KEY

# Pull environment variables to local
vercel env pull
```

---

## ✅ Checklist

Before deploying, make sure you have:

- [ ] Generated secure SECRET_KEY (32+ characters)
- [ ] Generated secure JWT_SECRET_KEY (32+ characters)
- [ ] Set up PostgreSQL database (Supabase/Neon/Railway)
- [ ] Copied DATABASE_URL from your database provider
- [ ] Have your GEMINI_API_KEY ready
- [ ] Have your GROQ_API_KEY ready
- [ ] (Optional) Set up Gmail app password for email
- [ ] Added ALL variables to Vercel dashboard
- [ ] Selected all environments (Production, Preview, Development)

---

## 🚀 Quick Deploy Commands

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project
cd "c:\Users\HP\OneDrive\Desktop\PROJECTS\AI SMART Health MANAGEMENT SYSTEM"

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 🧪 Test After Deployment

After deployment, test these endpoints:

```bash
# Replace YOUR-APP with your Vercel app name

# Health check
curl https://YOUR-APP.vercel.app/api/health

# Should return:
# {"status": "healthy", "message": "..."}
```

---

## ⚠️ Important Notes

1. **Never commit .env files** - They contain sensitive information
2. **Use different keys** for development and production
3. **PostgreSQL is required** - SQLite won't work on Vercel
4. **File uploads** - Use Cloudinary or S3 (Vercel filesystem is ephemeral)
5. **Function timeout** - Max 10s (Hobby) or 60s (Pro plan)

---

## 🆘 Troubleshooting

### If deployment fails:

1. **Check Vercel logs:**
   - Dashboard → Your Project → Deployments → Latest → Functions

2. **Common issues:**
   - Missing environment variables
   - Wrong DATABASE_URL format
   - Database not accessible from external connections

3. **View real-time logs:**
   ```bash
   vercel logs YOUR-APP.vercel.app
   ```

---

## 📞 Need Help?

- Vercel Documentation: https://vercel.com/docs
- Python on Vercel: https://vercel.com/docs/functions/serverless-functions/runtimes/python
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
