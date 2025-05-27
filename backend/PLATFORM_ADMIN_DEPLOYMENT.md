# Platform Admin Deployment Guide

## Overview
This guide walks through deploying the KitchenSync Platform Admin system to production.

## Current State
- 7 restaurants exist in production (IDs 1-7)
- All restaurants have been assigned owners
- Platform admin tables do NOT exist yet
- Frontend platform admin UI is ready

## Deployment Steps

### Step 1: Backup Production Database
```bash
# Run from backend directory
chmod +x scripts/backup-production-db.sh
./scripts/backup-production-db.sh
```

### Step 2: Deploy Platform Admin Tables
You'll need to run the SQL migration directly on your production database.

#### Option A: Using psql directly
```bash
# Get your production database credentials from Render
psql -h <your-db-host> -U <your-db-user> -d <your-db-name> -f scripts/deploy-platform-admin-tables.sql.txt
```

#### Option B: Using Render's database shell
1. Go to your database service in Render
2. Click on "Shell" tab
3. Copy and paste the contents of `scripts/deploy-platform-admin-tables.sql.txt`

### Step 3: Create Platform Admin User
```bash
# From backend directory
chmod +x scripts/create-platform-admin-production.js
node scripts/create-platform-admin-production.js
```

This will create:
- Email: admin@kitchensync.io
- Password: KitchenSync2024! (CHANGE IMMEDIATELY)
- Role: SUPERADMIN

### Step 4: Deploy Backend Changes
Ensure your backend has the platform admin routes:

```bash
# Commit and push if not already done
git add -A
git commit -m "feat: Add platform admin system"
git push origin main
```

Render will automatically deploy the changes.

### Step 5: Verify Deployment
1. Check platform admin tables exist:
   ```bash
   node scripts/check-platform-tables.js
   ```

2. Access platform admin panel:
   - Navigate to: https://[your-domain]/platform-admin/login
   - Login with the credentials created in Step 3

### Step 6: Post-Deployment Tasks

#### Immediate Actions:
1. **Change the default admin password**
2. **Create additional admin users if needed**
3. **Review all restaurants and their subscriptions**

#### Configure Platform Settings:
1. Set up email notifications
2. Configure Stripe (when ready)
3. Set up monitoring alerts

## Platform Admin Features

### Restaurant Management
- View all restaurants
- Edit restaurant details
- Manage subscriptions
- View usage statistics

### User Management
- View restaurant staff
- Reset passwords
- Manage roles

### Subscription Management
- View/edit subscriptions
- Process payments (future)
- Handle upgrades/downgrades

### Support System
- View support tickets
- Respond to restaurant inquiries
- Internal notes

## Security Considerations

### Current Implementation:
- Integer IDs (1, 2, 3, etc.)
- Role-based access control
- Audit logging for all actions

### Future Enhancements:
1. **UUID Migration** (Major update)
   - More secure against enumeration
   - Industry standard
   - Requires careful migration

2. **Additional Security**
   - Two-factor authentication
   - IP whitelisting
   - Session management

## Troubleshooting

### Common Issues:

1. **"platform_admins table does not exist"**
   - Run the SQL migration first (Step 2)

2. **"Cannot connect to database"**
   - Check your .env file has production DATABASE_URL
   - Ensure you're not using .env.local

3. **"Platform admin already exists"**
   - Admin user was already created
   - Use the existing credentials or reset password

### Rollback Plan:
If issues arise, you can rollback:
```sql
-- Remove platform admin tables (CAUTION: This deletes all platform data)
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS restaurant_notes CASCADE;
DROP TABLE IF EXISTS usage_records CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS platform_actions CASCADE;
DROP TABLE IF EXISTS platform_admins CASCADE;
```

## Next Steps

1. **Monitor the deployment** for any issues
2. **Train team members** on platform admin usage
3. **Document restaurant onboarding** process
4. **Plan UUID migration** for future security enhancement
5. **Implement Stripe integration** for payments

## Support
For issues or questions:
- Check application logs in Render
- Review error messages in browser console
- Contact development team for assistance 