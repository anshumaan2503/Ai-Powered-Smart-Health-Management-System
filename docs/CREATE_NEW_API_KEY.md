# 🔑 Create New Gemini API Key - Step by Step Guide

## 📋 Instructions

Follow these steps to create a fresh API key with new quotas:

---

## Step 1: Open Google AI Studio

**Click this link or copy-paste into your browser:**
```
https://aistudio.google.com/app/apikey
```

---

## Step 2: Sign In

- Sign in with your Google account
- Use the same account you used before, or a different one

---

## Step 3: Create API Key

You'll see a page titled **"Get API key"**

### Option A: Create in New Project (RECOMMENDED)
1. Click the button: **"Create API key in new project"**
2. This automatically creates a fresh project with full quotas
3. Wait 3-5 seconds for the key to generate

### Option B: Create in Existing Project
1. Click: **"Create API key"**
2. Select an existing Google Cloud project from dropdown
3. Click **"Create API key in [project name]"**

---

## Step 4: Copy Your New API Key

1. A pop-up will show your new API key
2. It looks like: `AIzaSy...` (39 characters long)
3. Click the **"Copy"** button
4. **IMPORTANT**: Keep this key secure!

---

## Step 5: Update Your .env File

1. Open your project folder:
   ```
   C:\Users\HP\OneDrive\Desktop\AI SMART Health MANAGEMENT SYSTEM
   ```

2. Open the file: `.env`

3. Find the line:
   ```
   GEMINI_API_KEY=AIzaSyBuQv...
   ```

4. Replace with your NEW key:
   ```
   GEMINI_API_KEY=your_new_key_here
   ```

5. **Save the file** (Ctrl+S)

---

## Step 6: Test the New Configuration

### Option A: Run Test Script
Open PowerShell in your project folder and run:
```powershell
python test_gemini_simple.py
```

### Option B: I'll Test It For You
Just tell me: **"test it"** after updating the .env file

---

## ✅ What You Should See (Success)

```
==================================================
GEMINI AI TEST
==================================================

API Key Present: True
Model Initialized: True
Gemini Available: True
Init Error: None

Testing Gemini response...
--------------------------------------------------
Response type: ai_response

Response:
I understand you have a headache. While I can't diagnose the cause...
[AI-generated helpful response]

Suggestions:
  1. How long have you had this pain?
  2. On a scale of 1-10, how severe is it?
  3. Does anything make it better or worse?

==================================================
SUCCESS - Gemini AI is working!
==================================================
```

---

## 🆘 Troubleshooting

### "API key not found" error
- Check you saved the `.env` file
- Make sure there are NO SPACES around the `=` sign
- Verify you copied the complete key

### Still getting quota error?
- Wait 2-3 minutes after creating the key
- Make sure you selected "Create in NEW project"
- Try creating another key with a different Google account

### Can't access Google AI Studio?
- Check your internet connection
- Try in incognito/private browsing mode
- Clear browser cache and cookies

---

## 📊 Your New Quotas

With a fresh free-tier API key, you get:

- ✅ **15 requests per minute**
- ✅ **1,000 requests per day**
- ✅ **1,000,000 tokens per day**
- ✅ **1,500 requests per day** (for most models)

**This should be plenty for development and testing!**

---

## 🎯 When You're Done

Tell me one of these:
- **"done"** - I'll test the configuration for you
- **"test it"** - I'll run the test script
- **"it works"** - Great! We're all set
- **"error: [message]"** - I'll help you troubleshoot

---

## 🔗 Quick Links

- **Create API Key**: https://aistudio.google.com/app/apikey
- **Check Usage**: https://ai.dev/usage?tab=rate-limit
- **Documentation**: https://ai.google.dev/gemini-api/docs/rate-limits
- **Community Support**: https://discuss.ai.google.dev/

---

**Ready? Open the link above and let me know when you've copied the new API key!**
