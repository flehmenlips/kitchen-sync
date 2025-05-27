#!/bin/bash

# Production Database Backup Script
# This script creates a backup of the production database before applying migrations

echo "🔒 Production Database Backup Script"
echo "===================================="
echo ""

# Load production environment variables
if [ -f "backend/.env" ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
else
    echo "❌ Error: backend/.env file not found!"
    echo "Please ensure you're running this from the project root directory."
    exit 1
fi

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database?schema=public
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/([^?]+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "❌ Error: Could not parse DATABASE_URL"
    exit 1
fi

# Create backup directory
BACKUP_DIR="./database-backups"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/kitchensync_prod_backup_${TIMESTAMP}.sql"

echo "📊 Database Details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

echo "🔄 Creating backup..."
echo "  Backup file: $BACKUP_FILE"
echo ""

# Create the backup using pg_dump
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    --create \
    -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Get file size
    FILESIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "✅ Backup created successfully!"
    echo "  File: $BACKUP_FILE"
    echo "  Size: $FILESIZE"
    echo ""
    echo "📝 To restore this backup later, use:"
    echo "  PGPASSWORD=<password> psql -h <host> -p <port> -U <user> -d postgres < $BACKUP_FILE"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Compress the backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup compressed: ${BACKUP_FILE}.gz"
    echo ""
    echo "🎉 Backup completed successfully!"
    echo ""
    echo "⚠️  IMPORTANT: Store this backup file safely before proceeding with migration!"
else
    echo "⚠️  Compression failed, but backup is available uncompressed"
fi 