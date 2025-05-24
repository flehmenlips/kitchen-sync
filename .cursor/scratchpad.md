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
- [x] Implement task details panel with comments and recipe details
- [x] Implement recipe photo upload capability
- [x] Add photo display to recipe detail pages
- [x] Implement Menu Title/Description fields for recipes
- [ ] Implement Recipe URL Import feature
- [ ] Add user authentication improvements
- [ ] Implement backup and data export features

## Current Focus
We've successfully implemented the Menu Title/Description fields feature that allows recipes to have separate kitchen-focused and customer-facing content. This provides seamless integration between the CookBook and MenuBuilder modules.

### Next Strategic Steps - Planning Phase
Based on our project roadmap and current state, here are the recommended next strategic steps:

1. **Recipe Import Enhancement (Phase 1 - URL Import)**
   - Implement web scraping for popular recipe websites
   - Add URL validation and preview functionality
   - Create mapping between scraped data and our recipe model
   - This will significantly improve user onboarding and recipe creation

2. **Security & User Management Enhancements**
   - Implement proper role-based access control
   - Add team/organization support for restaurant use
   - Enhance authentication with features like password reset
   - Add audit logging for critical operations

3. **Data Management & Backup**
   - Implement automated backup system
   - Add recipe export/import functionality (JSON, CSV)
   - Create data migration tools for bulk operations
   - Add version history for recipes

4. **MenuBuilder Module Enhancements**
   - Add PDF export functionality
   - Implement menu templates and themes
   - Add pricing calculation tools
   - Support for multiple menu versions (lunch, dinner, seasonal)

5. **Performance & Scalability**
   - Implement caching for frequently accessed data
   - Add pagination for large recipe lists
   - Optimize image loading and storage
   - Consider implementing a CDN for assets

## TableFarm & ChefRail Implementation Plan

### Phase 1: TableFarm (Reservation & Order System) - Week 1-3

#### Database Schema Design
1. **Reservations Table**
   - id, customerName, customerPhone, customerEmail
   - partySize, reservationDate, reservationTime
   - status (confirmed, cancelled, completed, no-show)
   - notes, createdAt, updatedAt, userId
   
2. **Tables Table** (future enhancement)
   - id, tableNumber, capacity, status
   - section, notes
   
3. **Orders Table**
   - id, orderNumber, reservationId (optional)
   - tableId (future), customerName
   - status (new, in-progress, ready, completed, cancelled)
   - orderType (dine-in, takeout, delivery)
   - notes, createdAt, updatedAt, userId
   
4. **OrderItems Table**
   - id, orderId, menuItemId
   - quantity, price, modifiers (JSON)
   - status (pending, preparing, ready, served)
   - notes, createdAt, updatedAt

#### Backend Implementation Tasks
1. [x] Create Prisma schema for reservations and orders
2. [x] Implement reservation CRUD endpoints
3. [x] Implement order management endpoints
4. [ ] Create WebSocket service for real-time updates
5. [ ] Add order status workflow logic
6. [ ] Implement order-to-kitchen communication

#### Frontend Implementation Tasks
1. [ ] Create reservation calendar view
2. [ ] Build reservation form and list
3. [ ] Create order entry interface
4. [ ] Implement menu item selection from MenuBuilder data
5. [ ] Add order modification capabilities
6. [ ] Build order status tracking view

### Phase 2: ChefRail (Kitchen Display System) - Week 4-6

#### Backend Implementation Tasks
1. [ ] Create ticket management service
2. [ ] Implement WebSocket endpoints for real-time updates
3. [ ] Add timer functionality for tickets
4. [ ] Create station assignment logic (future)
5. [ ] Implement ticket status transitions
6. [ ] Add ticket history and analytics

#### Frontend Implementation Tasks
1. [ ] Create kitchen display dashboard
2. [ ] Implement real-time ticket cards
3. [ ] Add drag-and-drop for status updates
4. [ ] Build timer displays with alerts
5. [ ] Create ticket detail modal
6. [ ] Add sound notifications for new orders
7. [ ] Implement filter and sort options

### Integration Points
1. **MenuBuilder → TableFarm**
   - TableFarm reads active menus and items
   - Prices and descriptions pulled from MenuBuilder
   
