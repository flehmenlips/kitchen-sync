#!/bin/bash

echo "🔒 Simple Production Database Backup"
echo "==================================="
echo ""

# Get the DATABASE_URL from .env
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"')

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env"
    exit 1
fi

# Create backup directory
BACKUP_DIR="../database-backups"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/kitchensync_prod_backup_${TIMESTAMP}.sql"

echo "📊 Using DATABASE_URL from .env"
echo ""
echo "🔄 Creating backup..."
echo "  Backup file: $BACKUP_FILE"
echo ""

# Create the backup using pg_dump with connection string
pg_dump "$DATABASE_URL" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    FILESIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "✅ Backup created successfully!"
    echo "  File: $BACKUP_FILE"
    echo "  Size: $FILESIZE"
    
    # Compress the backup
    echo ""
    echo "🗜️  Compressing backup..."
    gzip "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup compressed: ${BACKUP_FILE}.gz"
    fi
    
    echo ""
    echo "🎉 Backup completed successfully!"
else
    echo "❌ Backup failed!"
    exit 1
fi 