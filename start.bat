@echo off
echo 🏥 Hospital Management System - Windows Startup
echo ================================================

echo 🔍 Checking setup...
python check_setup.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 🚀 Starting Hospital Management System...
    python start.py
) else (
    echo.
    echo ❌ Setup check failed. Please fix the issues above.
    pause
)