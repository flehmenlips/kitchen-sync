#!/bin/bash

# Phase 2B: Production Database Migration Script
# CRITICAL: This script handles production database changes

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Production database URL
PROD_DB_URL="postgresql://kitchensync_db_user:Ya4Fnh416dRlrNiqGkYunVAXMMFIxpKH@dpg-d0pnpmre5dus73e1ifi0-a.oregon-postgres.render.com/kitchensync_db_ikpj_n4yt"

echo -e "${YELLOW}=== PHASE 2B: PRODUCTION DATABASE MIGRATION ===${NC}"
echo -e "${RED}WARNING: This will modify the PRODUCTION database${NC}"
echo -e "${RED}Make sure you have tested this thoroughly on local development${NC}"
echo ""

# Step 1: Create backup
echo -e "${YELLOW}Step 1: Creating production database backup...${NC}"
BACKUP_FILE="production-backup-$(date +%Y%m%d-%H%M%S).sql"
pg_dump "$PROD_DB_URL" > "backups/$BACKUP_FILE"
echo -e "${GREEN}✓ Backup created: backups/$BACKUP_FILE${NC}"

# Step 2: Verify current production state
echo -e "${YELLOW}Step 2: Verifying current production state...${NC}"
psql "$PROD_DB_URL" -c "
SELECT 
  'Production Check' as step,
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN rs.opening_hours IS NOT NULL THEN 1 END) as restaurants_with_hours_in_settings
FROM restaurants r
LEFT JOIN restaurant_settings rs ON r.id = rs.restaurant_id;
"

# Step 3: Apply schema changes (Phase 1)
echo -e "${YELLOW}Step 3: Applying schema changes to production...${NC}"
psql "$PROD_DB_URL" -f "prisma/migrations/phase1-schema-updates.sql"
echo -e "${GREEN}✓ Schema changes applied${NC}"

# Step 4: Apply data migration (Phase 2)
echo -e "${YELLOW}Step 4: Applying data migration to production...${NC}"
psql "$PROD_DB_URL" -f "prisma/migrations/phase2-data-migration-fixed.sql"
echo -e "${GREEN}✓ Data migration applied${NC}"

# Step 5: Verify migration results
echo -e "${YELLOW}Step 5: Verifying migration results...${NC}"
psql "$PROD_DB_URL" -c "
SELECT 
  r.id,
  r.name,
  r.website_status,
  r.website_builder_enabled,
  COUNT(cb.id) as content_blocks_count
FROM restaurants r
LEFT JOIN content_blocks cb ON r.id = cb.restaurant_id
GROUP BY r.id, r.name, r.website_status, r.website_builder_enabled
ORDER BY r.id;
"

echo -e "${GREEN}=== PRODUCTION MIGRATION COMPLETED SUCCESSFULLY ===${NC}"
echo -e "${YELLOW}Backup location: backups/$BACKUP_FILE${NC}" 