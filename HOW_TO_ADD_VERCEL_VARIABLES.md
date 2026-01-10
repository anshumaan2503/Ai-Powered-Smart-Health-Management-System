# 🚀 How to Add These Variables to Vercel

## Quick Start (2 minutes)

### Method 1: Web Interface (Easiest)

1. **Go to your Vercel project**: https://vercel.com/dashboard
2. **Click on your project**: "Ai-Powered-Smart-Health-Management-System"
3. **Go to Settings**: Click "Settings" tab
4. **Select Environment Variables**: Click on "Environment Variables"
5. **Add Each Variable**:
   - Click "Add New"
   - Copy the key from `VERCEL_ENV_SETUP.txt`
   - Paste the value
   - Select "Production" as target
   - Click "Save"

**Variables to add (in order):**

| Key | Value | Instructions |
|-----|-------|--------------|
| FLASK_CONFIG | production | Just paste as is |
| SECRET_KEY | your-secret-key | See "Generate Random Keys" below |
| JWT_SECRET_KEY | your-jwt-key | See "Generate Random Keys" below |
| GEMINI_API_KEY | your-key | Get from https://aistudio.google.com |
| GROQ_API_KEY | your-key | Get from https://console.groq.com |
| NEXT_PUBLIC_API_URL | /api | Just paste as is |
| DATABASE_URL | postgresql://... | Optional - only if using PostgreSQL |
| MAIL_SERVER | smtp.gmail.com | Optional |
| MAIL_PORT | 587 | Optional |
| MAIL_USE_TLS | true | Optional |
| MAX_CONTENT_LENGTH | 16777216 | Just paste as is |

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Go to your project directory
cd "path/to/project"

# Add variables one by one
vercel env add FLASK_CONFIG production
vercel env add SECRET_KEY your-secret-key
vercel env add JWT_SECRET_KEY your-jwt-key
vercel env add GEMINI_API_KEY your-gemini-key
vercel env add GROQ_API_KEY your-groq-key
# ... and so on
```

## Generate Random Keys

### Option 1: Online Generator
- Visit: https://generate-random.org/encryption-key-generator
- Select: "256-bit" or "32 bytes"
- Generate and copy both keys

### Option 2: PowerShell (Windows)
```powershell
$key = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host $key
```

### Option 3: OpenSSL (Linux/Mac/Git Bash)
```bash
openssl rand -hex 32
openssl rand -hex 32
```

### Option 4: Python
```python
import secrets
secrets.token_hex(32)
```

## Critical Variables Explained

### FLASK_CONFIG
- **Value for Vercel**: `production`
- **Why**: Tells Flask to run in production mode with optimizations

### SECRET_KEY & JWT_SECRET_KEY
- **Why needed**: Required for Flask session encryption
- **Requirements**: Minimum 32 characters, random
- **Note**: Keep different from development keys
- **How to generate**: See "Generate Random Keys" above

### GEMINI_API_KEY & GROQ_API_KEY
- **Already in VERCEL_ENV_SETUP.txt**: Yes
- **Get from**: 
  - Gemini: https://aistudio.google.com
  - Groq: https://console.groq.com
- **These are YOUR actual keys**: Keep safe!

### NEXT_PUBLIC_API_URL
- **Value**: `/api`
- **Why**: Makes frontend API calls work on Vercel

### DATABASE_URL
- **Optional**: Yes - Vercel uses SQLite by default
- **If needed**: Use Vercel Postgres, Railway, or Heroku Postgres
- **Format**: `postgresql://user:password@host:port/database`

## After Adding Variables

1. **Redeploy your project**:
   - Go to Vercel Dashboard
   - Click your project
   - Go to "Deployments"
   - Click the three dots on latest deployment
   - Select "Redeploy"

2. **Test the deployment**:
   - Visit your-project.vercel.app
   - Try the chatbot
   - Check if it responds

3. **If something fails**:
   - Check Vercel logs: Project > Deployments > Click build > View logs
   - Verify all variables are set
   - Make sure keys are not typos

## Files Provided

1. **VERCEL_ENV_VARIABLES.json** - JSON format (if you need to automate)
2. **VERCEL_ENV_SETUP.txt** - Plain text (copy-paste format)
3. **This file** - Instructions and reference

---

**Status**: ✅ Ready to add variables to Vercel!

Next: Go to https://vercel.com/dashboard and add these variables.
