# Production Migration Guide: Customer/User Separation

## Overview

This guide walks through the safe migration of customers from the `users` table to a dedicated `customers` table system in production. This architectural change improves security, scalability, and maintains clear separation between staff and customer accounts.

## ⚠️ CRITICAL WARNINGS

1. **NEVER** run migration scripts without a fresh backup
2. **NEVER** use `--force` or skip safety prompts
3. **ALWAYS** test on staging/local first
4. **ALWAYS** run pre-flight checks before migration
5. **KEEP** the previous database incident in mind - one wrong command can delete everything

## Migration Timeline

### Phase 1: Preparation (1-2 days before)
- Review all code changes
- Test migration on local database
- Create staging environment test
- Prepare rollback procedures
- Schedule migration window

### Phase 2: Pre-Migration (Day of)
- Take production backup
- Run pre-flight checks
- Deploy compatibility code
- Monitor for issues

### Phase 3: Migration (1-2 hours)
- Execute migration scripts
- Verify data integrity
- Update application code
- Test functionality

### Phase 4: Post-Migration (24 hours)
- Monitor system health
- Address user issues
- Plan legacy cleanup

## Step-by-Step Instructions

### Step 1: Local Testing

First, ensure everything works locally:

```bash
# 1. Switch to feature branch
git checkout feature/customer-user-separation-production

# 2. Test migration script locally
cd backend
npm run db:check:multi-tenant

# 3. Run migration in dry-run mode
node scripts/production-customer-migration.js

# 4. If dry-run looks good, execute locally
node scripts/production-customer-migration.js --execute

# 5. Verify results
npm run db:check:multi-tenant
```

### Step 2: Staging Test

Create a staging copy of production:

```bash
# 1. Backup production (read-only)
NODE_ENV=production node scripts/production-backup.js

# 2. Restore to staging database
# (Use your database provider's restore feature)

# 3. Run migration on staging
DATABASE_URL=your_staging_url node scripts/production-customer-migration.js

# 4. Test all functionality on staging
```

### Step 3: Production Pre-flight

```bash
# 1. Run pre-flight check
NODE_ENV=production node scripts/production-preflight-check.js

# 2. Review the output carefully
# - All checks should pass
# - Warnings should be understood
# - No critical failures

# 3. Take fresh backup
NODE_ENV=production node scripts/production-backup.js
```

### Step 4: Deploy Compatibility Layer

Before running migration, deploy backend code that supports BOTH schemas:

```bash
# 1. Commit all changes
git add .
git commit -m "feat: add customer/user separation compatibility layer"

# 2. Push to production
git push origin feature/customer-user-separation-production

# 3. Deploy backend (DO NOT deploy frontend yet)
# This ensures the app works with both old and new schemas
```

### Step 5: Execute Migration

```bash
# 1. Run migration in dry-run mode
NODE_ENV=production node scripts/production-customer-migration.js

# 2. Review output carefully
# - Check customer counts
# - Verify no errors
# - Confirm expected changes

# 3. Execute migration (requires typing confirmation)
NODE_ENV=production node scripts/production-customer-migration.js --execute

# 4. Verify immediately
NODE_ENV=production node scripts/production-preflight-check.js
```

### Step 6: Deploy Frontend

After migration succeeds:

```bash
# 1. Deploy frontend with customer portal
# 2. Test customer login/registration
# 3. Test staff login
# 4. Verify all features work
```

### Step 7: Monitor and Verify

For the next 24 hours:

1. Monitor error logs
2. Check user reports
3. Verify data integrity
4. Test critical paths regularly

## Rollback Procedures

### Immediate Rollback (< 1 hour)

If issues are found immediately:

```bash
# 1. Revert frontend deployment
# 2. Keep backend (it supports both schemas)
# 3. Run rollback script
NODE_ENV=production node scripts/production-customer-migration.js --rollback
```

### Full Rollback (major issues)

If critical issues found:

1. Restore database from backup
2. Revert all code deployments
3. Investigate root cause
4. Plan fixes before retry

## Verification Checklist

After migration, verify:

### Customer Operations
- [ ] New customer can register
- [ ] Existing customer can login
- [ ] Customer can view dashboard
- [ ] Customer can make reservation
- [ ] Customer can view/cancel reservations
- [ ] Customer receives emails

### Staff Operations
- [ ] Staff can login normally
- [ ] All recipes accessible
- [ ] Menu builder works
- [ ] Reservation management works
- [ ] Order management works
- [ ] No permission issues

### Data Integrity
- [ ] All customers migrated
- [ ] All reservations intact
- [ ] All orders preserved
- [ ] No duplicate accounts
- [ ] Restaurant links correct

## Common Issues and Solutions

### Issue: Customer can't login
**Solution**: Check if customer was properly migrated. Look in both `users` and `customers` tables.

### Issue: Missing reservations
**Solution**: Verify `customer_id` was updated in reservations table. Check migration logs.

### Issue: Staff marked as customer
**Solution**: Staff should never have `isCustomer=true`. Check user role assignments.

### Issue: Duplicate emails
**Solution**: Migration should handle this, but check for users with same email in both tables.

## Migration Scripts Reference

### Scripts Overview

1. **production-preflight-check.js**
   - Read-only safety checks
   - Run before ANY migration
   - Identifies potential issues

2. **production-backup.js**
   - Creates JSON backup of all data
   - Timestamped for easy identification
   - Always run before migration

3. **production-customer-migration.js**
   - Main migration script
   - Supports dry-run, execute, and rollback
   - Creates detailed logs

### Script Options

```bash
# Dry run (default, safe)
node scripts/production-customer-migration.js

# Execute migration
node scripts/production-customer-migration.js --execute

# Rollback migration
node scripts/production-customer-migration.js --rollback
```

## Database Schema Changes

### New Tables Created

1. **customers**
   - Stores customer authentication
   - Separate from staff users
   - Enhanced security

2. **customer_profiles**
   - Customer preferences
   - Dietary restrictions
   - Notes

3. **customer_sessions**
   - JWT session management
   - Separate from user sessions

4. **customer_restaurants**
   - Links customers to restaurants
   - Supports multi-tenant future

### Modified Tables

1. **reservations**
   - Added `customer_id` column
   - Links to customers table
   - Maintains `user_id` for compatibility

2. **orders**
   - Added `customer_id` column
   - Links to customers table
   - Maintains `user_id` for compatibility

## Post-Migration Cleanup

After successful migration and stability period (1-2 weeks):

1. Remove `isCustomer` flag from users table
2. Remove customer data from users table
3. Update queries to use only new schema
4. Remove compatibility layer code

## Support and Troubleshooting

### Logs Location
- Migration logs: `backend/scripts/migration-log-YYYY-MM-DD.json`
- Backup files: `backend/scripts/backups/backup-*.json`

### Emergency Contacts
- Database Admin: [Contact]
- Lead Developer: [Contact]
- On-call Support: [Contact]

### Monitoring Dashboards
- Error tracking: [URL]
- Database metrics: [URL]
- User reports: [URL]

## Final Reminders

1. **Test everything twice** - local and staging
2. **Backup before migration** - no exceptions
3. **Monitor after deployment** - catch issues early
4. **Document any deviations** - help future migrations
5. **Celebrate success** - but stay vigilant for 24 hours

Remember the production database incident. One wrong command can destroy months of work. Be careful, be methodical, and when in doubt, stop and ask for help. 