2. **TableFarm → ChefRail**
   - Orders sent via WebSocket on creation
   - Status updates flow bidirectionally
   
3. **CookBook → ChefRail**
   - Recipe details available for reference
   - Prep instructions linked to tickets

### Technical Considerations
1. **Real-time Communication**
   - Use Socket.io for WebSocket implementation
   - Implement reconnection logic
   - Handle offline scenarios gracefully
   
2. **Performance**
   - Optimize for tablet/touch interfaces
   - Minimize re-renders for real-time updates
   - Implement efficient data caching
   
3. **User Experience**
   - Large, touch-friendly buttons for kitchen environment
   - High contrast, readable displays
   - Audio/visual alerts for urgent items

### MVP Features for Initial Release

#### TableFarm MVP
- Basic reservation CRUD
- Simple order creation
- Menu item selection
- Order status tracking
- Send orders to kitchen

#### ChefRail MVP
- Display incoming orders
- Update order status
- Basic timers
- Simple filtering
- Clear completed orders

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

10. **Column Color Customization** (2024-04-26)
    - Added color customization for columns to improve visual organization
    - Created a color picker with 12 predefined colors in the column form dialog
    - Added column color accents to both columns and task cards for better tracking
    - Implemented color badges/pills on task cards to maintain column context
    - Added quick color change option directly in the column menu

11. **Column Update API Fix** (2024-04-26)
    - Fixed issue with column color updates not being applied
    - Changed frontend API method from PATCH to PUT to match backend route configuration
    - Added comprehensive logging throughout the update flow
    - Improved error handling and debugging capabilities
    - Added debug middleware for API route tracing
    - Enhanced controller logging for better visibility into backend operations

12. **Production API Endpoint Fix** (2024-04-26)
    - Fixed critical issue with API endpoints in production environment
    - Updated API baseURL configuration to use absolute URL instead of relative path
    - Changed from `/api` to `https://kitchen-sync-api.onrender.com/api` in production
    - Tagged as v1.5.0 for the stable production build
    - Made stable-version the new main branch via hard reset
    - Created main-backup branch to preserve previous main state
    - Version 1.5.0 is now the official production version

13. **Recipe Photo Upload and Display Feature** (2024-04-30)
    - Added photo upload capability to recipe form
    - Created dedicated photo upload endpoint on the backend
    - Implemented file storage mechanism on the server
    - Added Multer middleware for handling multipart form data
    - Created proper photoUrl handling in the database
    - Fixed API URL construction for photo upload to work with the development proxy
    - Enhanced recipe detail view to prominently display recipe photos
    - Added fallback for recipes without photos
    - Fixed a bug where the wrong component file was being edited - photo display was added to the correct component
    - Tagged as v2.3.0 for this feature release

14. **Cloudinary Integration for Recipe Photos** (2024-05-07)
    - Integrated Cloudinary cloud service for recipe photo storage
    - Added photoPublicId field to Recipe model for proper photo management
    - Created database migration to add the photo_public_id column
    - Updated recipe controller to handle photo uploads to Cloudinary
    - Implemented automatic deletion of old photos when replaced
    - Enhanced error handling for photo uploads
    - Updated photo URL handling to use Cloudinary URLs
    - Fixed prisma import issue that broke the Recipes module
    - Added UUID dependency for file handling
    - Tagged as v2.5.0 for the Cloudinary integration release
    - Successfully deployed to production environment

15. **Recipe Thumbnail Implementation** (2024-05-09)
    - Added thumbnails to the recipe list view using Cloudinary image transformations
    - Implemented a utility function to generate optimized thumbnail URLs
    - Added fallback avatar with recipe icon for recipes without photos
    - Created responsive design with properly sized thumbnails
    - Improved user experience with visual cues for recipe recognition
    - Enhanced type safety with custom type definitions for recipe list items
    - Optimized image loading with Cloudinary's automatic quality settings
    - Improved recipe list visuals with a more engaging grid-like display
    - Added thumbnails to task details drawer in the prep board for recipe tasks
    - Used consistent styling between recipe list and prep board thumbnails

