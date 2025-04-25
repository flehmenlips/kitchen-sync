# Kitchen Sync Project Scratchpad

## Background and Motivation
Kitchen Sync is a comprehensive restaurant management system designed to streamline operations by unifying recipe development, kitchen prep workflows, menu creation, reservations, and order management into a single, interconnected system. The project aims to reduce redundancy, improve efficiency, enhance consistency, and provide valuable data insights for a modern kitchen.

## Project Context
### Vision and Goals
The vision of KitchenSync is to create a centralized, dynamic, customizable, and comprehensive software suite that seamlessly integrates all core aspects of kitchen and restaurant management, from initial recipe conception to final order delivery on the line.

### Core Modules
1. **Recipe Engine (CookBook)**: A robust database and interface for creating, storing, searching, scaling, costing, and managing recipes and sub-recipes.
2. **Prep Flow Manager (AgileChef)**: A Kanban-style workflow tool for visualizing and managing kitchen prep tasks derived from recipes and production needs.
3. **Menu Designer (MenuBuilder)**: A tool for designing, laying out, and printing/exporting menus, pulling data directly from the Recipe Engine.
4. **Reservation & Order System (TableFarm)**: Manages customer reservations, table management, and captures customer orders, linking them to menu items.
5. **Kitchen Display System (ChefRail)**: Displays active orders/tickets from the Reservation & Order System in real-time for the cooking line, allowing for status updates.

### Technical Architecture
- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Node.js with Express framework
- **Database**: PostgreSQL
- **Deployment**: Render.com (or similar Platform-as-a-Service)

### Current Development Focus
Currently, the project is focused on two primary modules:
1. **CookBook (Recipe Engine)**: Currently in active development and testing phase
2. **AgileChef (Prep Flow Manager)**: The current focus of our development efforts

## Project Status Board
- [x] Implement custom prep columns feature
- [x] Update AddRecipeDialog to work with custom columns
- [ ] Review and apply database maintenance scripts
- [x] Clean up redundant backend directory structure
- [x] Implement recipe task addition to columns
- [x] Fix API endpoint configuration for prep tasks
- [x] Fix recipeId type mismatch when adding recipes to prep board
- [x] Implement CRUD operations for prep columns
- [x] Implement CRUD operations for prep tasks
- [x] Implement drag-and-drop reordering for columns
- [x] Implement drag-and-drop reordering for tasks
- [x] Fix bug with vertical drag-and-drop in same column

## Current Focus
We've successfully implemented a complete, customizable prep board system with drag-and-drop functionality for both columns and tasks. Users can now fully manage their prep workflow through an intuitive interface. We've also fixed the critical bug that was causing tasks to disappear when dragging vertically within the same column.

### Prep Column CRUD (Priority: High)
- **What**: Implement Create, Read, Update, Delete operations for prep columns
- **Why**: Allow users to fully customize their prep workflow
- **Status**: ✅ COMPLETED
- **Components Created/Updated**:
  1. Column Management UI:
     - Created `ColumnFormDialog` component for adding/editing columns
     - Created `DeleteConfirmationDialog` for column deletion
     - Updated `PrepColumn` to add edit/delete menu
     - Updated `PrepBoard` to integrate these components
  2. Backend Integration:
     - Added column management methods to prepBoardStore
     - Connected to existing API endpoints
     - Implemented proper error handling
- **Key Features**:
  1. Add new columns via the SpeedDial button
  2. Edit column name via the column menu
  3. Delete columns with confirmation
  4. Visual feedback with snackbar messages
  5. Loading indicators during operations

### Prep Task CRUD (Priority: High)
- **What**: Implement Create, Read, Update, Delete operations for prep tasks
- **Why**: Enable users to manage tasks within columns effectively
- **Status**: ✅ COMPLETED
- **Components**:
  1. Task Management UI:
     - Basic add/delete functionality was already implemented
     - `PrepCard` component displays tasks and allows deletion
     - Add task UI integrated in column headers
  2. Backend Integration:
     - Existing integration with task API endpoints
     - Proper error handling
- **Key Features**:
  1. Add tasks directly within columns
  2. Add recipes as tasks from the recipe detail page
  3. Add recipes as tasks via the SpeedDial button
  4. Delete tasks with visual feedback
  5. View associated recipes

