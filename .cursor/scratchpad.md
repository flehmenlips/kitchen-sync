# Kitchen Sync Project Scratchpad

## Background and Motivation
Kitchen Sync is a recipe and prep management system. This document tracks ongoing development tasks, decisions, and pending items that need revisiting.

## Project Status Board
- [x] Implement custom prep columns feature
- [ ] Update AddRecipeDialog to work with custom columns
- [ ] Review and apply database maintenance scripts
- [x] Clean up redundant backend directory structure

## Pending Tasks and Future Work

### Task Management Update (Priority: High)
- **What**: Update `AddRecipeDialog.tsx` to work with new custom columns system
- **Why**: Currently using old hardcoded `COLUMN_IDS.TO_PREP` constant
- **Status**: Changes stashed with message "AddRecipeDialog changes for future task management PR"
- **Next Steps**: 
  1. Create new feature branch from `feature/custom-prep-columns`
  2. Apply stashed changes
  3. Update to use dynamic column selection
  4. Update tests and documentation

### Database Maintenance (Priority: Medium)
- **What**: Apply database cleanup and maintenance scripts
- **Why**: Need to fix duplicate recipes and data integrity issues
- **Status**: Scripts committed to `chore/db-maintenance-scripts` branch
- **Location**: 
  - `backend/src/scripts/checkRecipes.ts`
  - `backend/src/scripts/fixRecipes.ts`
- **Next Steps**:
  1. Review script functionality in development environment
  2. Create backup of production database
  3. Test scripts on backup
  4. Schedule maintenance window
  5. Apply fixes in production

### Directory Structure Cleanup (Priority: High)
- **What**: Remove redundant directories and files
- **Why**: Project has duplicate code and configurations in multiple locations
- **Status**: 
  - ✅ Removed `backend/backend` directory
  - ✅ Removed root `src` directory
  - ⏳ Need to clean up root configuration
- **Analysis**:
  1. Nested backend directory (RESOLVED):
     - Removed redundant `backend/backend/prisma/migrations`
     - Verified all migrations in main `prisma/migrations`
     - Database schema is up to date
  2. Root src directory (RESOLVED):
     - Removed outdated versions of backend code
     - All functionality exists in `backend/src` with improvements
  3. Root configuration files (PENDING):
     - `tsconfig.json` references removed `src` directory
     - `package.json` has dependencies that should be in backend/frontend
     - Root `node_modules` is redundant with backend/frontend modules
- **Next Steps**:
  1. Remove root configuration files:
     - Delete `tsconfig.json`
     - Delete `package.json` and `package-lock.json`
     - Delete root `node_modules`
  2. Update git to track deletions
  3. Verify no references to old files exist

## Recent Decisions and Changes
1. **Custom Columns Feature** (2024-04-20)
   - Implemented drag-and-drop column reordering
   - Added column management UI
   - Created backend API endpoints

2. **Code Cleanup** (2024-04-20)
   - Removed redundant `app.ts` (functionality exists in `server.ts`)
   - Separated maintenance scripts to dedicated branch
   - Stashed AddRecipeDialog changes for future PR

## Lessons
- Always check for hardcoded constants when implementing dynamic features
- Keep maintenance scripts separate from application code
- Document stashed changes and branch purposes for future reference

## Executor's Feedback or Assistance Requests
- Need to schedule a review of database maintenance scripts
- Need to plan the AddRecipeDialog update implementation

## Key Challenges and Analysis
- Maintaining data integrity while allowing custom columns
- Ensuring smooth transition from hardcoded to dynamic column system
- Coordinating database maintenance without disrupting service 