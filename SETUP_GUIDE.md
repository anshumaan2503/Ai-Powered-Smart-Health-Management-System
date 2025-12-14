# Setup Guide - AI Smart Management System

This guide will help you set up the development environment for the Hospital Management System.

## Prerequisites

Before running the batch files, make sure you have the following installed:

1. **Python 3.8 or higher**
   - Download from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation
   - Verify installation: Open Command Prompt and run `python --version`

2. **Node.js 18 or higher**
   - Download from: https://nodejs.org/
   - This will also install npm (Node Package Manager)
   - Verify installation: Open Command Prompt and run `node --version` and `npm --version`

## Quick Start

### Starting the Backend

**Option 1: Using Batch File (CMD/Windows Explorer)**
1. Double-click `start_backend.bat` or run it from Command Prompt
2. The script will:
   - Check if Python is installed
   - Create a virtual environment (if it doesn't exist)
   - Install Python dependencies (if needed)
   - Start the Flask server on `http://localhost:5000`

**Option 2: Using PowerShell**
1. Open PowerShell in the project directory
2. Run: `.\start_backend.ps1`
   - If you get an execution policy error, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
   - Then run `.\start_backend.ps1` again

### Starting the Frontend

**Option 1: Using Batch File (CMD/Windows Explorer)**
1. Double-click `start_frontend.bat` or run it from Command Prompt
2. The script will:
   - Check if Node.js is installed
   - Install npm dependencies (if needed)
   - Start the Next.js development server on `http://localhost:3000`

**Option 2: Using PowerShell**
1. Open PowerShell in the project directory
2. Run: `.\start_frontend.ps1`
   - If you get an execution policy error, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
   - Then run `.\start_frontend.ps1` again

## First Time Setup

When you run the batch files for the first time:

### Backend Setup
- A `venv` folder will be created (Python virtual environment)
- All Python packages from `requirements.txt` will be installed
- Database tables will be created automatically

### Frontend Setup
- A `node_modules` folder will be created in the `frontend` directory
- All npm packages from `package.json` will be installed

## Manual Setup (Alternative)

If you prefer to set up manually:

### Backend Manual Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python start.py
```

### Frontend Manual Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## PowerShell Execution Policy

If you're using PowerShell and get an execution policy error when running `.ps1` files:

1. Run PowerShell as Administrator
2. Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Type `Y` when prompted
4. Now you can run the PowerShell scripts

Alternatively, you can use the `.bat` files which don't have this restriction.

## Troubleshooting

### Backend Issues

**Problem: "Python is not recognized"**
- Solution: Make sure Python is installed and added to PATH
- Reinstall Python and check "Add Python to PATH" option

**Problem: "Failed to create virtual environment"**
- Solution: Make sure you have write permissions in the project directory
- Try running Command Prompt as Administrator

**Problem: "Module not found" errors**
- Solution: Make sure the virtual environment is activated
- Run `pip install -r requirements.txt` again

### Frontend Issues

**Problem: "Node.js is not recognized"**
- Solution: Make sure Node.js is installed and added to PATH
- Restart your computer after installing Node.js

**Problem: "npm install" fails**
- Solution: Try deleting `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Check your internet connection

**Problem: Port 3000 already in use**
- Solution: Stop any other applications using port 3000
- Or change the port in `frontend/package.json` dev script

## Environment Variables

The application uses default environment variables for development. For production, you should:

1. Create a `.env` file in the root directory
2. Set the following variables:
   - `FLASK_CONFIG=development` (or `production`)
   - `SECRET_KEY=your-secret-key-here`
   - `JWT_SECRET_KEY=your-jwt-secret-here`
   - Database connection strings (if using external database)

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/

## Stopping the Servers

Press `Ctrl+C` in the terminal/command prompt window to stop either server.

## Notes

- The backend and frontend can be run independently
- Make sure both servers are running for full functionality
- The backend must be running before the frontend can make API calls
- Database is automatically created in the `instance` folder on first run