### Column Drag-and-Drop (Priority: Medium)
- **What**: Implement drag-and-drop functionality for columns
- **Why**: Provide intuitive UX for organizing prep work
- **Status**: ✅ COMPLETED
- **Components Updated**:
  1. Column Reordering:
     - Made columns draggable using react-beautiful-dnd
     - Implemented backend sync for column order
     - Added visual feedback during drag operations
     - Added drag handle icon for better UX
- **Key Features**:
  1. Drag columns to reorder them horizontally
  2. Visual feedback during column drag operations
  3. Persisted column order to backend
  4. Compatible with touch and mouse interactions

### Task Drag-and-Drop (Priority: High)
- **What**: Implement drag-and-drop functionality for tasks within and between columns
- **Why**: Provide intuitive task management and prioritization
- **Status**: ✅ COMPLETED
- **Components Updated**:
  1. PrepCard:
     - Wrapped in Draggable component
     - Added drag handle icon and visual indicators
     - Enhanced styling for improved UX during dragging
  2. PrepColumn:
     - Updated to properly render draggable tasks
     - Improved dropzone styling
  3. Task Reordering Logic:
     - Enhanced moveTask method to handle reordering efficiently
     - Integrated with batch update API for optimized backend updates
     - Optimistic UI updates for responsive feel
- **Key Features**:
  1. Drag tasks within the same column to reorder
  2. Drag tasks between columns to move them
  3. Visual feedback for source and destination during drag
  4. Consistent ordering persisted to backend
  5. Efficient batch updates for related task reordering

### Vertical Drag-and-Drop Bug Fix (Priority: Critical)
- **What**: Fix bug where tasks disappeared when vertically reordered within a column
- **Why**: Critical usability issue prevented effective task prioritization
- **Status**: ✅ COMPLETED
- **Root Cause**:
  - The `moveTask` function in prepBoardStore.ts was removing tasks from the column when reordering within the same column
  - Task was being removed but not correctly reinserted in the same column
  - The optimistic UI update worked differently for cross-column vs. same-column moves
- **Solution Implemented**:
  1. Added specific logic path for same-column reordering:
     - Used splice for removing and inserting in a single operation for same-column moves
     - Added sourceIndex tracking to know where the task was coming from
     - Only removed task from source column when moving between columns
  2. Enhanced backend reordering logic:
     - Used different update strategies for same-column vs. cross-column moves
     - For same-column moves, update the order of all tasks to maintain consistency
     - For cross-column moves, only update the moved task and tasks after insertion point
  3. Added forced refresh for same-column moves after backend update
  4. Added comprehensive logging throughout the drag-and-drop flow
- **Testing and Verification**:
  - Vertical dragging now works correctly for tasks within columns
  - Tasks remain visible and properly ordered after any drag operation
  - Both vertical (same-column) and horizontal (cross-column) dragging works consistently
  - Changes persist after page refresh, confirming proper backend synchronization

## Pending Tasks and Future Work

### Immediate Priority: System Administration & Security
- **What**: Implement enhanced security and user management features
- **Why**: Ensure proper access control and system security
- **Status**: Planning
- **Required Features**:
  1. Implementation of SuperAdmin role (george@seabreeze.farm)
  2. Enhanced user role management system
  3. Audit logging for critical operations

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

### Backup & Data Security Implementation (Priority: High)
- **What**: Set up automated backup system and data security measures
- **Why**: Protect user data and ensure business continuity
- **Status**: Planning
- **Required Features**:
  1. Automated database backup system
  2. Backup verification and integrity checks
  3. Backup restoration testing procedures
  4. Data export capabilities for users

### Feature & Bug Tracking System (Priority: Medium)
- **What**: Implement system for tracking and managing issues
- **Why**: Improve development workflow and user feedback loop
- **Status**: Planning
- **Required Features**:
  1. Internal admin interface for tracking and managing issues
  2. Customer-facing feedback/issue reporting interface 
  3. Issue prioritization and status tracking
  4. Integration with development workflow

