#!/bin/bash

# Production Database Restoration Script
# Run this script in Render Shell to restore local database backup

echo "🔄 Production Database Restoration"
echo "=================================="

# Step 1: Verify environment
echo "📍 Step 1: Verifying environment..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found! Make sure you're in Render shell."
    exit 1
fi

echo "✅ Database URL found: ${DATABASE_URL:0:30}..."

# Step 2: Create safety backup
echo ""
echo "📍 Step 2: Creating safety backup of current production..."
BACKUP_FILE="production-backup-$(date +%Y%m%d-%H%M%S).sql"
echo "📁 Backup file: $BACKUP_FILE"

pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Production backup created successfully"
    echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Failed to create production backup!"
    exit 1
fi

# Step 3: Get local database backup
echo ""
echo "📍 Step 3: Getting local database backup..."
echo "You need to provide the local database backup content."
echo ""
echo "Options:"
echo "1. If you have the file in git, run: git pull origin main"
echo "2. If you need to paste content, create the file manually:"
echo ""
echo "   cat > local-database-restore.sql << 'EOF'"
echo "   # PASTE YOUR ENTIRE kitchensync_dev-2025-06-17.sql CONTENT HERE"
echo "   EOF"
echo ""

# Check if restore file exists
if [ -f "temp-production-restore.sql" ]; then
    RESTORE_FILE="temp-production-restore.sql"
    echo "✅ Found temp-production-restore.sql"
elif [ -f "local-database-restore.sql" ]; then
    RESTORE_FILE="local-database-restore.sql"
    echo "✅ Found local-database-restore.sql"
else
    echo "❌ No restore file found!"
    echo "   Please create local-database-restore.sql with your backup content"
    echo "   Then run this script again"
    exit 1
fi

echo "📊 Restore file size: $(du -h "$RESTORE_FILE" | cut -f1)"

# Step 4: Confirm restoration
echo ""
echo "📍 Step 4: Confirmation"
echo "⚠️  WARNING: This will REPLACE all production data!"
echo "   Current backup: $BACKUP_FILE"
echo "   Restore from: $RESTORE_FILE"
echo ""
echo "Type 'RESTORE' to continue or Ctrl+C to cancel:"
read confirmation

if [ "$confirmation" != "RESTORE" ]; then
    echo "❌ Restoration cancelled"
    exit 1
fi

# Step 5: Perform restoration
echo ""
echo "📍 Step 5: Performing database restoration..."
echo "🔄 This may take 1-2 minutes..."

psql "$DATABASE_URL" < "$RESTORE_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restoration completed successfully!"
else
    echo "❌ Database restoration failed!"
    echo "💡 You can rollback using: psql \$DATABASE_URL < $BACKUP_FILE"
    exit 1
fi

# Step 6: Verification
echo ""
echo "📍 Step 6: Verifying restoration..."

# Test the debug endpoint
echo "🧪 Testing debug endpoint..."
RESULT=$(curl -s "https://api.kitchensync.restaurant/api/content-blocks/debug?restaurantSlug=coq-au-vin")

if echo "$RESULT" | grep -q "contentBlocks.*\[\]"; then
    echo "❌ Content blocks still empty - restoration may have failed"
    echo "💡 Check the restore file content and try again"
elif echo "$RESULT" | grep -q "version.*2"; then
    echo "✅ API is responding with debug info"
    if echo "$RESULT" | grep -q "restaurant.*coq-au-vin"; then
        echo "✅ Restaurant found correctly"
        echo "🎉 Restoration appears successful!"
    else
        echo "⚠️  Restaurant lookup issue"
    fi
else
    echo "⚠️  Unexpected API response"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Test customer website: https://coq-au-vin.kitchensync.restaurant/website"
echo "2. Check content blocks appear correctly"
echo "3. Verify navigation works"
echo ""
echo "📋 Files created:"
echo "   Production backup: $BACKUP_FILE"
echo "   (Keep this safe in case rollback is needed)" 