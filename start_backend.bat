@echo off
echo 🏥 Starting Hospital Management Backend...
echo ==========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo 💡 Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Check if virtual environment exists, if not create it
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)

REM Check if requirements are installed
echo 📦 Checking Python dependencies...
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Dependencies not found. Installing from requirements.txt...
    pip install --upgrade pip
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies are installed
)

REM Check database setup (optional, don't fail if script doesn't exist)
if exist "scripts\setup_utilities.py" (
    echo 📊 Checking database...
    python scripts\setup_utilities.py check >nul 2>&1
)

echo.
echo 🌐 Starting Flask development server...
echo 💡 Backend will be available at: http://localhost:5000
echo 💡 API Documentation: http://localhost:5000/api/
echo 💡 Press Ctrl+C to stop the server
echo ==========================================
echo.

REM Start the Flask server
python start.py

pause