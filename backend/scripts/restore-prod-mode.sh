#!/bin/bash

echo "=== RESTORING PRODUCTION MODE ==="

# Check if we need to restore
if [ ! -f ".env.prod.DISABLED" ]; then
  echo "⚠️  No disabled production file found"
  exit 1
fi

# Restore production env file
mv .env.prod.DISABLED .env.prod
echo "✅ Restored .env.prod from .env.prod.DISABLED"

echo ""
echo "⚠️  PRODUCTION MODE AVAILABLE"
echo "Production env file has been restored."
echo "To use production, manually copy: cp .env.prod .env"
echo "To return to safe mode, run: ./scripts/safe-dev-mode.sh" 