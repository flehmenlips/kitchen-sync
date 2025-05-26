# Prisma Migration Best Practices

## Development Workflow

### 1. Make Schema Changes
Edit `backend/prisma/schema.prisma` to add/modify models:

```prisma
model Customer {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  // ... other fields
}
```

### 2. Create a Migration
Instead of using `prisma db push` (which only updates YOUR database), create a migration:

```bash
cd backend
npx prisma migrate dev --name add_customer_model
```

This will:
- Create a migration file in `prisma/migrations/`
- Apply changes to your local database
- Regenerate Prisma Client

### 3. Commit Migration Files
**IMPORTANT**: Commit the generated migration files!

```bash
git add prisma/migrations/
git commit -m "Add customer model migration"
git push
```

## Production Deployment

### 1. Deploy Code
Push your code to GitHub, which triggers deployment on Render.

### 2. Run Migrations in Production
In your deployment process (or manually in Render shell):

```bash
cd backend
npx prisma migrate deploy
```

This applies all pending migrations to the production database.

### 3. Verify Schema
```bash
npx prisma db pull
```

This shows you the actual production schema.

## Why This Matters

### ❌ What We Did (Wrong Way)
1. Changed schema.prisma
2. Used `db push` locally (no migration files created)
3. Manually created tables in production with SQL
4. Tables had different column names/types
5. Prisma client expected different schema = 500 errors

### ✅ What We Should Do (Right Way)
1. Change schema.prisma
2. Run `prisma migrate dev` (creates migration files)
3. Commit migration files
4. Run `prisma migrate deploy` in production
5. Schema matches perfectly = No errors

## Setting Up Automatic Migrations

### Option 1: Build Command (Recommended)
In Render, set your build command to:

```bash
cd backend && npm install && npx prisma generate && npx prisma migrate deploy
```

### Option 2: Post-Deploy Hook
Create `backend/scripts/post-deploy.sh`:

```bash
#!/bin/bash
echo "Running database migrations..."
npx prisma migrate deploy
echo "Migrations complete!"
```

## Emergency Fixes

If you need to sync a messed-up production database:

```bash
# 1. Pull current production schema
npx prisma db pull

# 2. See what's different
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# 3. Create a migration to fix it
npx prisma migrate dev --name fix_production_schema

# 4. Deploy the fix
npx prisma migrate deploy
```

## Golden Rules

1. **Never use `db push` in production** - It's for development only
2. **Always commit migration files** - They're your schema history
3. **Run `migrate deploy` in production** - This applies migrations safely
4. **Test migrations locally first** - Run them in development before production
5. **Keep schema.prisma as source of truth** - Database should match it exactly

## Quick Reference

```bash
# Development (creates migration files)
npx prisma migrate dev --name describe_your_change

# Production (applies migrations)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# View current schema
npx prisma db pull
``` 