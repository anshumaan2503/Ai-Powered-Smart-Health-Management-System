#!/usr/bin/env python3
"""
Frontend server starter for Hospital Management System
"""

import os
import subprocess
import sys

def main():
    """Start the Next.js frontend server"""
    print("🌐 Starting Frontend Server...")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists('frontend'):
        print("❌ Frontend directory not found!")
        print("💡 Make sure you're in the project root directory")
        sys.exit(1)
    
    # Change to frontend directory
    os.chdir('frontend')
    
    # Check if node_modules exists
    if not os.path.exists('node_modules'):
        print("📦 Installing dependencies...")
        try:
            subprocess.run(['npm', 'install'], check=True)
            print("✅ Dependencies installed!")
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            print("💡 Make sure Node.js and npm are installed")
            sys.exit(1)
    
    print("🚀 Starting Next.js development server...")
    print("📍 Frontend: http://localhost:3000")
    print("💡 Press Ctrl+C to stop")
    print("=" * 40)
    
    try:
        # Start the development server
        subprocess.run(['npm', 'run', 'dev'], check=True)
    except subprocess.CalledProcessError:
        print("❌ Failed to start frontend server")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Frontend server stopped")

if __name__ == '__main__':
    main()