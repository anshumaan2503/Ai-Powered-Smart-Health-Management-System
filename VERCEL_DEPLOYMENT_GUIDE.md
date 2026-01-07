# Vercel Deployment Guide for AI Smart Health Management System

## 🚀 Deploy Both Frontend & Backend on Vercel

### 1. Single Vercel Deployment (Recommended)

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - **Important:** Use the root directory (not frontend folder)

2. **Automatic Configuration:**
   - Vercel will detect the `vercel.json` configuration
   - Frontend (Next.js) will be built automatically
   - Backend (Flask) will be deployed as serverless functions

3. **Environment Variables:**
   Add these to your Vercel project settings:
   ```
   # Flask Configuration
   FLASK_CONFIG=production
   SECRET_KEY=your-super-secure-secret-key-here
   JWT_SECRET_KEY=your-super-secure-jwt-secret-key-here
   
   # Database (use PostgreSQL for production)
   DATABASE_URL=postgresql://username:password@hostname:port/database_name
   
   # AI API Keys
   GEMINI_API_KEY=your-gemini-api-key
   GROQ_API_KEY=your-groq-api-key
   
   # Frontend API URL (automatically handled)
   NEXT_PUBLIC_API_URL=/api
   
   # Email Configuration (optional)
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=true
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   ```

### 2. Project Structure for Vercel

Your project is now configured with:
- `vercel.json` - Deployment configuration
- `api/index.py` - Serverless backend entry point
- `frontend/` - Next.js frontend
- `requirements.txt` - Python dependencies

### 3. How It Works

```
your-app.vercel.app/
├── / (frontend - Next.js)
├── /dashboard (frontend routes)
├── /aichatbot (frontend routes)
└── /api/* (backend - Flask serverless functions)
    ├── /api/auth/login
    ├── /api/hospitals
    ├── /api/ai/chat
    └── /api/prescription/analyze
```

### 4. Database Setup for Production

#### PostgreSQL (Recommended):
1. **Supabase (Free tier available):**
   ```
   DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
   ```

2. **Neon (Serverless PostgreSQL):**
   ```
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
   ```

3. **Railway:**
   ```
   DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```

### 5. Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Import your GitHub repository
   - Add environment variables
   - Deploy automatically

3. **Test Deployment:**
   - Frontend: `https://your-app.vercel.app`
   - Backend API: `https://your-app.vercel.app/api/health`

### 6. Environment Variables Reference

#### Required Variables:
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT secret key
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Your Gemini API key
- `GROQ_API_KEY` - Your GROQ API key

#### Optional Variables:
- `MAIL_SERVER`, `MAIL_USERNAME`, `MAIL_PASSWORD` - Email configuration
- `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` - Payment processing

### 7. Security Checklist

- [ ] Use strong, unique secret keys
- [ ] Use PostgreSQL (not SQLite) for production
- [ ] Secure API keys in Vercel environment variables
- [ ] Test all functionality after deployment
- [ ] Monitor serverless function logs

### 8. Limitations & Considerations

#### Vercel Serverless Limitations:
- **Function timeout:** 30 seconds max (configured in vercel.json)
- **Memory:** 1024MB max
- **File uploads:** Limited to 4.5MB per request
- **Database:** Use external PostgreSQL (SQLite won't work)

#### Recommended for Large Files:
- Use cloud storage (AWS S3, Cloudinary) for file uploads
- Process large files asynchronously

### 9. Troubleshooting

#### Common Issues:
1. **Import Errors:** Check Python path in `api/index.py`
2. **Database Errors:** Ensure PostgreSQL URL is correct
3. **Function Timeout:** Optimize slow operations
4. **CORS Issues:** Already configured in Flask-CORS

#### Debugging:
- Check Vercel Function Logs
- Test API endpoints: `https://your-app.vercel.app/api/health`
- Monitor build logs during deployment

### 10. Alternative: Separate Deployments

If you prefer separate deployments:

#### Frontend Only on Vercel:
1. Deploy only the `frontend` folder
2. Set `NEXT_PUBLIC_API_URL` to your backend URL

#### Backend on Railway/Render:
1. Deploy Flask app separately
2. Update frontend API URL accordingly

## 🎉 Benefits of Single Vercel Deployment

- ✅ Single domain for frontend and backend
- ✅ No CORS issues
- ✅ Simplified deployment process
- ✅ Automatic HTTPS
- ✅ Global CDN for frontend
- ✅ Serverless scaling for backend