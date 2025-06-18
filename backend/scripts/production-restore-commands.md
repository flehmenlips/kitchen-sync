# Production Database Restoration Guide

## Step 1: Access Render Shell
1. Go to Render Dashboard
2. Select your backend service
3. Click "Shell" tab
4. Wait for shell to connect

## Step 2: Verify Current Database Connection
```bash
# Check current database
echo $DATABASE_URL | cut -c1-50
```

## Step 3: Create Backup of Current Production Database (SAFETY)
```bash
# Backup current production to a timestamped file
pg_dump $DATABASE_URL > production-backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup was created
ls -lh production-backup-*.sql
```

## Step 4: Upload Your Local Database Backup

### Option A: Direct Upload via Shell
```bash
# Create the restore file in Render shell
cat > local-database-restore.sql << 'EOF'
# PASTE YOUR ENTIRE kitchensync_dev-2025-06-17.sql CONTENT HERE
# Copy from your local file and paste between these EOF markers
EOF
```

### Option B: Via Git (if file is too large for copy-paste)
```bash
# Pull latest from git (if you committed the file)
git pull origin main
# Then use the file directly
```

## Step 5: Restore Your Local Database to Production
```bash
# Drop all existing data and restore from your backup
psql $DATABASE_URL < local-database-restore.sql
```

## Step 6: Verify Restoration
```bash
# Test the debug endpoint to confirm content blocks are working
curl "https://api.kitchensync.restaurant/api/content-blocks/debug?restaurantSlug=coq-au-vin"
```

## Step 7: Test Customer Website
Navigate to: https://coq-au-vin.kitchensync.restaurant/website

## Expected Results After Restoration:
- ✅ 4 content blocks should appear in debug endpoint
- ✅ Customer website should show hero, about, contact, and menu preview sections
- ✅ Navigation should work properly
- ✅ Content should render with HTML formatting

## Rollback Plan (if needed):
```bash
# If something goes wrong, restore the production backup
psql $DATABASE_URL < production-backup-TIMESTAMP.sql
```

## Notes:
- The restoration will drop existing data and replace with your local backup
- All content blocks, restaurants, and user data will be replaced
- This is safe because production hasn't been actively used during development
- The restoration should take 1-2 minutes to complete 