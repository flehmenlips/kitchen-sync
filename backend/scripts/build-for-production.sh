#!/bin/bash

# Build script for production deployment
# This builds both frontend and backend

echo "🚀 Starting production build process..."

# Get the root directory (assuming this script is in backend/scripts)
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
echo "📁 Root directory: $ROOT_DIR"

# Build Frontend
echo "🎨 Building frontend..."
cd "$ROOT_DIR/frontend"
npm install
npm run build

# Ensure the dist directory exists and has content
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Frontend build failed - dist directory is empty or missing"
    exit 1
fi

echo "✅ Frontend build complete"

# Build Backend
echo "🔧 Building backend..."
cd "$ROOT_DIR/backend"
npm install
npm run build

echo "✅ Backend build complete"

# Copy frontend build to backend for serving
echo "📋 Copying frontend build to backend..."
# Ensure the destination directory exists
mkdir -p "$ROOT_DIR/backend/public"

# Note: The backend will serve from frontend/dist directly, 
# so we don't need to copy files

echo "✅ Production build complete!"
echo "📦 Ready for deployment" 