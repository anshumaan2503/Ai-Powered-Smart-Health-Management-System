@echo off
echo 🏥 Prescription Analyzer - Windows Installation
echo ================================================

echo.
echo 🐍 Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo.
echo 📦 Updating pip and setuptools...
python -m pip install --upgrade pip setuptools wheel
if %errorlevel% neq 0 (
    echo ⚠️  Could not update pip, continuing anyway...
)

echo.
echo 🔄 Installing Pillow (image processing)...
python -m pip install --upgrade Pillow
if %errorlevel% neq 0 (
    echo ⚠️  Standard Pillow installation failed, trying alternatives...
    python -m pip install --only-binary=all Pillow
    if %errorlevel% neq 0 (
        echo ❌ Could not install Pillow automatically.
        echo 💡 Try manual installation:
        echo    1. Download from: https://pypi.org/project/Pillow/#files
        echo    2. Or use conda: conda install pillow
    )
)

echo.
echo 🔄 Installing PDF processing library...
python -m pip install PyPDF2
if %errorlevel% neq 0 (
    echo ⚠️  PyPDF2 failed, trying pypdf...
    python -m pip install pypdf
    if %errorlevel% neq 0 (
        echo ❌ Could not install PDF library
    )
)

echo.
echo 🔄 Installing optional AI library...
python -m pip install google-generativeai
if %errorlevel% neq 0 (
    echo ⚠️  AI library installation failed (optional)
)

echo.
echo 🗄️  Setting up database...
python -c "from hospital import create_app, db; app=create_app(); app.app_context().push(); db.create_all(); print('✅ Database ready')"
if %errorlevel% neq 0 (
    echo ❌ Database setup failed
)

echo.
echo 🌐 Installing frontend dependencies...
if exist "frontend" (
    cd frontend
    npm install react-dropzone
    if %errorlevel% neq 0 (
        echo ⚠️  Frontend dependency installation failed
    )
    cd ..
) else (
    echo ⚠️  Frontend directory not found
)

echo.
echo 🧪 Testing installation...
python test_prescription_analyzer.py

echo.
echo ================================================
echo 🎉 Installation completed!
echo.
echo 🚀 Next steps:
echo 1. Start backend: python start.py
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo 3. Visit: http://localhost:3000/prescription-analyzer
echo.
echo 💡 For AI features, add GEMINI_API_KEY to your .env file
echo.
pause