### AgileChef (Prep Flow) Module Enhancements (Priority: Medium)
- **What**: Add additional features to the prep flow management system
- **Why**: Fulfill the remaining requirements for the Prep Flow Manager
- **Status**: Planning
- **Requirements to Address**:
  1. **REQ-M2-03**: Allow manual creation of prep tasks (✅ COMPLETED)
  2. **REQ-M2-04**: Allow users to move cards between columns (✅ COMPLETED)
  3. **REQ-M2-05**: Display key recipe info (or link) on the task card (✅ COMPLETED)
  4. **Future**: Assign tasks to users, set due dates, manage priority

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

## Long-Term Roadmap (Based on Project Vision)
1. **CookBook (Recipe Engine)**
   - Status: Active Development / Testing
   - Current Focus: Real-world recipe input and testing
   - Next Steps: Bug fixes and feature enhancements based on actual usage

2. **AgileChef (Prep Flow)**
   - Status: Active Development (Current Focus)
   - Recent Achievements: Custom columns, drag-and-drop, task management
   - Next Steps: Integration with Recipe Engine for automated task generation

3. **MenuBuilder (Menu Designer)**
   - Status: Planning
   - Dependencies: Stable CookBook module
   - Key Requirements: Import recipes, arrange menu items, design/layout tools, export to printable format

4. **TableFarm (Reservation & Order System)**
   - Status: Planning
   - Dependencies: Stable MenuBuilder module
   - Key Requirements: Reservation management, order creation, menu integration

5. **ChefRail (Kitchen Display System)**
   - Status: Planning
   - Dependencies: Stable TableFarm module
   - Key Requirements: Real-time order display, status updates, timers

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

6. **Column Management Implementation** (2024-04-24)
   - Created reusable dialog components for column operations
   - Implemented create, edit, and delete functionality for columns
   - Updated PrepBoard UI with a SpeedDial for adding columns and recipes
   - Added proper error handling and loading indicators
   - Enhanced the user experience with feedback messages

7. **Drag-and-Drop Enhancements** (2024-04-24)
   - Implemented column drag-and-drop functionality for horizontal reordering
   - Added visual cues for draggable elements (grab cursor, drag handle icon)
   - Improved drag feedback with shadows and hover effects
   - Connected reordering to backend persistence
   - Enhanced dropzone visual feedback for both tasks and columns

8. **Task Drag-and-Drop Implementation** (2024-04-24)
   - Implemented proper task dragging functionality with react-beautiful-dnd
   - Made PrepCard components draggable with visual feedback
   - Updated moveTask logic to handle batch updates efficiently
   - Improved error handling and recovery for failed drag operations
   - Enhanced visual cues for task dragging states

9. **Vertical Drag-and-Drop Bug Fix** (2024-04-25)
   - Fixed critical bug where tasks would disappear when dragged vertically within a column
   - Identified the issue in the moveTask function in prepBoardStore.ts
   - Added special handling for same-column reordering operations
   - Used different array manipulation logic for vertical vs. horizontal moves
   - Added additional logging throughout the drag-and-drop flow for debugging
   - Enhanced API request/response logging to improve traceability
   - Verified fix works by testing various drag scenarios
   - Released fix as v1.3.0 with tag "Fully functioning drag and drop kanban prep board"

## Lessons
- Always check for hardcoded constants when implementing dynamic features
- Keep maintenance scripts separate from application code
- Document stashed changes and branch purposes for future reference
- Maintain consistent API endpoint paths across service methods
- Ensure proxy configuration in Vite points to the correct backend server port
- Include info useful for debugging in the program output
- Be aware of how path prefixes are applied in the API service configuration - avoid double prefixing
- Ensure type consistency between frontend and backend, especially for IDs and foreign keys
- Reusable dialog components improve maintainability and consistency
- Adding visual cues for interactive elements improves user experience
- When implementing drag-and-drop, consider both mouse and touch interactions
- For complex reordering operations, use batch updates to minimize API calls
- Implement optimistic UI updates for a responsive user experience
- Test drag operations thoroughly across different devices and scenarios
- Handle vertical and horizontal drag operations differently - they often require different logic
- Add comprehensive logging during development to identify issues quickly
- Include debug code that can be easily enabled when problems arise
- Adding a new item to force a fresh data fetch can reveal state synchronization issues
- Don't forget to test edge cases like dragging to empty columns or reordering single tasks

