# PowerShell script to start the backend server
Write-Host "🏥 Starting Hospital Management Backend..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Python not found"
    }
    Write-Host "✅ Python found" -ForegroundColor Green
    Write-Host $pythonVersion
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "💡 Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if virtual environment exists, if not create it
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to activate virtual environment" -ForegroundColor Red
    Write-Host "💡 You may need to run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if requirements are installed
Write-Host "📦 Checking Python dependencies..." -ForegroundColor Yellow
try {
    python -c "import flask" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Flask not found"
    }
    Write-Host "✅ Dependencies are installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Dependencies not found. Installing from requirements.txt..." -ForegroundColor Yellow
    pip install --upgrade pip
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

# Check database setup (optional, don't fail if script doesn't exist)
if (Test-Path "scripts\setup_utilities.py") {
    Write-Host "📊 Checking database..." -ForegroundColor Yellow
    python scripts\setup_utilities.py check 2>&1 | Out-Null
}

Write-Host ""
Write-Host "🌐 Starting Flask development server..." -ForegroundColor Cyan
Write-Host "💡 Backend will be available at: http://localhost:5000" -ForegroundColor Yellow
Write-Host "💡 API Documentation: http://localhost:5000/api/" -ForegroundColor Yellow
Write-Host "💡 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Start the Flask server
python start.py


