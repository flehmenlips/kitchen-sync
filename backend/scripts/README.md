# Database Scripts - SAFETY FIRST! 🚨

## ⚠️ CRITICAL SAFETY INFORMATION

After a catastrophic incident where production data was accidentally deleted, we have implemented multiple safety measures to prevent this from happening again.

## Available Scripts

### Safe Scripts ✅

1. **`npm run db:backup`** - Creates a backup of your database
   - Always run this before any potentially destructive operation
   - Backups are stored in `backend/backups/` (gitignored)
   - Works with both local and production databases

2. **`npm run db:check-safety`** - Check database safety configuration
   - Shows current database connection
   - Indicates if you're connected to production
   - Shows safety flags

3. **`npm run db:safe-cleanup`** - Safe database cleanup with multiple confirmations
   - Shows preview of what will be deleted
   - Requires 3 separate confirmations for production
   - Actual deletion code is commented out by default

### Dangerous Scripts ❌

The following script has been REMOVED for safety:
- `cleanup-test-users.js` - This script accidentally deleted all production data

## Safety Features

1. **Production Detection**: Scripts automatically detect production databases by checking for:
   - `render.com` in the connection string
   - `NODE_ENV=production`
   - Other production indicators

2. **Multiple Confirmations**: For production databases, you must:
   - Type "I UNDERSTAND THE RISKS"
   - Type the exact database name
   - Type "PROCEED" for final confirmation

3. **Preview Mode**: Scripts show what would be deleted before any action

4. **Logging**: All dangerous operations are logged with timestamps

## Best Practices

1. **Always backup first**: Run `npm run db:backup` before any cleanup
2. **Use local database for testing**: Set up a local PostgreSQL for development
3. **Read confirmation prompts carefully**: They contain important information
4. **Never bypass safety checks**: They exist for a reason

## Environment Variables

- `DATABASE_URL`: Your database connection string
- `NODE_ENV`: Set to "production" on production servers
- `ALLOW_PRODUCTION_CHANGES`: Set to "true" to allow production modifications (NOT RECOMMENDED)

## Emergency Recovery

If you accidentally delete data:
1. STOP all operations immediately
2. Contact your hosting provider (e.g., Render) for backup restoration
3. Request restoration to a point BEFORE the deletion
4. Verify the restored data before proceeding

## Remember

**With great power comes great responsibility.** These scripts can destroy data permanently. Always think twice, backup first, and when in doubt, don't proceed.

---

*Last updated after the Great Data Loss Incident of May 25, 2025* 