16. **Task Details Drawer Improvements** (2024-05-10)
    - Reorganized drawer sections to improve information hierarchy
    - Moved recipe details section directly under task description for better context
    - Fixed HTML rendering in recipe instructions
    - Added styles to properly format ordered and unordered lists in instructions
    - Improved spacing and margins for better readability
    - Enhanced the recipe details card layout
    - Added proper HTML sanitization with dangerouslySetInnerHTML
    - Improved visual consistency between drawer sections

17. **Menu Title/Description Fields Implementation** (2024-12-20)
    - Added optional menuTitle and menuDescription fields to Recipe model
    - Created database migration with manual SQL execution due to permission constraints
    - Updated backend controllers to handle new fields with backward compatibility
    - Added "Menu Display Options" section to recipe form with clear visual separation
    - Enhanced MenuBuilder to automatically use menu fields when available
    - Implemented intelligent fallback logic (menuTitle → name, menuDescription → description)
    - Added tooltips showing which fields will be used during menu import
    - Added visual indicator (sparkle emoji) when recipes have menu-specific fields
    - Maintained full backward compatibility for existing recipes without menu fields
    - Fixed persistence issue where menu fields were cleared on edit (missing from transformRecipeToFormData)

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
- Match frontend HTTP methods (GET, POST, PUT, PATCH, DELETE) with backend route configurations
- When a feature doesn't work as expected, add logging at each level (component, store, service, API) to trace the flow
- Consider using forced refreshes after certain operations to ensure UI consistency with backend state
- In production, use absolute URLs for API endpoints rather than relative paths to avoid routing issues
- When deploying a React app with Vite, the development proxy doesn't exist in production, so API routes need to be handled differently
- Create backup branches before doing major branch operations like hard resets
- If you have two different API configuration files, ensure they use consistent URL patterns for the same environment

## Executor's Feedback or Assistance Requests
- Recipe task addition to custom columns has been successfully implemented 
- Both PrepBoard.tsx and RecipeDetail.tsx now use dynamic column selection
- Column CRUD operations (create, read, update, delete) are now fully implemented
- Drag-and-drop reordering for columns has been implemented
- Drag-and-drop functionality for tasks within and between columns is now working
- The vertical drag-and-drop bug has been fixed and verified
- The application has been tagged as v1.3.0 for the fully functioning kanban board
- Critical production API endpoint issues have been fixed and verified in production
- Updated version to v1.5.0 for the stable production build
- Successfully made stable-version the new main branch for future development
- Future enhancement: Consider adding batch operations for adding multiple recipes at once
- Menu Title/Description fields feature has been successfully implemented with full backward compatibility
- The feature provides seamless integration between CookBook and MenuBuilder modules
- Manual testing is recommended to verify the UI flow and data persistence

## Key Challenges and Analysis
- Maintaining data integrity while allowing custom columns
- Ensuring smooth transition from hardcoded to dynamic column system
- Coordinating database maintenance without disrupting service
- Managing consistent API endpoint configurations between frontend and backend
- Ensuring type consistency between frontend TypeScript interfaces and backend database schema
- Implementing proper drag-and-drop behavior with visual feedback
- Handling complex task reordering operations across multiple columns
- Diagnosing and fixing state management issues during same-column drag operations
- Resolving production API endpoint issues where relative paths were failing in the production environment

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
  
## Recipe Engine (CookBook) Improvement Plan

### Current State Analysis

The Recipe Engine currently has these key components:

1. **Backend Infrastructure**:
   - Recipe CRUD operations via REST API
   - Recipe text parsing service using a rule-based approach
   - Data model with recipes, ingredients, units, and categories

2. **Frontend Components**:
   - Recipe list and detail views
   - Recipe form for creating/editing recipes
   - Recipe import page with text parsing
   - Ingredient, unit, and category management

3. **Recipe Import Features**:
   - Text-based recipe parsing
   - Ingredient identification and structuring
   - Unit conversion and normalization
   - Manual editing of parsed recipes
   - Example format provided for guidance

### Improvement Areas

#### 1. Enhanced Recipe Import Functionality

**Current Limitations:**
- Text-only import method
- Rule-based parsing that may miss complex formatting
- Limited ability to handle different recipe formats
- No bulk import capabilities
- No support for importing from websites or images

**Proposed Improvements:**

1. **Multi-Source Import Support**:
   - URL import - allow users to paste website URLs to scrape recipes
   - Image import - OCR for recipe images or photos
   - File import - support for common formats (PDF, DOC, TXT)
   - Clipboard import - enhanced parsing for clipboard data

