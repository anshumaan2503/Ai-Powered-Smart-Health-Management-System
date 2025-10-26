@echo off
echo 🏥 Starting Hospital Management System
echo =====================================

echo 🔧 Running system check first...
python scripts/setup_utilities.py status

echo.
echo 🚀 Starting both Backend and Frontend...
echo.
echo 💡 Backend: http://localhost:5000
echo 💡 Frontend: http://localhost:3000
echo.
echo ⚠️ This will open two command windows
echo ⚠️ Keep both windows open while using the system
echo.

pause

echo 🏥 Starting Backend...
start "Hospital Backend" cmd /k "python start.py"

timeout /t 3 /nobreak > nul

echo ⚛️ Starting Frontend...
start "Hospital Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting...
echo 💡 Check the opened windows for status
echo 💡 Go to http://localhost:3000 when ready

pause