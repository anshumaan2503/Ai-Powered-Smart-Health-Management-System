# 🔧 Troubleshooting Guide

## Common Errors and Solutions

### 1. **ModuleNotFoundError: No module named 'flask'**
```bash
# Solution: Install requirements
pip install -r requirements.txt
```

### 2. **ImportError: cannot import name 'create_app'**
```bash
# Solution: Make sure you're in the correct directory
cd hospital-management-system
python start.py
```

### 3. **Database Errors**
```bash
# Solution: Delete existing database and recreate
python scripts/database_management.py reset
```

### 4. **Port Already in Use**
```
Error: [Errno 48] Address already in use
```
**Solution:**
```bash
# Find and kill process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# On Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### 5. **Permission Errors**
```bash
# On Mac/Linux, try:
sudo python start.py

# Or create virtual environment:
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python start.py
```

## 🚀 Quick Start Commands

### Automated Setup (Recommended)
```bash
# Check everything is set up correctly
python scripts/setup_utilities.py check

# Initialize database
python scripts/setup_utilities.py init

# Start the application
python start.py
```

## 🔍 Debugging Steps

1. **Check Python Version**
   ```bash
   python --version
   # Should be 3.8 or higher
   ```

2. **Check if in Correct Directory**
   ```bash
   ls -la  # Should see hospital/, config.py, requirements.txt
   ```

3. **Test Individual Components**
   ```bash
   python scripts/setup_utilities.py test
   ```

## 📊 Database Issues

### Reset Database
```bash
python scripts/database_management.py reset
```

### Clean Database
```bash
python scripts/database_management.py clean
```

### View Database Stats
```bash
python scripts/database_management.py stats
```

## 🌐 Network Issues

### Test if Server is Running
```bash
curl http://localhost:5000/api/auth/profile
# Should return 401 Unauthorized (which means server is running)
```

### Check Firewall
- Make sure port 5000 is not blocked by firewall
- Try accessing from http://127.0.0.1:5000 instead of localhost

## 📝 Getting Help

If you're still having issues:

1. **Check the error message carefully**
2. **Run the setup checker**: `python scripts/setup_utilities.py check`
3. **Try the automated startup**: `python start.py`
4. **Check this troubleshooting guide**
5. **Look at the terminal output for specific error messages**

## 🔧 Development Mode

For development with auto-reload:
```bash
export FLASK_ENV=development  # On Windows: set FLASK_ENV=development
export FLASK_DEBUG=1          # On Windows: set FLASK_DEBUG=1
python start.py
```

## 📱 Testing the API

Once running, test these endpoints:
- http://localhost:5000/api/auth/profile (should return 401)
- http://localhost:5000/api/patients/ (should return 401)
- http://localhost:5000/api/doctors/ (should return 401)

The 401 responses mean the server is working correctly and requires authentication.