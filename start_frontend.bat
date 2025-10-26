@echo off
echo 🚀 Starting Hospital Management Frontend...
echo ==========================================

cd frontend

echo 📦 Checking if dependencies are installed...
if not exist "node_modules" (
    echo ⚠️ Dependencies not found. Installing...
    npm install
)

echo 🌐 Starting Next.js development server...
echo 💡 Frontend will be available at: http://localhost:3000
echo 💡 Press Ctrl+C to stop the server
echo.

npm run dev

pause