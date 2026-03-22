#!/bin/bash
# Build script for Render deployment

echo "🏗️ Building frontend..."
cd frontend
npm ci
npm run build
cd ..

echo "✅ Build complete!"