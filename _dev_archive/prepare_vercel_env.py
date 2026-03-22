"""
Extract environment variables for Vercel deployment
This script helps you prepare your Render environment variables for Vercel
"""

import os
import secrets

print("=" * 60)
print("🚀 VERCEL ENVIRONMENT VARIABLES SETUP")
print("=" * 60)
print()

# Generate a new SECRET_KEY
new_secret_key = secrets.token_urlsafe(32)

print("📋 Copy and paste these into Vercel Dashboard:")
print("   (Settings → Environment Variables)")
print()
print("-" * 60)

# Environment variables to copy
env_vars = {
    "FLASK_CONFIG": "production",
    "FLASK_ENV": "production",
    "SECRET_KEY": new_secret_key,
    "JWT_SECRET_KEY": os.getenv("JWT_SECRET_KEY", "COPY_FROM_RENDER"),
    "DATABASE_URL": os.getenv("DATABASE_URL", "COPY_FROM_RENDER"),
    "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY", "COPY_FROM_RENDER"),
    "GROQ_API_KEY": os.getenv("GROQ_API_KEY", "COPY_FROM_RENDER"),
    "CORS_ORIGINS": "*",
    "FRONTEND_URL": "YOUR_VERCEL_FRONTEND_URL",
}

# Optional email variables
optional_vars = {
    "MAIL_SERVER": "smtp.gmail.com",
    "MAIL_PORT": "587",
    "MAIL_USE_TLS": "true",
    "MAIL_USERNAME": "OPTIONAL_YOUR_EMAIL",
    "MAIL_PASSWORD": "OPTIONAL_YOUR_APP_PASSWORD",
}

print("🔑 REQUIRED VARIABLES:")
print()
for key, value in env_vars.items():
    print(f"Key:   {key}")
    print(f"Value: {value}")
    print()

print("-" * 60)
print()
print("📧 OPTIONAL VARIABLES (for email functionality):")
print()
for key, value in optional_vars.items():
    print(f"Key:   {key}")
    print(f"Value: {value}")
    print()

print("-" * 60)
print()
print("✅ INSTRUCTIONS:")
print()
print("1. Go to: https://vercel.com/dashboard")
print("2. Select your project")
print("3. Go to: Settings → Environment Variables")
print("4. Add each variable above")
print("5. For each variable, select ALL environments:")
print("   ✓ Production")
print("   ✓ Preview")
print("   ✓ Development")
print()
print("⚠️  IMPORTANT:")
print("   - Replace 'COPY_FROM_RENDER' with actual values from Render")
print("   - Replace 'YOUR_VERCEL_FRONTEND_URL' with your actual URL")
print("   - The SECRET_KEY above is newly generated - use it!")
print()
print("=" * 60)
print()

# Save to file
output_file = "vercel_env_variables.txt"
with open(output_file, "w") as f:
    f.write("# Vercel Environment Variables\n")
    f.write("# Copy these to Vercel Dashboard\n\n")
    
    f.write("## REQUIRED VARIABLES\n\n")
    for key, value in env_vars.items():
        f.write(f"{key}={value}\n")
    
    f.write("\n## OPTIONAL VARIABLES\n\n")
    for key, value in optional_vars.items():
        f.write(f"{key}={value}\n")
    
    f.write("\n## NOTES\n")
    f.write("- Replace 'COPY_FROM_RENDER' with actual values\n")
    f.write("- Replace 'YOUR_VERCEL_FRONTEND_URL' with actual URL\n")
    f.write("- Add all variables to Vercel for all environments\n")

print(f"💾 Variables saved to: {output_file}")
print()
print("🎉 Ready to deploy to Vercel!")
print()
