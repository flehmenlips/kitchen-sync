#!/bin/bash

echo "=== ENABLING SAFE DEVELOPMENT MODE ==="

# Check if we're already in safe mode
if [ -f ".env.prod.DISABLED" ]; then
  echo "✅ Already in safe development mode"
  exit 0
fi

# Rename production env file to prevent accidental use
if [ -f ".env.prod" ]; then
  mv .env.prod .env.prod.DISABLED
  echo "✅ Renamed .env.prod to .env.prod.DISABLED"
fi

# Ensure we're using local database
if [ -f ".env.local" ]; then
  cp .env.local .env
  echo "✅ Copied .env.local to .env"
fi

# Verify connection
echo ""
node scripts/check-current-db.js

echo ""
echo "🛡️  SAFE MODE ENABLED"
echo "Production database is protected."
echo "To restore production access, run: ./scripts/restore-prod-mode.sh" 