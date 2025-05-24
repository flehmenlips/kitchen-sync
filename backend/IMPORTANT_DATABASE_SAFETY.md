# CRITICAL DATABASE SAFETY RULES

## NEVER Run These Commands on Production:
- `prisma migrate reset`
- `prisma db push --force-reset`
- Any command with `--force` without careful consideration

## Always Use Separate Databases:
1. **Production Database**: Only for live data
2. **Development Database**: For local development
3. **Test Database**: For running tests

## Before Any Database Changes:
1. **ALWAYS CREATE A BACKUP FIRST**
2. Test on development database
3. Review migration files
4. Apply to production only after testing

## How to Create Backups:
```bash
# Export your database
pg_dump YOUR_DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Import a backup
psql YOUR_DATABASE_URL < backup_file.sql
```

## Setting Up Local Development Database:
1. Install PostgreSQL locally
2. Create a local database: `createdb kitchensync_dev`
3. Update your .env to use local database
4. Run migrations: `npx prisma migrate dev` 