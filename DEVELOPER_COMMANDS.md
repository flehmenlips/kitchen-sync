# KitchenSync Developer Commands

## Quick Start (Run from project root)

```bash
# Start backend server
npm run backend

# Start frontend dev server
npm run frontend

# Start both backend and frontend
npm run dev:all

# Open Prisma Studio
npm run db:studio

# Check multi-tenant status
npm run db:check
```

## Backend Commands (Auto-navigates to backend/)

All these commands can be run from the project root:

```bash
# Development
npm run backend          # Start backend with local database
npm run build:backend    # Build TypeScript

# Database
npm run db:studio        # Open Prisma Studio
npm run db:migrate       # Run Prisma migrations
npm run db:check         # Check multi-tenant status
```

## Frontend Commands (Auto-navigates to frontend/)

```bash
npm run frontend         # Start frontend dev server
npm run build:frontend   # Build for production
```

## Full Stack

```bash
npm run dev:all          # Start both backend and frontend concurrently
npm run build            # Build both backend and frontend
npm run install:all      # Install dependencies for root, backend, and frontend
```

## Direct Backend Commands (if you're already in backend/)

```bash
npm run dev:local        # Start with local database
npm run dev              # Start with production database (be careful!)
npm run db:check:multi-tenant
npm run db:migrate:multi-tenant
npm run db:create:customer-tables
```

## Tips for AI Agents

When using AI assistants (Cursor, GitHub Copilot, etc.), always:
1. Run commands from the project root using the npm scripts
2. Or explicitly navigate: `cd backend && npm run dev:local`
3. Check current directory with `pwd` if unsure

## Environment Files

- `backend/.env` - Production database (⚠️ BE CAREFUL!)
- `backend/.env.local` - Local development database (safe to use)

Always use `:local` scripts for development! 