2. **Advanced AI Parsing**:
   - Upgrade parsing algorithm to handle more complex recipe formats
   - Better detection of preparation methods and cooking techniques
   - Improved ingredient parsing with quantity fractions
   - Enhanced unit conversion and normalization

3. **Bulk Import Features**:
   - Add capability to import multiple recipes in one operation
   - Batch processing with queue system for large imports
   - Progress tracking for bulk operations

4. **Import Data Mapping**:
   - Intelligent mapping of imported ingredients to existing database entries
   - Suggestion system for matching similar ingredients
   - Duplicate detection and handling

#### 2. Recipe Organization & Management

**Current Limitations:**
- Basic categorization system
- Limited search capabilities
- No tagging hierarchy

**Proposed Improvements:**

1. **Enhanced Organization System**:
   - Tag-based recipe organization with hierarchical tags
   - Custom collections/folders for recipe grouping
   - Favorites and recently used recipes tracking
   - "Meal type" and "cuisine type" classification

2. **Advanced Search and Filtering**:
   - Full-text search across recipe content
   - Filtering by ingredient, cook time, prep time, etc.
   - Save and retrieve custom searches
   - Smart search that understands cooking concepts

#### 3. Recipe Scaling & Unit Conversion

**Current Limitations:**
- Basic scaling functionality
- Fixed unit conversions

**Proposed Improvements:**

1. **Smart Recipe Scaling**:
   - Automatic conversion between metric/imperial measurements
   - Context-aware scaling (e.g., adjusting baking times for scaled recipes)
   - Yield-based scaling (e.g., scale recipe to make specific servings)

2. **Advanced Unit Handling**:
   - Support for more complex unit conversions
   - Handling of density-based conversions (volume to weight)
   - Configurable preferred units for users

#### 4. User Experience Enhancements

**Current Limitations:**
- Limited feedback during recipe operations
- Form-based input system
- Minimal recipe visualization

**Proposed Improvements:**

1. **Interactive Recipe Builder**:
   - Drag-and-drop interface for recipe creation
   - Real-time preview of recipe during editing
   - Improved rich text editing for instructions

2. **Enhanced Recipe Presentation**:
   - Step-by-step instruction mode with progress tracking
   - Print-friendly recipe layouts
   - Mobile-optimized recipe viewing
   - Cook mode with timer integration

3. **User Feedback System**:
   - Better progress indicators for long operations
   - Clear success/error messaging
   - Tutorial/onboarding for first-time users

### Implementation Plan

#### Phase 1: Recipe Import Enhancement (4-6 weeks)

1. **Week 1-2: URL Import & Web Scraping**
   - Implement URL parsing for popular recipe websites
   - Create website recipe extractors for common formats
   - Add recipe schema detection (schema.org/Recipe)
   - Build frontend for URL import

2. **Week 3-4: Advanced Text Parsing**
   - Enhance the existing parser to handle more formats
   - Improve ingredient quantity detection
   - Add support for fractions and mixed numbers
   - Add special character handling for recipe text
   - Enhance unit mapping and conversion

3. **Week 5-6: Image & File Import**
   - Integrate OCR service for recipe images
   - Implement PDF parsing for recipe documents
   - Build drag-and-drop file upload interface
   - Add preview and validation for imported content

#### Phase 2: Recipe Organization & Search (3-4 weeks)

1. **Week 1-2: Tag System**
   - Implement hierarchical tag data model
   - Create tag management UI
   - Build tag-based filtering system
   - Add tag suggestions based on recipe content

2. **Week 3-4: Advanced Search**
   - Implement full-text search capabilities
   - Create advanced filter UI with multiple criteria
   - Add saved searches functionality
   - Integrate search with recipe list view

#### Phase 3: User Experience Improvements (3-4 weeks)

1. **Week 1-2: Interactive Recipe Builder**
   - Redesign recipe form with drag-and-drop interface
   - Add real-time preview of recipe
   - Improve instruction editor with step-based editing

2. **Week 3-4: Enhanced Recipe Presentation**
   - Create cook mode view for recipes
   - Add step-by-step instruction navigation
   - Implement print-friendly formatting
   - Add sharing options

