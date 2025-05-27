# Production Database Migration Plan for Platform Architecture

## Overview
This document outlines the strategy for migrating the production database on Render.com to support the new multi-tenant SaaS architecture while preserving all existing data.

## Current State Analysis
- **Database**: PostgreSQL on Render.com (currently paused)
- **Existing Data**: 
  - Users (restaurant staff)
  - Restaurants
  - Recipes, ingredients, menus
  - Reservations
  - Customer data
  - All operational data

## Migration Strategy

### Phase 1: Pre-Migration Preparation

1. **Create Full Backup**
   ```bash
   # From local machine with production credentials
   pg_dump -h <render-host> -U <username> -d <database> -f backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Create Migration Scripts**
   - Script to analyze existing data relationships
   - Script to map existing users to new restaurant ownership model
   - Script to create platform admin from your account

### Phase 2: Schema Migration

1. **Apply Platform Architecture Migration**
   ```bash
   # The migration file is already created:
   # backend/prisma/migrations/20250526210850_add_platform_architecture/migration.sql
   ```

2. **Critical Schema Changes**
   - New tables added (non-breaking)
   - Existing tables enhanced with new columns (with defaults)
   - No breaking changes to existing functionality

### Phase 3: Data Migration Scripts

Create these scripts in `backend/scripts/production-migration/`:

#### 1. `01-create-platform-admin.sql`
```sql
-- Create platform super admin from your existing user account
INSERT INTO platform_admins (email, name, password, role, created_at, updated_at)
SELECT 
  email,
  name,
  password,
  'SUPER_ADMIN',
  NOW(),
  NOW()
FROM users 
WHERE email = 'george@seabreeze.farm'
LIMIT 1;
```

#### 2. `02-connect-restaurants-to-platform.sql`
```sql
-- Update restaurants with platform fields
UPDATE restaurants r
SET 
  onboarding_status = 'ACTIVE',
  owner_name = u.name,
  owner_email = u.email,
  business_phone = r.phone,
  business_address = CONCAT(r.address, ', ', r.city, ', ', r.state, ' ', r."zipCode"),
  verified_at = r.created_at,
  updated_at = NOW()
FROM (
  SELECT DISTINCT ON (rs.restaurant_id) 
    rs.restaurant_id,
    u.name,
    u.email
  FROM restaurant_staff rs
  JOIN users u ON u.id = rs.user_id
  WHERE u.role = 'ADMIN' OR u.role = 'SUPERADMIN'
  ORDER BY rs.restaurant_id, rs.created_at ASC
) AS owner_data
JOIN users u ON u.email = owner_data.email
WHERE r.id = owner_data.restaurant_id;
```

#### 3. `03-create-subscriptions.sql`
```sql
-- Create trial subscriptions for existing restaurants
INSERT INTO subscriptions (
  restaurant_id,
  plan,
  status,
  current_period_start,
  current_period_end,
  trial_ends_at,
  seats,
  billing_email,
  billing_name,
  created_at,
  updated_at
)
SELECT 
  r.id,
  'PROFESSIONAL', -- Give existing restaurants professional plan
  'ACTIVE',
  NOW(),
  NOW() + INTERVAL '30 days',
  NULL, -- No trial, they're already active
  20, -- Professional plan seats
  r.owner_email,
  r.owner_name,
  NOW(),
  NOW()
FROM restaurants r
WHERE r.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s WHERE s.restaurant_id = r.id
  );
```

#### 4. `04-migrate-customers-to-diners.sql`
```sql
-- Migrate customers to platform-wide diners
INSERT INTO diners (
  email,
  name,
  phone,
  password,
  is_verified,
  created_at,
  updated_at
)
SELECT DISTINCT ON (c.email)
  c.email,
  c.name,
  c.phone,
  c.password,
  true, -- Assume existing customers are verified
  c.created_at,
  NOW()
FROM customers c
WHERE c.email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- Create diner_restaurant_profiles
INSERT INTO diner_restaurant_profiles (
  diner_id,
  restaurant_id,
  visit_count,
  last_visit_date,
  total_spent,
  preferences,
  created_at,
  updated_at
)
SELECT 
  d.id,
  c.restaurant_id,
  COALESCE(stats.visit_count, 0),
  stats.last_visit,
  COALESCE(stats.total_spent, 0),
  c.preferences,
  c.created_at,
  NOW()
FROM customers c
JOIN diners d ON d.email = c.email
LEFT JOIN LATERAL (
  SELECT 
    COUNT(*) as visit_count,
    MAX(date) as last_visit,
    SUM(total_amount) as total_spent
  FROM reservations
  WHERE customer_id = c.id
) stats ON true;
```

### Phase 4: Deployment Process

1. **Pre-deployment Checklist**
   - [ ] Full database backup completed
   - [ ] Migration scripts tested on staging
   - [ ] Rollback plan prepared
   - [ ] Maintenance window scheduled

2. **Deployment Steps**
   ```bash
   # 1. Unpause database on Render
   
   # 2. Run Prisma migration
   cd backend
   npm run db:migrate:prod
   
   # 3. Run data migration scripts in order
   psql -h <render-host> -U <username> -d <database> -f scripts/production-migration/01-create-platform-admin.sql
   psql -h <render-host> -U <username> -d <database> -f scripts/production-migration/02-connect-restaurants-to-platform.sql
   psql -h <render-host> -U <username> -d <database> -f scripts/production-migration/03-create-subscriptions.sql
   psql -h <render-host> -U <username> -d <database> -f scripts/production-migration/04-migrate-customers-to-diners.sql
   
   # 4. Verify migration
   node scripts/verify-production-migration.js
   ```

### Phase 5: Post-Migration Verification

Create `verify-production-migration.js`:
```javascript
// Script to verify all data migrated correctly
// - Check all restaurants have owners
// - Check all restaurants have subscriptions
// - Check customers migrated to diners
// - Check platform admin exists
// - Run integrity checks
```

## Rollback Plan

If issues occur:
1. Stop application servers
2. Restore from backup:
   ```bash
   psql -h <render-host> -U <username> -d <database> < backup_YYYYMMDD_HHMMSS.sql
   ```
3. Revert code deployment
4. Investigate and fix issues

## Testing Strategy

1. **Local Testing**
   - Create production data subset
   - Run migration locally
   - Verify all features work

2. **Staging Environment**
   - Clone production database
   - Run full migration
   - Complete regression testing

## Timeline

1. **Week 1**: Prepare and test migration scripts
2. **Week 2**: Test on staging environment
3. **Week 3**: Schedule maintenance window and execute

## Risk Mitigation

1. **Data Loss**: Full backup before migration
2. **Downtime**: Run during low-traffic window
3. **Compatibility**: No breaking changes to existing APIs
4. **Performance**: Index new foreign keys

## Success Criteria

- [ ] All existing users can log in
- [ ] All restaurant data preserved
- [ ] Platform admin can access portal
- [ ] New registrations work
- [ ] No data loss
- [ ] Performance maintained 