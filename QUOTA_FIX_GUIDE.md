# How to Resolve Gemini API Quota Issue

## 🔍 Understanding the Problem

Your API shows **0 quota** for all metrics, which means either:
1. You've exhausted your free tier limits for the day/month
2. Your API key's project doesn't have billing enabled
3. The API key is from a restricted project

---

## ✅ Solution 1: Create a NEW API Key (Quickest - Recommended)

### Step-by-Step:

1. **Go to Google AI Studio**
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create a New API Key**
   - Click **"Get API Key"** or **"Create API Key"**
   - Choose **"Create API key in new project"** (this gives you fresh quotas)
   - Copy the new API key

3. **Update Your .env File**
   - Open: `.env` in your project folder
   - Replace the old key with your new key:
     ```
     GEMINI_API_KEY=your_new_api_key_here
     ```
   - Save the file

4. **Test Again**
   ```bash
   python test_gemini_simple.py
   ```

### Free Tier Limits (New Key)
- **15 requests per minute**
- **1,000 requests per day**
- **1 million tokens per day**

---

## ✅ Solution 2: Wait for Quota Reset (If using free tier)

### Reset Schedule:
- **Per-minute quotas**: Reset every 60 seconds
- **Per-day quotas**: Reset at **midnight Pacific Time (PDT/PST)**
- **Per-month quotas**: Reset on the 1st of each month

### Check Current Time vs Reset:
- Current time: **5:42 PM IST** (Dec 16, 2025)
- Midnight PST = **1:30 PM IST** (next day)
- **Next reset**: Tomorrow at 1:30 PM IST

### What to Do:
1. Wait until tomorrow afternoon (1:30 PM IST)
2. Test again: `python test_gemini_simple.py`
3. If still failing, try Solution 1 or 3

---

## ✅ Solution 3: Enable Billing (For Production Use)

### Why Enable Billing?
- **Much higher quotas**:
  - 1,000 requests per minute (vs 15 free)
  - 1B+ tokens per month (vs 1M free)
- **Pay-per-use**: Only pay for what you use
- **First $300 free credit** (Google Cloud new accounts)

### Steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Find Your Project**
   - Look for the project associated with your API key
   - Or create a new project

3. **Enable Billing**
   - Go to: https://console.cloud.google.com/billing
   - Click **"Link a billing account"**
   - Add payment method (required, but you get free credits)

4. **Enable Gemini API**
   - Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
   - Click **"Enable"**

5. **Create/Use API Key with this project**
   - The key will now have paid-tier quotas

### Cost Estimation (Gemini 2.0 Flash):
- **Input**: $0.075 per 1M tokens
- **Output**: $0.30 per 1M tokens
- **Typical chat**: ~$0.001 per conversation (very cheap!)

---

## ✅ Solution 4: Check Your Current Usage

### Monitor Your Quota:
1. Visit: https://ai.dev/usage?tab=rate-limit
2. See which quotas are exhausted
3. Check when they reset

### Alternative Monitoring:
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Navigate to: **APIs & Services → Dashboard**
3. Click on **Generative Language API**
4. View **Quotas & System Limits**

---

## 🚀 Quick Fix - Try These API Keys Options

### Option A: Create Multiple Free Projects
- Create 2-3 Google Cloud projects
- Generate API key for each
- Rotate between them when quota exhausted
- Free tier quotas are **per project**

### Option B: Use Different Models
Some models have different quotas:
- `gemini-2.0-flash-exp` (experimental, might have different limits)
- `gemini-1.5-flash` (older, might have different limits)
- `gemini-1.5-pro` (slower but might work)

To change model, edit `hospital/services/gemini_ai.py` line 53:
```python
self.model = genai.GenerativeModel('gemini-1.5-flash')
```

---

## 🧪 Verify the Fix

After implementing any solution:

1. **Run the test script:**
   ```bash
   python test_gemini_simple.py
   ```

2. **Look for:**
   ```
   SUCCESS - Gemini AI is working!
   Response type: ai_response
   ```

3. **Test in your app:**
   - Start the backend
   - Go to patient dashboard
   - Use the health chatbot
   - Ask "I have a headache"
   - Should get AI-powered response (not fallback)

---

## 📊 Recommended Approach

### For Development/Testing:
✅ **Solution 1**: Create new API key in new project (free, instant)

### For Production/Deployment:
✅ **Solution 3**: Enable billing (reliable, scalable, still very cheap)

### For Learning/Personal Use:
✅ **Solution 1 + Option A**: Multiple free projects with key rotation

---

## 🆘 Troubleshooting

### Still Getting Quota Error After New Key?
- Make sure you created key in **NEW project**
- Wait 5 minutes after creating key
- Check you copied the **entire key**
- Verify `.env` file saved properly
- Restart your Python application

### Can't Create New API Key?
- Try logging in with different Google account
- Clear browser cache and cookies
- Use incognito/private browsing mode

### Need Help?
- Google AI Studio support: https://ai.google.dev/gemini-api/docs/rate-limits
- Community forum: https://discuss.ai.google.dev/

---

## 📞 Next Steps

**Choose your solution:**
1. ✅ Create new API key (5 minutes) → **Best for immediate fix**
2. ⏰ Wait for quota reset (overnight) → **Best if no urgency**
3. 💳 Enable billing (10 minutes) → **Best for production**

**I can help you:**
- Open the Google AI Studio page to create a new key
- Check your current usage statistics
- Test the new configuration
- Update your .env file

**Let me know which solution you want to try!**
