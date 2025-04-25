# Kitchen Sync Project Scratchpad

## Background and Motivation
Kitchen Sync is a recipe and prep management system. This document tracks ongoing development tasks, decisions, and pending items that need revisiting.

## Project Status Board
- [x] Implement custom prep columns feature
- [x] Update AddRecipeDialog to work with custom columns
- [ ] Review and apply database maintenance scripts
- [x] Clean up redundant backend directory structure
- [x] Implement recipe task addition to columns
- [x] Fix API endpoint configuration for prep tasks
- [x] Fix recipeId type mismatch when adding recipes to prep board

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
- **Why**: Project had duplicate code and configurations in multiple locations
- **Status**: ✅ COMPLETED
- **Actions Taken**:
  1. Nested backend directory:
     - Removed redundant `backend/backend/prisma/migrations`
     - Verified all migrations in main `prisma/migrations`
     - Database schema is up to date
  2. Root src directory:
     - Removed outdated versions of backend code
     - All functionality exists in `backend/src` with improvements
  3. Root configuration files:
     - Removed `tsconfig.json` that referenced old `src` directory
     - Removed `package.json` and `package-lock.json`
     - Removed redundant root `node_modules`
- **Final Structure**:
  ```
  kitchen-sync/
  ├── frontend/          # React frontend
  ├── backend/           # Express backend
  ├── docs/             # Project documentation
  │   ├── requirements.md
  │   └── architecture.md
  ├── .cursor/          # IDE/development tools
  ├── .gitignore
  └── README.md
  ```
- **Verification**:
  - All application code properly organized in frontend/backend
  - No redundant configurations or dependencies
  - Clean project structure with clear separation of concerns

## Recent Decisions and Changes
1. **Custom Columns Feature** (2024-04-20)
   - Implemented drag-and-drop column reordering
   - Added column management UI
   - Created backend API endpoints

2. **Code Cleanup** (2024-04-20)
   - Removed redundant `app.ts` (functionality exists in `server.ts`)
   - Separated maintenance scripts to dedicated branch
   - Stashed AddRecipeDialog changes for future PR

3. **Recipe Task Management Implementation** (2024-04-24)
   - Updated PrepBoard.tsx to include a Floating Action Button that opens the AddRecipeDialog
   - Enhanced AddRecipeDialog to dynamically use custom columns
   - Updated RecipeDetail.tsx to show a column selection dialog when adding recipes to prep
   - Added proper task creation through the prepTaskService API
   - Improved UX with better error handling and success messages

4. **API Configuration Fix** (2024-04-24)
   - Fixed inconsistent API endpoint paths in `prepTaskService.ts`
   - Fixed missing `/api` prefix in `prepColumnService.ts` API endpoint paths
   - Fixed double `/api` prefix issue by removing it from axios baseURL in `api.ts`
   - Updated Vite proxy configuration to target correct backend port (3001)
   - Resolved 404 errors when loading prep board and adding recipes

5. **Type Mismatch Fix** (2024-04-24)
   - Fixed type mismatch between frontend and backend for recipeId
   - Updated `CreatePrepTaskInput` interface to use number instead of string
   - Added explicit type conversion in components before sending data to the API
   - Prevented 500 internal server errors when adding recipes to the prep board

## Lessons
- Always check for hardcoded constants when implementing dynamic features
- Keep maintenance scripts separate from application code
- Document stashed changes and branch purposes for future reference
- Maintain consistent API endpoint paths across service methods
- Ensure proxy configuration in Vite points to the correct backend server port
- Include info useful for debugging in the program output
- Be aware of how path prefixes are applied in the API service configuration - avoid double prefixing
- Ensure type consistency between frontend and backend, especially for IDs and foreign keys

## Executor's Feedback or Assistance Requests
- Recipe task addition to custom columns has been successfully implemented 
- Both PrepBoard.tsx and RecipeDetail.tsx now use dynamic column selection
- The application has been tested locally and functions correctly
- Resolved API endpoint configuration issues for the prep tasks feature
- Fixed missing columns issue by correcting API paths in prepColumnService and axios baseURL
- Fixed type mismatch errors when adding recipes to prep board
- Remaining task: Review database maintenance scripts before deploying to production
- Future enhancement: Consider adding batch operations for tasks (adding multiple recipes at once)

## Key Challenges and Analysis
- Maintaining data integrity while allowing custom columns
- Ensuring smooth transition from hardcoded to dynamic column system
- Coordinating database maintenance without disrupting service
- Managing consistent API endpoint configurations between frontend and backend
- Ensuring type consistency between frontend TypeScript interfaces and backend database schema

### Recipe Task Addition Implementation (Priority: High)
- **What**: Implement recipe task addition to prep board columns
- **Why**: Current implementation uses hardcoded columns and outdated task structure
- **Status**: ✅ COMPLETED
- **Components Updated**:
  1. AddRecipeDialog:
     - Removed hardcoded column references
     - Updated to use dynamic column selection
     - Improved error handling and success messaging
     - Added proper type conversion for recipeId (string → number)
  2. RecipeDetail:
     - Removed hardcoded column references
     - Added column selection dialog
     - Improved user feedback on adding tasks
     - Added proper type conversion for recipeId (string → number)
  3. PrepBoard:
     - Added Floating Action Button for adding recipes
     - Integrated AddRecipeDialog component
     - Improved overall user experience
- **Verification**:
  - Users can now add recipes to any custom column 
  - Dynamic column selection implemented in two entry points:
    1. From the Prep Board via the "+" FAB
    2. From a Recipe Detail page via the "Add to Prep Board" button
  - Consistent UX between both methods
  
### API Configuration Fix (Priority: High)
- **What**: Fix API endpoint configuration for prep tasks and columns
- **Why**: Users encountered 404 errors when using the prep board features
- **Status**: ✅ COMPLETED
- **Issues Fixed**:
  1. Inconsistent API paths in prepTaskService.ts:
     - `getAllTasks` used `BASE_URL` (/api/prep-tasks)
     - `getTasks` used a different path (/prep-tasks)
  2. Missing `/api` prefix in prepColumnService.ts paths:
     - All endpoint paths were missing the `/api` prefix
     - Added `BASE_URL` constant to ensure consistency
  3. Double `/api` prefix in axios configuration:
     - baseURL in api.ts included `/api` suffix
     - This caused endpoints to have `/api` twice
     - Removed `/api` suffix from baseURL
  4. Incorrect proxy configuration in Vite:
     - Target was set to port 3000 instead of 3001
- **Verification**:
  - Prep board loads columns and tasks correctly
  - Add recipe functionality works correctly from both entry points
  - No 404 errors in console when using prep board features
  
### Type Mismatch Fix (Priority: High)
- **What**: Fix type mismatch between frontend and backend for recipeId
- **Why**: Backend expects recipeId as an integer but frontend was sending it as a string
- **Status**: ✅ COMPLETED
- **Issues Fixed**:
  1. Updated the `CreatePrepTaskInput` interface in `prep.ts`:
     - Changed `recipeId` from `string` to `number` type
  2. Modified `AddRecipeDialog.tsx` component:
     - Added explicit conversion of recipe.id to number using parseInt()
  3. Modified `RecipeDetail.tsx` component:
     - Added explicit conversion of recipe.id to number using parseInt()
- **Verification**:
  - Adding recipes to prep board works correctly from both entry points
  - No more 500 internal server errors when adding recipes
  - Server correctly processes the recipe reference and adds tasks to the selected column 