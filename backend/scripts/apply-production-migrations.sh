#!/bin/bash

# Production migration script
# This script safely applies migrations to production

echo "========================================="
echo "KitchenSync Production Migration"
echo "========================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
    echo "Error: This script must be run from the backend directory"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    echo "Please set it to your production database URL"
    exit 1
fi

echo "⚠️  WARNING: You are about to apply migrations to PRODUCTION"
echo "Database: $DATABASE_URL"
echo ""
read -p "Have you backed up the production database? (yes/no): " backup_confirm

if [ "$backup_confirm" != "yes" ]; then
    echo "Please backup your database first!"
    echo "Run: pg_dump \$DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql"
    exit 1
fi

echo ""
echo "Step 1: Checking current migration status..."
npx prisma migrate status

echo ""
echo "Step 2: Applying pending migrations..."
npx prisma migrate deploy

echo ""
echo "Step 3: Verifying migration success..."
node scripts/check-production-migrations.js

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Create a platform admin user"
echo "2. Test the platform admin login"
echo "3. Configure Stripe webhooks" 