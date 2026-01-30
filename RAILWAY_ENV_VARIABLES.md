# 🔑 Railway Environment Variables - Quick Reference

## 📦 **Backend Service Variables**

Copy and paste these into your Railway Backend service:

```bash
# === FLASK CORE ===
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=CHANGE_THIS_TO_A_RANDOM_STRING_32_CHARS_OR_MORE

# === DATABASE ===
DATABASE_URL=${{Postgres.DATABASE_URL}}

# === JWT AUTHENTICATION ===
JWT_SECRET_KEY=CHANGE_THIS_TO_ANOTHER_RANDOM_STRING_32_CHARS
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# === AI API KEYS ===
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# === CORS ===
FRONTEND_URL=https://your-frontend-name.railway.app

# === FILE UPLOAD ===
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# === PORT (Auto-set by Railway) ===
PORT=${{PORT}}
```

---

## ⚛️ **Frontend Service Variables**

Copy and paste these into your Railway Frontend service:

```bash
# === API CONFIGURATION ===
NEXT_PUBLIC_API_URL=https://your-backend-name.railway.app

# === ENVIRONMENT ===
NODE_ENV=production

# === PORT (Auto-set by Railway) ===
PORT=${{PORT}}
```

---

## 🔐 **How to Generate Secret Keys**

Run this in Python to generate secure keys:

```python
import secrets

# For SECRET_KEY
print("SECRET_KEY:", secrets.token_hex(32))

# For JWT_SECRET_KEY
print("JWT_SECRET_KEY:", secrets.token_hex(32))
```

Or use this online: https://www.uuidgenerator.net/

---

## 📝 **Variable Replacement Checklist**

### **Backend:**
- [ ] Replace `SECRET_KEY` with generated key
- [ ] Replace `JWT_SECRET_KEY` with generated key
- [ ] Add your `GROQ_API_KEY`
- [ ] Add your `GEMINI_API_KEY`
- [ ] Update `FRONTEND_URL` after frontend deployment

### **Frontend:**
- [ ] Update `NEXT_PUBLIC_API_URL` with backend URL

---

## 🎯 **Railway-Specific Variables**

These are special Railway variables you can use:

```bash
# Reference other services
${{Postgres.DATABASE_URL}}      # PostgreSQL connection string
${{Backend.RAILWAY_PUBLIC_DOMAIN}}  # Backend public URL
${{PORT}}                       # Auto-assigned port

# Railway metadata
${{RAILWAY_ENVIRONMENT}}        # Environment name
${{RAILWAY_PROJECT_NAME}}       # Project name
${{RAILWAY_SERVICE_NAME}}       # Service name
```

---

## 🔄 **Update Order**

1. **First**: Set up PostgreSQL database
2. **Second**: Deploy backend with variables
3. **Third**: Deploy frontend with backend URL
4. **Fourth**: Update backend's FRONTEND_URL
5. **Fifth**: Redeploy both services

---

## ⚠️ **Common Mistakes to Avoid**

❌ **DON'T:**
- Use `localhost` in production
- Commit `.env` files to GitHub
- Use weak secret keys
- Forget to update CORS settings
- Use `http://` instead of `https://`

✅ **DO:**
- Use Railway's service references
- Generate strong random keys
- Use HTTPS URLs
- Test after each deployment
- Monitor logs for errors

---

## 📋 **Copy-Paste Template**

### **For Backend (Replace placeholders):**
```
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=<GENERATE_WITH_PYTHON>
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET_KEY=<GENERATE_WITH_PYTHON>
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000
GROQ_API_KEY=<YOUR_GROQ_KEY>
GEMINI_API_KEY=<YOUR_GEMINI_KEY>
FRONTEND_URL=<WILL_UPDATE_AFTER_FRONTEND_DEPLOY>
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
PORT=${{PORT}}
```

### **For Frontend (Replace placeholders):**
```
NEXT_PUBLIC_API_URL=<YOUR_BACKEND_URL>
NODE_ENV=production
PORT=${{PORT}}
```

---

## 🚀 **Quick Start Commands**

### **Generate Keys:**
```bash
python -c "import secrets; print('SECRET_KEY:', secrets.token_hex(32)); print('JWT_SECRET_KEY:', secrets.token_hex(32))"
```

### **Test Backend:**
```bash
curl https://your-backend.railway.app/health
```

### **Test Frontend:**
```bash
curl https://your-frontend.railway.app
```

---

**Save this file for quick reference during deployment!** 📌
