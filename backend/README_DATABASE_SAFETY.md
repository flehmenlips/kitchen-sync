# Database Safety Guide 🛡️

## ⚠️ CRITICAL: Always Verify Your Database Connection

### Quick Check Commands

Before running ANY database operations, verify which database you're connected to:

```bash
# Check which database you're connected to
npm run db:check

# Or manually:
cd backend && dotenv -e .env.local -- node scripts/check-db-connection.js
```

### Safe Commands for Local Development

Always use these commands for local development:

```bash
# Start dev server with local database
npm run dev:local

# Open Prisma Studio with local database
npm run prisma:studio
# or
npm run prisma:studio:local

# Run migrations on local database
dotenv -e .env.local -- npx prisma migrate dev

# Check users in local database
npm run db:check
```

### Production Commands (USE WITH EXTREME CAUTION)

These commands have built-in warnings and delays:

```bash
# Open production database (5-second warning delay)
npm run prisma:studio:prod

# Check production database (5-second warning delay)
npm run db:check:prod
```

### Environment File Structure

- `.env` - Production environment (NEVER edit directly)
- `.env.local` - Local development environment
- `.env.example` - Template for new developers

### Visual Indicators

Look for these signs to know which database you're using:

**Local Database:**
- URL contains `localhost` or `127.0.0.1`
- Usually has test data (test@example.com)
- Safe for experimentation

**Production Database:**
- URL contains `render.com`, `amazonaws.com`, or similar
- Has real user data
- ⚠️ ANY CHANGES ARE PERMANENT

### Common Pitfalls to Avoid

1. **DON'T use `--` syntax with dotenv**
   ```bash
   # ❌ WRONG (may not load .env.local correctly)
   dotenv -e .env.local -- npx prisma studio
   
   # ✅ CORRECT
   npm run prisma:studio
   ```

2. **ALWAYS be in the backend directory**
   ```bash
   # ❌ WRONG
   dotenv -e .env.local npx prisma studio
   
   # ✅ CORRECT
   cd backend && npm run prisma:studio
   ```

3. **NEVER run migrations on production without backup**
   ```bash
   # ⚠️ DANGEROUS
   npx prisma migrate dev
   
   # ✅ SAFER (for production)
   npx prisma migrate deploy
   ```

### Emergency Kill Switch

If you accidentally start a command on production:
```bash
# Kill all Prisma processes
pkill -f prisma

# Kill all Node processes
pkill -f node
```

### Setting Up Safeguards

1. **Color your terminal** - Use different terminal themes for production vs development
2. **Use aliases** - Create shell aliases that always use .env.local
3. **Git hooks** - Add pre-commit hooks to check for .env changes

### Verification Checklist

Before any database operation:
- [ ] Run `npm run db:check` to verify connection
- [ ] Check terminal prompt/theme
- [ ] Verify URL doesn't contain production domains
- [ ] Confirm test data (not real users) if viewing data
- [ ] Have backups if running migrations

Remember: When in doubt, STOP and verify! 