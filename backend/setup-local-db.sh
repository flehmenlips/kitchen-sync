#!/bin/bash

echo "Setting up local development database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install it first:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql"
    exit 1
fi

# Create local database
echo "Creating local database 'kitchensync_dev'..."
createdb kitchensync_dev 2>/dev/null || echo "Database might already exist"

# Create .env.local file
echo "Creating .env.local file for local development..."
cat > .env.local << EOF
# Local Development Database
DATABASE_URL="postgresql://localhost/kitchensync_dev"

# Copy other variables from your .env file
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
EOF

echo "✅ Local database setup complete!"
echo ""
echo "To use local database for development:"
echo "1. Copy your environment variables from .env to .env.local"
echo "2. Use: npm run dev:local"
echo ""
echo "Your production database in .env will remain safe!" 