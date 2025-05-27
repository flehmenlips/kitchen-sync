# Production Deployment Checklist - Multi-Tenancy Migration

## Pre-Deployment Steps

### 1. Backup Production Database ⚠️ CRITICAL
```bash
# From project root
chmod +x backend/scripts/backup-production-db.sh
./backend/scripts/backup-production-db.sh
```
- [ ] Backup completed successfully
- [ ] Backup file stored safely (note location: _____________)
- [ ] Tested backup file is valid

### 2. Pre-Migration Data Check
```bash
# From project root
cd backend
node scripts/pre-migration-check.js
```
- [ ] Review all warnings
- [ ] Confirm all users have restaurant associations
- [ ] Note total records to be updated: _____________

### 3. Update Environment Files
- [ ] Copy `backend/.env.local` to `backend/.env.local.backup` (safety)
- [ ] Copy production DATABASE_URL from Render dashboard
- [ ] Update `backend/.env` with production DATABASE_URL
- [ ] Verify connection string is correct

### 4. Test Migration Locally with Production Data (Optional but Recommended)
- [ ] Restore production backup to local test database
- [ ] Run migration on test database
- [ ] Verify data integrity after migration

## Deployment Steps

### 5. Deploy Code to Render
```bash
# Ensure you're on the correct branch
git checkout feature/platform-architecture

# Merge to main if ready
git checkout main
git merge feature/platform-architecture
git push origin main
```
- [ ] Code pushed to main branch
- [ ] Render deployment started
- [ ] Wait for build to complete

### 6. Run Migration on Production
```bash
# After Render deployment completes
cd backend

# Check migration status first
NODE_ENV=production npx prisma migrate status

# Apply the migration
NODE_ENV=production npx prisma migrate deploy
```
- [ ] Migration status checked
- [ ] Migration applied successfully
- [ ] No errors reported

### 7. Post-Migration Verification
```bash
# Run verification script on production
cd backend
NODE_ENV=production node scripts/verify-multi-tenancy.js
```
- [ ] All records have restaurantId assigned
- [ ] No orphaned records found
- [ ] Cross-restaurant references checked

## Post-Deployment Verification

### 8. Application Testing
- [ ] Log in as a regular user
- [ ] Verify can see own restaurant's data
- [ ] Create a new recipe - verify it's assigned to correct restaurant
- [ ] Check reservations - only see own restaurant
- [ ] Test restaurant settings load correctly

### 9. Multi-Restaurant Testing (if applicable)
- [ ] Test user with multiple restaurant access
- [ ] Verify restaurant switching works
- [ ] Confirm data isolation between restaurants

### 10. Monitor for Issues
- [ ] Check Render logs for errors
- [ ] Monitor application performance
- [ ] Be ready to rollback if needed

## Rollback Plan (If Needed)

### If Issues Arise:
1. **Stop all traffic** to the application
2. **Restore database** from backup:
   ```bash
   # Get connection details from Render
   PGPASSWORD=<password> psql -h <host> -p <port> -U <user> -d postgres < path/to/backup.sql
   ```
3. **Revert code** if necessary:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
4. **Verify** application is working with restored data

## Important Notes

1. **Restaurant Context**: After migration, all operations require restaurant context. Frontend may need updates.

2. **New User Registration**: New users won't get default data until assigned to a restaurant.

3. **API Changes**: All controllers now filter by restaurant - ensure frontend handles this.

4. **Performance**: Initial load after migration may be slower as indexes rebuild.

## Support Contacts

- Database Admin: _____________
- On-call Developer: _____________
- Render Support: https://render.com/support

## Sign-off

- [ ] Pre-deployment checklist completed by: _____________ Date: _______
- [ ] Migration executed by: _____________ Date: _______
- [ ] Post-deployment verification by: _____________ Date: _______
- [ ] Sign-off by: _____________ Date: _______ 