## Executor's Feedback or Assistance Requests
- Recipe task addition to custom columns has been successfully implemented 
- Both PrepBoard.tsx and RecipeDetail.tsx now use dynamic column selection
- Column CRUD operations (create, read, update, delete) are now fully implemented
- Drag-and-drop reordering for columns has been implemented
- Drag-and-drop functionality for tasks within and between columns is now working
- The vertical drag-and-drop bug has been fixed and verified
- The application has been tagged as v1.3.0 for the fully functioning kanban board
- Future enhancement: Consider adding batch operations for adding multiple recipes at once

## Key Challenges and Analysis
- Maintaining data integrity while allowing custom columns
- Ensuring smooth transition from hardcoded to dynamic column system
- Coordinating database maintenance without disrupting service
- Managing consistent API endpoint configurations between frontend and backend
- Ensuring type consistency between frontend TypeScript interfaces and backend database schema
- Implementing proper drag-and-drop behavior with visual feedback
- Handling complex task reordering operations across multiple columns
- Diagnosing and fixing state management issues during same-column drag operations

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

### Column Management Implementation (Priority: High)
- **What**: Implement CRUD operations for prep columns
- **Why**: Allow users to customize their prep board with their own workflow
- **Status**: ✅ COMPLETED
- **Components Created/Modified**:
  1. Created new components:
     - `ColumnFormDialog.tsx` for adding/editing columns
     - `DeleteConfirmationDialog.tsx` for confirming deletion
  2. Updated existing components:
     - `PrepColumn.tsx` to add edit/delete menu options
     - `PrepBoard.tsx` to add SpeedDial and integrate dialogs
     - `prepBoardStore.ts` to add column management methods
- **Key Features**:
  1. Create new columns with custom names
  2. Edit existing column names
  3. Delete columns with confirmation dialog
  4. Visual feedback for all operations
  5. Loading indicators during API requests
- **Verification**:
  - All column operations work correctly
  - Column changes persist after page refresh
  - Error handling is implemented for all operations
  - User feedback is provided through snackbar messages

### Column Drag-and-Drop Implementation (Priority: Medium)
- **What**: Implement drag-and-drop functionality for columns
- **Why**: Provide intuitive UX for organizing prep board layout
- **Status**: ✅ COMPLETED
- **Components Updated**:
  1. PrepBoard.tsx:
     - Added Droppable container for columns
     - Wrapped columns in Draggable components
     - Enhanced handleDragEnd to handle column reordering
     - Added handleReorderColumns method to sync with backend
  2. PrepColumn.tsx:
     - Added drag handle icon and improved styling
     - Enhanced cursor feedback during drag operations
     - Improved visual feedback with hover styles and transitions
- **Key Features**:
  1. Columns can be dragged horizontally to reorder
  2. Column order persists after page refresh
  3. Visual feedback during drag operations (shadow, cursor changes)
  4. Drag handle icons indicate draggability
  5. Consistent UI between task and column dragging
- **Verification**:
  - Column drag-and-drop works smoothly
  - Column order persists after reordering
  - Visual feedback is clear and intuitive
  - Both touch and mouse interactions are supported

### Task Drag-and-Drop Implementation (Priority: High)
- **What**: Implement task dragging functionality within and between columns
- **Why**: Enable users to easily reorder and reorganize their tasks
- **Status**: ✅ COMPLETED
- **Components Updated**:
  1. PrepCard.tsx:
     - Wrapped in Draggable component from react-beautiful-dnd
     - Added drag handle icon and visual feedback styles
     - Enhanced styling for better UX during dragging
  2. PrepColumn.tsx:
     - Updated to properly pass index prop to PrepCard
     - Enhanced Droppable area styling for clearer visual cues
  3. prepBoardStore.ts:
     - Improved moveTask method to handle batch updates
     - Added handling for tasks being reordered within same column
     - Optimized backend synchronization
  4. PrepBoard.tsx:
     - Enhanced handleDragEnd to clearly distinguish task vs column dragging
- **Key Features**:
  1. Drag tasks vertically within columns to prioritize
  2. Drag tasks horizontally between columns to change status
  3. Visual feedback during drag operations
  4. Optimistic UI updates for responsive feel
  5. Efficient backend synchronization
- **Verification**:
  - Tasks can be dragged and dropped within and between columns
  - Task order persists after page refresh
  - Multiple task movements are correctly synchronized
  - Edge cases (empty columns, many tasks) are handled properly
  