#!/bin/bash

# Verify Database Export Script
# This script checks that the exported database contains expected content

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-export-directory>"
    echo "Example: $0 database-backups/local-export-20250618_010000"
    exit 1
fi

EXPORT_DIR="$1"
DUMP_FILE="$EXPORT_DIR/local-database-export.sql"

echo "🔍 Verifying Database Export..."
echo "==============================="
echo "📁 Export directory: $EXPORT_DIR"

if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ SQL dump file not found: $DUMP_FILE"
    exit 1
fi

echo "✅ Found SQL dump file"
echo "📊 File size: $(du -h "$DUMP_FILE" | cut -f1)"

echo ""
echo "🔍 Checking export contents..."

# Check for key tables
echo "📋 Tables found:"
grep -c "CREATE TABLE" "$DUMP_FILE" | xargs echo "   Total tables:"

# Check for specific content
echo ""
echo "🎯 Content verification:"

# Count restaurants
RESTAURANT_COUNT=$(grep -c "INSERT INTO.*Restaurant" "$DUMP_FILE" || echo "0")
echo "   Restaurants: $RESTAURANT_COUNT"

# Count content blocks
CONTENT_BLOCK_COUNT=$(grep -c "INSERT INTO.*ContentBlock" "$DUMP_FILE" || echo "0")
echo "   Content Blocks: $CONTENT_BLOCK_COUNT"

# Look for Coq au Vin specifically
if grep -q "coq-au-vin" "$DUMP_FILE"; then
    echo "   ✅ Coq au Vin restaurant found"
else
    echo "   ❌ Coq au Vin restaurant NOT found"
fi

# Look for content block types
echo ""
echo "🧩 Content Block Types found:"
grep "INSERT INTO.*ContentBlock" "$DUMP_FILE" | grep -o "'[a-z_]*'" | sort | uniq -c | while read count type; do
    echo "   $type: $count"
done

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

# Check file integrity
echo ""
echo "🔧 File integrity:"
if tail -5 "$DUMP_FILE" | grep -q "PostgreSQL database dump complete"; then
    echo "   ✅ Export appears complete"
else
    echo "   ⚠️  Export may be incomplete (no completion marker found)"
fi

echo ""
echo "📋 Export Summary:"
echo "   Directory: $EXPORT_DIR"
echo "   SQL File: $(basename "$DUMP_FILE")"
echo "   Size: $(du -h "$DUMP_FILE" | cut -f1)"
echo "   Restaurants: $RESTAURANT_COUNT"
echo "   Content Blocks: $CONTENT_BLOCK_COUNT"

if [ $RESTAURANT_COUNT -gt 0 ] && [ $CONTENT_BLOCK_COUNT -gt 0 ]; then
    echo ""
    echo "🎉 Export verification PASSED!"
    echo "   Ready for production deployment"
else
    echo ""
    echo "❌ Export verification FAILED!"
    echo "   Missing critical data - do not deploy"
    exit 1
fi 