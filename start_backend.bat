@echo off
echo 🏥 Starting Hospital Management Backend...
echo ==========================================

echo 📊 Checking database...
python scripts/setup_utilities.py check

echo 🌐 Starting Flask development server...
echo 💡 Backend will be available at: http://localhost:5000
echo 💡 Press Ctrl+C to stop the server
echo.

python start.py

pause