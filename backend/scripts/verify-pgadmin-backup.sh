#!/bin/bash

# Verify pgAdmin Database Backup Script
# This script checks that the pgAdmin backup contains expected content

BACKUP_FILE="$1"

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-sql-file>"
    echo "Example: $0 database-backups/kitchensync_dev-2025-06-17.sql"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ SQL backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔍 Verifying pgAdmin Database Backup..."
echo "======================================"
echo "📁 Backup file: $BACKUP_FILE"
echo "📊 File size: $(du -h "$BACKUP_FILE" | cut -f1)"

echo ""
echo "🔍 Checking backup contents..."

# Check for key tables
echo "📋 Tables found:"
grep -c "CREATE TABLE" "$BACKUP_FILE" | xargs echo "   Total tables:"

# Check for specific content
echo ""
echo "🎯 Content verification:"

# Count restaurants (lowercase table name)
RESTAURANT_COUNT=$(grep -c "INSERT INTO.*restaurants" "$BACKUP_FILE" || echo "0")
echo "   Restaurants: $RESTAURANT_COUNT"

# Count content blocks (lowercase table name)
CONTENT_BLOCK_COUNT=$(grep -c "INSERT INTO.*content_blocks" "$BACKUP_FILE" || echo "0")
echo "   Content Blocks: $CONTENT_BLOCK_COUNT"

# Look for Coq au Vin specifically
if grep -q "coq-au-vin" "$BACKUP_FILE"; then
    echo "   ✅ Coq au Vin restaurant found"
else
    echo "   ❌ Coq au Vin restaurant NOT found"
fi

# Look for content block data
echo ""
echo "🧩 Content Block sample data:"
grep "INSERT INTO.*content_blocks" "$BACKUP_FILE" | head -3 | while read line; do
    # Extract block type from the INSERT statement
    if echo "$line" | grep -q "hero\|about\|contact\|menu_preview"; then
        BLOCK_TYPE=$(echo "$line" | grep -o "'[a-z_]*'" | head -1)
        echo "   Found block type: $BLOCK_TYPE"
    fi
done

# Check for users table
USER_COUNT=$(grep -c "INSERT INTO.*users" "$BACKUP_FILE" || echo "0")
echo ""
echo "🔍 Additional data:"
echo "   Users: $USER_COUNT"

# Check for critical data
echo ""
echo "🔍 Critical data check:"

if [ $RESTAURANT_COUNT -gt 0 ]; then
    echo "   ✅ Has restaurant data"
else
    echo "   ❌ Missing restaurant data"
fi

if [ $CONTENT_BLOCK_COUNT -gt 0 ]; then
    echo "   ✅ Has content block data"
else
    echo "   ❌ Missing content block data"
fi

if [ $USER_COUNT -gt 0 ]; then
    echo "   ✅ Has user data"
else
    echo "   ❌ Missing user data"
fi

echo ""
echo "📋 Backup Summary:"
echo "   File: $(basename "$BACKUP_FILE")"
echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo "   Restaurants: $RESTAURANT_COUNT"
echo "   Content Blocks: $CONTENT_BLOCK_COUNT"
echo "   Users: $USER_COUNT"

if [ $RESTAURANT_COUNT -gt 0 ] && [ $CONTENT_BLOCK_COUNT -gt 0 ] && [ $USER_COUNT -gt 0 ]; then
    echo ""
    echo "🎉 Backup verification PASSED!"
    echo "   Ready for production deployment"
    echo ""
    echo "📋 Production restore commands:"
    echo "   1. Backup production first:"
    echo "      pg_dump \$PRODUCTION_DATABASE_URL > production-backup-$(date +%Y%m%d).sql"
    echo ""
    echo "   2. Restore your backup:"
    echo "      psql \$PRODUCTION_DATABASE_URL < $BACKUP_FILE"
    echo ""
    echo "   3. Verify restore:"
    echo "      curl https://api.kitchensync.restaurant/api/content-blocks/debug"
else
    echo ""
    echo "❌ Backup verification FAILED!"
    echo "   Missing critical data - do not deploy"
    exit 1
fi 