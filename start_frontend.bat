@echo off
echo 🚀 Starting Hospital Management Frontend...
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo 💡 Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Check if npm is installed
where npm >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ npm found
call npm --version

REM Navigate to frontend directory
if not exist "frontend" (
    echo ❌ Frontend directory not found!
    echo 💡 Make sure you're running this from the project root directory
    pause
    exit /b 1
)

cd /d frontend
if errorlevel 1 (
    echo ❌ Failed to navigate to frontend directory!
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found in frontend directory!
    pause
    exit /b 1
)

REM Check if dependencies are installed
echo 📦 Checking if dependencies are installed...
if not exist "node_modules" (
    echo ⚠️  Dependencies not found. Installing...
    echo 💡 This may take a few minutes...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies are installed
)

echo.
echo 🌐 Starting Next.js development server...
echo 💡 Frontend will be available at: http://localhost:3000
echo 💡 Press Ctrl+C to stop the server
echo ==========================================
echo.

REM Start the Next.js development server
call npm run dev

pause