### Technical Requirements

1. **API Enhancements**:
   - New endpoints for URL parsing and scraping
   - File upload and OCR processing endpoints
   - Extended recipe search endpoint with filtering
   - Bulk operation endpoints for import/export

2. **Frontend Components**:
   - URL import form with preview
   - File upload dropzone with preview
   - Enhanced recipe parser UI with editing tools
   - Batch import progress tracking
   - Tag management interface

3. **External Services**:
   - OCR service for image processing (Tesseract.js or cloud API)
   - Web scraping library (Cheerio or similar)
   - PDF parsing library (pdf.js or similar)

4. **Data Model Updates**:
   - Enhanced tag system with hierarchies
   - Import source tracking
   - User preferences for units and scaling

### Testing Plan

1. **Unit Tests**:
   - Parser functionality for different formats
   - Unit conversion accuracy
   - Import validation logic

2. **Integration Tests**:
   - End-to-end import workflow
   - Search and filter operations
   - Recipe scaling accuracy

3. **User Testing**:
   - Import from various sources
   - Organization and finding recipes
   - Recipe editing and scaling

### Success Metrics

1. **User Engagement**:
   - Increased recipe creation rate
   - Reduction in manual recipe entry time
   - Higher usage of import features

2. **Technical Performance**:
   - Import success rate > 95%
   - Search response time < 500ms
   - Successful parsing of complex recipes

3. **User Satisfaction**:
   - Positive feedback on import functionality
   - Reduction in support requests for recipe management
   - Increased recipe sharing

## Current Focus: Recipe Import Enhancement - Phase 1

Based on our improvement plan, we're starting with Phase 1: Recipe Import Enhancement, specifically focusing on URL import and web scraping capabilities.

### High-level Task Breakdown

#### 1. URL Import & Web Scraping Implementation (Week 1-2)

1. **Research and Library Selection**
   - Research web scraping libraries for Node.js
   - Evaluate recipe schema parsing options
   - Select appropriate libraries for implementation
   - Success criteria: Selected libraries with documentation and examples ready for implementation

2. **Backend API Development**
   - Create new endpoint for URL submission
   - Implement web scraping service with error handling
   - Add support for common recipe websites (AllRecipes, Food Network, etc.)
   - Implement schema.org/Recipe detection
   - Success criteria: API endpoint accepts URLs and returns structured recipe data

3. **Frontend URL Import Interface**
   - Design URL import component with validation
   - Implement preview functionality for scraped recipes
   - Add error handling and loading states
   - Success criteria: Users can paste URLs, preview results, and save to database

4. **Recipe Schema Mapping**
   - Develop mapping between scraped data and Kitchen Sync recipe model
   - Handle variations in recipe formats across websites
   - Implement fallback parsing for non-standard formats
   - Success criteria: Consistent recipe structure regardless of source website

5. **Testing and Refinement**
   - Test with various recipe websites
   - Implement automated tests for scraping service
   - Add logging for failed scraping attempts
   - Success criteria: >90% success rate for top 10 recipe websites

### Technical Requirements

1. **Backend Components**:
   - Web scraping service (using Cheerio or similar)
   - URL validation and sanitization
   - Recipe schema detection (schema.org/Recipe)
   - Rate limiting to prevent abuse

2. **Frontend Components**:
   - URL input form with validation
   - Recipe preview component
   - Import progress indicator
   - Error handling with helpful messages

3. **Data Models**:
   - Update Recipe model to track import source
   - Add import metadata fields (source URL, import date)

### Project Status Board

- [ ] Research and select web scraping libraries
- [ ] Design URL import API endpoint
- [ ] Implement backend scraping service
- [ ] Create frontend URL import interface
- [ ] Add recipe preview functionality
- [ ] Implement schema mapping logic
- [ ] Test with popular recipe websites
- [ ] Add proper error handling and validation
- [ ] Document usage and limitations
- [ ] Deploy and monitor initial version

### Next Steps After URL Import

After implementing URL import functionality, we'll proceed with:

1. **Advanced Text Parsing** (Week 3-4)
   - Enhance existing text parser
   - Improve ingredient quantity detection
   - Add support for fractions and mixed numbers

2. **Image & File Import** (Week 5-6)
   - Integrate OCR for recipe images
   - Add PDF parsing capabilities
   - Implement file upload interface

