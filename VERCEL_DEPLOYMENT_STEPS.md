# Vercel Deployment Guide - Step by Step

## ✅ Step 1: Code Pushed to GitHub
Your code has been successfully pushed to:
https://github.com/anshumaan2503/Ai-Powered-Smart-Health-Management-System

## 📋 Step 2: Prepare Environment Variables

You'll need these environment variables in Vercel:

### AI Service Keys (REQUIRED)
- **GEMINI_API_KEY** - Get from [Google AI Studio](https://aistudio.google.com)
- **GROQ_API_KEY** - Get from [Groq Console](https://console.groq.com)

### Flask Configuration (REQUIRED)
- **SECRET_KEY** - Generate a random string (e.g., `openssl rand -hex 32`)
- **JWT_SECRET_KEY** - Generate a random string (e.g., `openssl rand -hex 32`)
- **FLASK_CONFIG** - Set to `production`

### Database (OPTIONAL - for persistence)
- **DATABASE_URL** - PostgreSQL connection string (if you want persistent database)
  - Format: `postgresql://user:password@host:port/database`
  - Recommended: Use Vercel Postgres or Railway.app

### Frontend (OPTIONAL)
- **NEXT_PUBLIC_API_URL** - Leave empty or set to `/api` for relative URLs

## 🚀 Step 3: Deploy on Vercel

### Option A: Via Vercel Web Interface (Easiest)

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import your repository: `Ai-Powered-Smart-Health-Management-System`
4. Configure:
   - **Framework Preset**: Next.js (or Other)
   - **Root Directory**: `./` (or leave as default)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/.next`
5. Click **"Environment Variables"** and add:
   ```
   GEMINI_API_KEY=your-key-here
   GROQ_API_KEY=your-key-here
   SECRET_KEY=random-secret-key
   JWT_SECRET_KEY=random-jwt-key
   FLASK_CONFIG=production
   NEXT_PUBLIC_API_URL=/api
   ```
6. Click **"Deploy"**
7. Wait for build to complete

### Option B: Via Vercel CLI (Advanced)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to project directory
cd "path/to/project"

# 3. Deploy
vercel

# 4. Follow prompts:
#    - Link to GitHub repo
#    - Set production environment
#    - Add environment variables when prompted

# 5. Set production environment variables
vercel env add GEMINI_API_KEY production
vercel env add GROQ_API_KEY production
vercel env add SECRET_KEY production
vercel env add JWT_SECRET_KEY production
vercel env add FLASK_CONFIG production
```

## 🔑 How to Get API Keys

### Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com)
2. Click **"Get API Key"**
3. Click **"Create API Key"**
4. Copy the key

### Groq API Key
1. Visit [Groq Console](https://console.groq.com)
2. Sign in or create account
3. Go to **API Keys**
4. Create new API key
5. Copy the key

### Generate Random Secret Keys

**On Linux/Mac:**
```bash
openssl rand -hex 32  # For both SECRET_KEY and JWT_SECRET_KEY
```

**On Windows PowerShell:**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## 📦 Project Structure for Vercel

```
project/
├── api/
│   └── index.py          # Python backend entry point
├── frontend/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── package.json
│   ├── next.config.js
│   └── tailwind.config.js
├── hospital/             # Python Flask modules
│   ├── routes/
│   ├── models/
│   ├── services/
│   └── __init__.py
├── vercel.json          # Vercel configuration
├── requirements.txt     # Python dependencies
└── run.py              # Local Flask server
```

## 🔄 Deployment Process on Vercel

1. **GitHub Integration**: Vercel watches your repository
2. **Build Stage**:
   - Installs Python dependencies from `requirements.txt`
   - Builds Next.js frontend
   - Bundles everything
3. **Deployment Stage**:
   - Frontend served from CDN
   - Python API available at `/api/*` routes
   - Automatic SSL certificate
4. **Live**: Your app is live at `your-project.vercel.app`

## ✅ Testing After Deployment

### Test Frontend
- Visit `https://your-project.vercel.app`
- Check if the chatbot page loads

### Test AI Chatbot
- Go to the AI Chatbot page
- Send a test message like: "What should I eat for a healthy heart?"
- Verify you get a response

### Test API Directly
```bash
curl -X POST https://your-project.vercel.app/api/public/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

## 🐛 Troubleshooting

### Build Fails
- Check logs in Vercel dashboard
- Ensure all dependencies in `requirements.txt` are Python 3.9+ compatible
- Verify `frontend/package.json` has all dependencies

### API Returns 500 Error
- Check environment variables are set correctly
- Verify API keys are valid
- Check Vercel function logs for error details

### Frontend Shows 404
- Verify `next.config.js` is configured correctly
- Check build output includes `.next` directory

### Chatbot Not Responding
- Verify `GEMINI_API_KEY` and `GROQ_API_KEY` are set
- Check if keys have quota available
- Look at Vercel logs for API errors

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Python Support](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python)
- [Next.js Deployment](https://nextjs.org/learn/basics/deploying-nextjs-app)
- [Flask on Serverless](https://flask.palletsprojects.com/en/latest/)

## ⏱️ Typical Deployment Time

- First deployment: 5-10 minutes
- Subsequent deployments: 2-5 minutes
- Updates from GitHub: Automatic (same time as above)

---

**Status**: ✅ Code is on GitHub and ready for Vercel deployment!

Next step: Go to [Vercel.com](https://vercel.com) and import your GitHub repository.
