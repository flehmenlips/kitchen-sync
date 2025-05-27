#!/bin/bash

# Script to apply platform fixes to production database

echo "🔧 Applying platform fixes to production database..."

# Source the environment variables
export $(cat backend/.env | grep -v '^#' | xargs)

# Step 1: Add missing columns
echo "📊 Step 1: Adding missing columns to restaurants table..."
psql "$DATABASE_URL" -f backend/scripts/add-platform-columns-to-restaurants.sql

if [ $? -eq 0 ]; then
    echo "✅ Columns added successfully"
else
    echo "❌ Failed to add columns"
    exit 1
fi

# Step 2: Apply enum conversions
echo "🔄 Step 2: Converting columns to use proper enum types..."
psql "$DATABASE_URL" -f backend/scripts/fix-platform-enums.sql

if [ $? -eq 0 ]; then
    echo "✅ Enum conversions completed successfully"
else
    echo "❌ Failed to apply enum conversions"
    exit 1
fi

echo "✨ All platform fixes applied successfully!"
echo ""
echo "Next steps:"
echo "1. Refresh the platform admin page"
echo "2. The dashboard should now load without errors" 