## Research: Recipe Web Scraping Libraries

Based on research into available libraries for recipe web scraping, here are the recommended options for implementing URL import functionality:

### 1. Recipe Schema Extraction Libraries

#### Cheerio + JSON-LD Schema Processing
**Recommendation:** Build a custom solution using Cheerio for HTML parsing and direct JSON-LD extraction.

**Benefits:**
- Cheerio is a lightweight, fast jQuery-like library for server-side HTML parsing
- JSON-LD is the most common and reliable recipe schema format on modern recipe sites
- Direct control over scraping logic and error handling
- No external dependencies on potentially unmaintained libraries

**Example Implementation:**
```javascript
import cheerio from 'cheerio';
import axios from 'axios';

async function scrapeRecipeFromUrl(url) {
  try {
    // Fetch the HTML content from the URL
    const response = await axios.get(url);
    const html = response.data;
    
    // Load HTML into Cheerio
    const $ = cheerio.load(html);
    
    // Extract JSON-LD data
    const jsonLdScript = $('script[type="application/ld+json"]').html();
    
    if (jsonLdScript) {
      const jsonLdData = JSON.parse(jsonLdScript);
      
      // Handle different JSON-LD structures
      const recipeData = Array.isArray(jsonLdData) 
        ? jsonLdData.find(item => item['@type'] === 'Recipe')
        : jsonLdData['@type'] === 'Recipe' 
          ? jsonLdData 
          : jsonLdData['@graph']?.find(item => item['@type'] === 'Recipe');
      
      if (recipeData) {
        return {
          name: recipeData.name,
          description: recipeData.description,
          ingredients: recipeData.recipeIngredient,
          instructions: processInstructions(recipeData.recipeInstructions),
          cookTime: recipeData.cookTime,
          prepTime: recipeData.prepTime,
          totalTime: recipeData.totalTime,
          yield: recipeData.recipeYield,
          image: recipeData.image,
          url: url,
          sourceWebsite: new URL(url).hostname
        };
      }
    }
    
    // Fallback to other extraction methods if needed
    // ...
    
    throw new Error('No recipe data found on page');
  } catch (error) {
    console.error('Recipe scraping error:', error);
    throw new Error('Failed to scrape recipe: ' + error.message);
  }
}

// Helper to process recipe instructions which may be in different formats
function processInstructions(instructions) {
  if (!instructions) return [];
  
  if (typeof instructions === 'string') return [instructions];
  
  if (Array.isArray(instructions)) {
    return instructions.map(instruction => {
      if (typeof instruction === 'string') return instruction;
      if (instruction['@type'] === 'HowToStep') return instruction.text;
      return instruction.text || instruction.name || '';
    }).filter(Boolean);
  }
  
  return [];
}
```

### 2. Existing Recipe Scraper Libraries

#### Option A: recipe-data-scraper
**Description:** Node.js library specifically designed for recipe extraction from websites

**Benefits:**
- Focused solely on recipe data extraction
- Supports microdata and JSON-LD formats
- Active development and 15 GitHub stars
- Clean API with Promise-based usage

**Limitations:**
- Limited website coverage compared to custom solutions
- Possible maintenance concerns for long-term usage

**Example Usage:**
```javascript
import recipeDataScraper from 'recipe-data-scraper';

async function getRecipeFromUrl(url) {
  try {
    const recipe = await recipeDataScraper(url);
    return recipe;
  } catch (error) {
    console.error('Recipe scraping error:', error);
    throw new Error('Could not find recipe data');
  }
}
```

#### Option B: web-auto-extractor
**Description:** Generic semantic data extractor supporting Schema.org vocabularies

**Benefits:**
- Supports multiple formats (Microdata, RDFa-lite, JSON-LD)
- More general-purpose but can be adapted for recipes
- Mature library with good usage documentation

**Limitations:**
- Not recipe-specific, would require additional parsing logic
- Last published 8 years ago (potential maintenance issues)

### 3. Implementation Approach

#### Recommended Implementation Strategy:

1. **Primary Parser:** Build a custom solution using Cheerio and axios for the most reliable extraction:
   - Focus on JSON-LD extraction first (most common format)
   - Add fallback support for Microdata and RDFa
   - Implement schema.org/Recipe detection

