# PDF Upload Configuration Guide

## Problem
PDF files uploaded via the hospital portal are not persisting after server restarts or redeployments. This is because:

1. **Render's free tier uses ephemeral storage** - Files saved to the local filesystem are deleted on each deployment or restart
2. **Git ignores PDF files** - The `.gitignore` file excludes `hospital/static/uploads/**/*.pdf` from version control

## Solution: Cloudinary Cloud Storage

We've implemented Cloudinary as the primary storage solution with automatic fallback to local storage for development.

### How It Works

1. **Production (with Cloudinary configured)**: PDFs are uploaded to Cloudinary cloud storage and persist indefinitely
2. **Development (without Cloudinary)**: PDFs are saved locally with a warning message

### Setup Instructions

#### Step 1: Create a Free Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account (no credit card required)
3. After signup, you'll see your **Dashboard** with:
   - Cloud Name
   - API Key
   - API Secret

#### Step 2: Configure Environment Variables

Add these to your `.env` file (for local development):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

#### Step 3: Configure Render (for production)

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add these environment variables:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret

#### Step 4: Deploy

After adding the environment variables, Render will automatically redeploy your application.

### Testing

1. Upload a PDF via the hospital dashboard
2. Check the response - it should say: `"storage": "cloudinary"`
3. Refresh the page or restart the server
4. The PDF should still be accessible

### Cloudinary Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

This is more than enough for a medical records system!

### Fallback Behavior

If Cloudinary is not configured or fails:
- Files will be saved to `hospital/static/uploads/reports/`
- You'll see a warning in the response
- **Note**: These files will NOT persist on Render's free tier

### Alternative Solutions

If you don't want to use Cloudinary:

1. **AWS S3**: More complex setup, requires AWS account
2. **Google Cloud Storage**: Similar to S3
3. **Render Persistent Disk**: Costs $7/month for 1GB
4. **Database Storage**: Store PDFs as BLOB (not recommended for large files)

### Troubleshooting

**Q: Upload says "local storage" instead of "cloudinary"**
A: Check that environment variables are set correctly in Render

**Q: PDFs still disappearing after Cloudinary setup**
A: Verify the environment variables are correct and redeploy

**Q: Getting Cloudinary errors**
A: Check your API credentials and ensure your Cloudinary account is active

### Development vs Production

- **Development**: Local storage works fine since you're not redeploying constantly
- **Production (Render)**: MUST use Cloudinary or another cloud storage solution

---

**Need Help?** Check the Cloudinary documentation: https://cloudinary.com/documentation
