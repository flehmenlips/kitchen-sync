#!/bin/bash

# Export Local Database Script
# This script safely exports the local database for production deployment

echo "🔄 Exporting Local Database for Production Sync..."
echo "=================================================="

# Load local environment
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '#' | xargs)
    echo "✅ Loaded .env.local"
else
    echo "❌ .env.local not found!"
    exit 1
fi

# Verify we're using local database
if [[ $DATABASE_URL != *"localhost"* ]] && [[ $DATABASE_URL != *"127.0.0.1"* ]]; then
    echo "❌ WARNING: DATABASE_URL doesn't appear to be local!"
    echo "   Current URL: ${DATABASE_URL:0:30}..."
    echo "   Aborting for safety."
    exit 1
fi

# Create backup directory with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="database-backups/local-export-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "📁 Backup directory: $BACKUP_DIR"

# Extract database connection details
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

echo "🔍 Database Details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

# Pre-export verification
echo ""
echo "🔍 Pre-export verification..."
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    'Restaurants: ' || COUNT(*) as count FROM \"Restaurant\"
UNION ALL
SELECT 
    'Content Blocks: ' || COUNT(*) as count FROM \"ContentBlock\"
UNION ALL
SELECT 
    'Coq au Vin Blocks: ' || COUNT(*) as count FROM \"ContentBlock\" 
    WHERE \"restaurantId\" = (SELECT id FROM \"Restaurant\" WHERE slug = 'coq-au-vin');
"

echo ""
echo "📤 Exporting database..."

# Export database
PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --verbose \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --format=custom \
    --file="$BACKUP_DIR/local-database-export.dump"

if [ $? -eq 0 ]; then
    echo "✅ Database export completed successfully!"
    
    # Also create a SQL version for easier inspection
    echo "📝 Creating SQL version for inspection..."
    PGPASSWORD="$DB_PASS" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        --format=plain \
        --file="$BACKUP_DIR/local-database-export.sql"
    
    # Create info file
    cat > "$BACKUP_DIR/export-info.txt" << EOF
Local Database Export Information
================================
Export Date: $(date)
Source Database: $DATABASE_URL
Export Files:
- local-database-export.dump (binary format for restore)
- local-database-export.sql (plain SQL for inspection)

To restore to production:
1. Backup production database first
2. Upload this dump file to production server
3. Use pg_restore to import

Commands for production restore:
pg_restore --clean --if-exists --no-owner --no-privileges -d \$DATABASE_URL local-database-export.dump
EOF
    
    echo ""
    echo "🎉 Export Complete!"
    echo "📁 Files created in: $BACKUP_DIR"
    echo "📊 Export size: $(du -h $BACKUP_DIR/local-database-export.dump | cut -f1)"
    echo ""
    echo "Next steps:"
    echo "1. Upload the .dump file to your production server"
    echo "2. Backup production database first"
    echo "3. Use pg_restore to import"
    
else
    echo "❌ Database export failed!"
    exit 1
fi 