2. **Fallback Option:** Integrate recipe-data-scraper as a fallback:
   - Try custom parser first
   - If it fails, attempt with recipe-data-scraper
   - Provide clear error messages for unsupported sites

3. **Data Mapping Layer:**
   - Create a standardized mapping function to convert extracted data to Kitchen Sync's recipe format
   - Normalize units, times, and measurements during conversion
   - Handle edge cases like missing fields

4. **Error Handling and Validation:**
   - Validate scraped data before saving
   - Provide user feedback for partially extracted recipes
   - Allow manual editing of imported recipes

#### Technical Architecture:

```
Backend:
- RecipeScraperService
  |- extractRecipeFromUrl(url) - Main entry point
  |- scrapers/
     |- jsonLdScraper.js - Primary JSON-LD extractor
     |- microdataScraper.js - Fallback microdata extractor
     |- rdfaScraper.js - Fallback RDFa extractor
     |- externalScraperAdapter.js - Adapter for recipe-data-scraper
  |- utils/
     |- schemaNormalizer.js - Converts schema data to Kitchen Sync format
     |- timeParser.js - Handles ISO 8601 duration format conversion
     |- urlValidator.js - Validates and sanitizes input URLs

Frontend:
- ImportRecipeDialog
  |- URL input field with validation
  |- Import progress indicator
  |- Preview of extracted recipe data
  |- Edit capability for corrections
  |- Error handling UI
```

### 4. Testing Strategy

1. Create a test suite with sample HTML from popular recipe websites
2. Include edge cases (missing fields, malformed data)
3. Compare extraction results against expected outputs
4. Implement periodic checks against top recipe websites to ensure continued functionality

### 5. Future Enhancements

1. **Recipe Site Profiles:**
   - Create site-specific extractors for popular recipe websites
   - Handle custom formats not using standard schemas

2. **Machine Learning Enhancement:**
   - Train a model to extract recipe data from non-structured content
   - Improve extraction accuracy for edge cases

3. **Bulk Import:**
   - Support importing multiple recipes from collection pages

## Menu Builder Module Implementation

### Background and Motivation
The Menu Builder module enables restaurant owners to create, edit, and print professional-looking menus using their existing recipes. This reduces the need to recreate menu items and sections every time the menu is modified.

### Key Features Implemented
1. **Database Schema**: Added models for Menu, MenuSection, and MenuItem with appropriate relations to existing Recipe model
2. **Backend API**: Created RESTful endpoints for CRUD operations on menus, sections, and items
3. **Frontend Components**: Developed UI for viewing, creating, editing, and deleting menus
4. **Printing Support**: Designed the module with printing functionality in mind

### Progress Status
- [x] Database schema design and migration SQL creation
- [x] Backend API controllers and routes
- [x] Frontend API service methods
- [x] Frontend menu listing page
- [x] Menu creation/edit form
- [x] Menu sections and items editor component
- [x] Menu detail/preview page with print functionality
- [ ] Recipe selection for menu items (to be implemented)
- [ ] Style customization in the menu editor (to be implemented)
- [ ] Menu PDF export (to be implemented)

### Current Status / Progress Tracking
We've implemented the core functionality of the Menu Builder module. Users can now:
1. View a list of their menus
2. Create new menus with basic information
3. Edit existing menus
4. Add, edit, and delete menu sections
5. Add, edit, and delete menu items within sections
6. Preview menus with formatting based on their settings
7. Print menus directly from the browser

The UI follows a consistent design with the rest of the application and provides a smooth user experience with proper loading states, error handling, and navigation.

Next steps include:
1. Enhancing the menu editor with style customization options
2. Adding a recipe picker to select from existing recipes when creating menu items
3. Implementing PDF export functionality for sharing and offline use
4. Adding logo upload capabilities
5. Improving the print layout with more customization options

### Lessons
- Used FormData for logo uploads to handle file data
- Implemented soft deletion through archiving to preserve menu history
- Created relationships between recipes and menu items to reuse recipe data
- Designed the interface with a tab-based form for better organization of complex data
- Used accordions for an intuitive section/item management interface
- Implemented custom print functionality using window.open() and styled HTML

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

## Long-Term Roadmap (Based on Project Vision)
