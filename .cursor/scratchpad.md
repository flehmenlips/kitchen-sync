# KitchenSync Development Scratchpad

## Project Overview
KitchenSync is a comprehensive restaurant management platform that integrates recipe management, kitchen prep workflows, menu creation, reservations, and order management into a single system.

## Current Version: 2.10.0

## Module Status

### ✅ Completed Modules

#### 1. CookBook (Recipe Management)
- Full CRUD operations for recipes
- Ingredient and unit management
- Recipe categorization
- Photo upload with Cloudinary
- Recipe scaling calculations
- Sub-recipe support

#### 2. AgileChef (Prep Management)
- Kanban-style prep board
- Drag-and-drop task management
- Custom columns
- Recipe integration

#### 3. MenuBuilder
- Multiple menu support
- Drag-and-drop item ordering
- Recipe integration
- Rich text formatting
- PDF export
- Theme customization

#### 4. TableFarm (Front-of-House) - COMPLETED v2.10.0
- ✅ Reservation calendar system
- ✅ Customer information management
- ✅ Order entry and management
- ✅ Integration with MenuBuilder
- ✅ Customer portal with reservations

#### 5. Content Management System - NEW v2.10.0
- ✅ Dynamic content blocks
- ✅ Multiple block types (Text, HTML, Image, CTA, Hero, etc.)
- ✅ Drag-and-drop reordering
- ✅ Page-specific content
- ✅ Cloudinary image management

#### 6. Restaurant Settings & Branding - NEW v2.10.0
- ✅ Complete website customization
- ✅ Theme colors and fonts
- ✅ Logo and image management
- ✅ SEO settings
- ✅ Social media links
- ✅ Opening hours

### 🚧 In Progress

#### ChefRail (Kitchen Display)
- Status: Planned
- Real-time order display
- Kitchen communication system
- Order status tracking

## Recent Achievements (v2.10.0)

### Customer Portal Implementation
1. **Architecture Design**
   - Three-portal system: Customer, Restaurant, Admin
   - Role-based access control
   - Single-restaurant MVP focus

2. **Backend Implementation**
   - RestaurantSettings model and API
   - ContentBlock system with full CRUD
   - Cloudinary integration for images
   - Public/private API endpoints

3. **Frontend Implementation**
   - Customer portal with custom layout
   - Dynamic theme based on restaurant settings
   - Content block renderer for flexible layouts
   - Restaurant settings management UI
   - Content blocks management with drag-and-drop

4. **Key Features Added**
   - Website branding (name, tagline, logo)
   - Theme customization (colors, fonts)
   - Dynamic content management
   - Image uploads with Cloudinary
   - SEO optimization settings
   - Social media integration

## Technical Decisions

### Database
- PostgreSQL with Prisma ORM
- Single-tenant architecture (MVP)
- Restaurant ID = 1 for all operations

### Authentication
- JWT-based auth
- Role hierarchy: SuperAdmin > Admin > Manager > Staff > Customer
- Customer flag for public users

### Image Management
- Cloudinary for all uploads
- Automatic optimization
- Public ID tracking for updates/deletes

### Frontend Architecture
- Separate layouts for admin/customer
- Theme provider for dynamic styling
- Component-based content rendering

## Known Issues & Limitations

1. Single restaurant support only (multi-tenant deferred)
2. Basic reservation system (no table management yet)
3. No payment processing
4. No email notifications
5. No real-time updates (WebSocket support planned)

## Next Steps

### Immediate Priorities
1. ChefRail implementation
2. WebSocket for real-time updates
3. Email notification system
4. Enhanced reservation features
5. Customer authentication flow

### Future Enhancements
1. Multi-restaurant support
2. Payment processing
3. Advanced analytics
4. Mobile apps
5. API documentation

## Environment Variables Required

### Backend
```
DATABASE_URL=
JWT_SECRET=
SESSION_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend
```
VITE_API_URL=http://localhost:3001/api
```

## Deployment Notes
- Auto-deploy enabled on Render
- Main branch triggers deployment
- Database hosted on Render PostgreSQL
- Static frontend on Render Static Site

## Version History
- v2.10.0: Content Management, Restaurant Settings, Customer Portal
- v2.9.0: TableFarm initial implementation
- v2.8.0: MenuBuilder enhancements
- v2.7.0: AgileChef improvements
- Previous versions: Core module development

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
Implementing customer menu view and restaurant settings management system.

## MVP Strategy - Single Restaurant Focus
As per updated strategy (2024-12-20), KitchenSync will initially launch as a single-restaurant system:
- **Simplified Architecture**: No multi-tenant complexity in MVP
- **Faster Development**: Focus on core functionality for one restaurant
- **Restaurant**: Seabreeze Kitchen (george@seabreeze.farm)
- **Future**: Multi-restaurant support will be added after MVP validation

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
- [x] Create TableFarm backend (reservations and orders)
- [x] Design multi-tenant architecture documentation
- [x] Create TableFarm frontend calendar view
- [x] Create customer portal layout and routing
- [x] Implement customer home page
- [x] Implement customer reservation form
- [x] Create customer menu view page
- [x] Create order entry interface for staff
- [x] Order management system with list and entry dialog

### Enhanced Reservation System Tasks

#### Phase 1: Customer Account System
- [x] Create customer profile database schema
- [x] Implement customer registration API
- [x] Build customer registration UI
- [x] Add email verification flow
- [x] Build customer dashboard
- [ ] Implement guest checkout option
- [ ] Create password reset functionality

#### Phase 1.5: Customer Reservation Management (NEW - IN PROGRESS)
- [x] Create customer reservation API endpoints
- [x] Implement reservation creation for customers
- [x] Connect reservation form to backend API
- [x] Update dashboard to show customer's reservations
- [x] Implement reservation cancellation
- [ ] Add reservation modification functionality
- [ ] Create customer reservation list page
- [ ] Add email confirmation for reservations

#### Phase 2: Table Management
- [ ] Design table configuration schema
- [ ] Create table management API endpoints
- [ ] Build table configuration UI
- [ ] Implement floor plan editor
- [ ] Create table assignment logic
- [ ] Add table combination rules
- [ ] Build table availability calculations

#### Phase 3: Operational Settings
- [ ] Create operating hours schema
- [ ] Build hours configuration API
- [ ] Design reservation rules engine
- [ ] Implement pacing & duration settings
- [ ] Create blackout date management
- [ ] Build settings management UI
- [ ] Add service period definitions

#### Phase 4: Admin Features
- [ ] Build reservation management dashboard
- [ ] Create manual reservation entry
- [ ] Implement guest management system
- [ ] Add communication tools
- [ ] Build floor plan view
- [ ] Create waitlist management
- [ ] Add reservation reporting

#### Phase 5: Integration
- [ ] Update customer portal with new features
- [ ] Integrate staff portal components
- [ ] Add role-based permissions
- [ ] Create help documentation
- [ ] Implement analytics dashboard
- [ ] Performance optimization
- [ ] User acceptance testing

### Other Pending Tasks
- [ ] Apply restaurant settings database migration
- [ ] Create restaurant settings admin interface
- [ ] Update customer portal to use dynamic restaurant settings
- [ ] Add WebSocket support for real-time updates
- [ ] Implement ChefRail module
- [ ] Implement Recipe URL Import feature
- [ ] Add user authentication improvements
- [ ] Implement backup and data export features

## Current Focus: TableFarm Enhancement Sprint

### TableFarm Enhancement Plan (Started: 2024-12-24)

#### Phase 1: Order Entry Interface (Staff-facing)
1. **Create Order List View**
   - Display all orders with status filters
   - Search by order number or customer
   - Quick status updates

2. **Order Entry Form**
   - Customer selection/creation
   - Menu item selection from active menus
   - Quantity and modifiers
   - Special instructions
   - Table assignment (optional)

3. **Order Management**
   - Edit existing orders
   - Update order status
   - Calculate totals
   - Print order receipts

#### Phase 2: Customer Authentication & Accounts
1. **Registration Flow**
   - Email/password registration
   - Profile creation (name, phone)
   - Email verification (optional for MVP)

2. **Login System**
   - JWT-based authentication for customers
   - Separate from staff login
   - Remember me functionality

3. **Customer Dashboard**
   - View upcoming reservations
   - View past orders
   - Update profile information
   - Cancel reservations

#### Phase 3: Enhanced Reservation Management
1. **Customer Reservation List**
   - View all reservations (upcoming/past)
   - Cancel upcoming reservations
   - Modify reservation details

2. **Staff Reservation Management**
   - Complete reservation list with filters
   - Table assignment
   - Convert reservation to order
   - Guest notes and preferences

3. **Reservation-Order Integration**
   - Link orders to reservations
   - Pre-order functionality
   - Guest history tracking

### Implementation Progress
- [x] Create Order model enhancements
- [x] Build order service API endpoints  
- [x] Create OrderListPage component
- [x] Implement OrderEntryDialog
- [x] Add menu item selection interface
- [ ] Create customer registration flow
- [ ] Implement customer login
- [ ] Build customer dashboard
- [ ] Create reservation list views
- [ ] Add reservation management features

### Completed Features (2024-12-24)

#### Order Management System
1. **OrderListPage**:
   - Comprehensive order list with real-time status updates
   - Advanced filtering by date, status, and order type
   - Search functionality
   - Quick status updates via dropdown
   - Action buttons for view, edit, print, and delete

2. **OrderEntryDialog**:
   - Customer name entry
   - Order type selection (Dine In, Takeout, Delivery)
   - Menu-based item selection
   - Quantity management
   - Special instructions per item
   - Order total calculation
   - Integration with existing menus

3. **Order Service**:
   - Full CRUD operations
   - Status management
   - Order item status tracking
   - Helper functions for formatting and colors

4. **Integration**:
   - Added to TableFarm module as "Orders" tab
   - Works with existing menu data
   - Ready for reservation integration

## Current Focus
Creating restaurant settings management system for admin control over customer-facing content.

### Restaurant Settings Implementation Progress

#### Completed ✅
1. **Customer Menu View**
   - Created public menu service
   - Implemented customer menu page with tabs for multiple menus
   - Integrated with existing MenuBuilder data
   - Added proper styling with menu customization support
   - Added route to customer portal

2. **Restaurant Settings Model**
   - Designed comprehensive RestaurantSettings table
   - Includes hero section, about, contact, hours, social media
   - Menu display settings and SEO fields
   - Created SQL migration file

3. **Backend Controller**
   - Created restaurant settings controller
   - Endpoints for admin (get/update settings)
   - Public endpoint for customer portal
   - Image upload handling prepared

#### In Progress 🚧
1. **Database Migration**
   - Need to run Prisma migration to add RestaurantSettings table
   - Generate Prisma client to include new model

2. **Admin Interface**
   - Create comprehensive settings page for restaurant owner
   - Form sections for all content areas
   - Image upload functionality
   - Menu selection for customer display

3. **Customer Portal Updates**
   - Update home page to use dynamic settings
   - Update layout to use dynamic restaurant info
   - Dynamic footer with restaurant details

### Key Architecture Decisions

#### Restaurant Settings Structure
- **Hero Section**: Title, subtitle, image, CTA button
- **About Section**: Title, description, image
- **Contact Info**: All restaurant contact details
- **Opening Hours**: JSON structure for flexible hours
- **Social Media**: Links to social platforms
- **Menu Settings**: Control which menus appear and how
- **SEO**: Meta tags for search engines

#### Admin Control Features
1. **Content Management**:
   - Edit all text content
   - Upload images for hero/about sections
   - Manage opening hours

2. **Menu Control**:
   - Select which menus to display
   - Choose display mode (tabs, accordion, single)

3. **Branding**:
   - Restaurant name and description
   - Social media links
   - Footer customization

### Next Implementation Steps
1. **Run Database Migration**
   ```bash
   cd backend
   npx prisma migrate dev --name add_restaurant_settings
   npx prisma generate
   ```

2. **Create Admin Routes**
   - Add routes for restaurant settings endpoints
   - Secure with authentication middleware

3. **Build Admin Settings Page**
   - Multi-section form interface
   - Real-time preview option
   - Save/reset functionality

4. **Update Customer Portal**
   - Fetch settings from public endpoint
   - Replace hardcoded content with dynamic data

## Recent Decisions and Changes
1. **Customer Menu View** (2024-12-20)
   - Created customer-friendly menu display
   - Uses existing MenuBuilder data and styling
   - Supports multiple menus with tab navigation
   - Filters to show only active, non-archived content

2. **Restaurant Settings Architecture** (2024-12-20)
   - Comprehensive settings model for all customer-facing content
   - Single source of truth for restaurant information
   - Admin interface planned for easy management
   - Public API endpoint for customer portal access

## Lessons
- Always check for hardcoded constants when implementing dynamic features
- Keep maintenance scripts separate from application code
- Document stashed changes and branch purposes for future reference
- Maintain consistent API endpoint paths across service methods
- Ensure proxy configuration in Vite points to the correct backend server port
- Include info useful for debugging in the program output
- Be aware of how path prefixes are applied in the API service configuration - avoid double prefixing
- Ensure type consistency between frontend and backend, especially for IDs and foreign keys
- When implementing complex systems, document the architecture and user roles first
- Separate customer-facing and internal-facing interfaces from the start
- Plan for multi-tenancy early in the project to avoid major refactoring later
- Start with single-tenant MVP to validate concept before adding complexity
- Use clear restaurant branding in customer-facing interfaces
- Implement multi-step forms for better UX in reservation flow
- Create comprehensive settings models to avoid hardcoding throughout the app
- Always regenerate Prisma client after schema changes
- Always use `npm run dev:local` in the backend - This uses `.env.local` which points to the local database. Never use `npm run dev` as it uses `.env` which connects to the production database!
- CORS Configuration - When using authentication with JWT tokens, always ensure:
  - Backend has `credentials: true` in CORS config
  - Frontend has `withCredentials: true` in axios config
- Read the file before you try to edit it.
- If there are vulnerabilities that appear in the terminal, run npm audit before proceeding
- Always ask before using the -force git command
- **Separate Customer and Staff Authentication** - Always use separate axios instances and auth storage for customer vs staff to avoid:
  - Shared authorization headers causing cross-authentication
  - Wrong redirects (customers going to staff login)
  - Mixed authentication states
- **Customer Auth Context Issues** - When using customer authentication:
  - Initialize auth state from storage in useState to avoid losing auth on route changes
  - Use the context's login method instead of calling the service directly in components
  - Ensure the CustomerAuthProvider persists across route changes (wrap parent layout, not individual routes)
  - Add small delays after login to ensure state updates before navigation
- **Database Safety - CRITICAL**: 
  - NEVER use `dotenv -e .env.local -- command` syntax as it may fail and load production `.env` instead
  - ALWAYS use npm scripts that explicitly load `.env.local` (e.g., `npm run prisma:studio`, `npm run dev:local`)
  - ALWAYS verify database connection before any operations using `npm run db:check`
  - Production database URLs contain `render.com`, `amazonaws.com`, etc. - local URLs contain `localhost`
  - If you see production data when expecting test data, STOP immediately
  - Use `pkill -f prisma` as emergency kill switch
  - Create visual distinctions (terminal colors, prompts) between prod and dev environments

## Executor's Feedback or Assistance Requests

### Port Configuration Issues Investigation (2024-12-28)

**Issue**: Customer account creation is experiencing issues related to port confusion between 5173 and 5174.

**Findings**:
1. **Frontend Port Configuration**:
   - Vite config does not specify a port (defaults to 5173)
   - Package.json dev script runs `vite` without port specification
   - Frontend can run on different ports depending on availability

2. **Backend Configuration**:
   - CORS is configured with: `process.env.FRONTEND_URL || 'http://localhost:5173'`
   - Email verification URL uses: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
   - This means `FRONTEND_URL` environment variable must be set correctly

3. **Current Issues**:
   - No .env files found in workspace (may be gitignored)
   - FRONTEND_URL must match the actual port where frontend is running
   - If frontend starts on 5174 (when 5173 is busy), but FRONTEND_URL points to 5173, verification links will fail

**Database Query Results**:
- Unable to view customer accounts directly via CLI
- Prisma Studio launched in background for manual inspection

**Recommendations**:
1. **Immediate Fix**:
   - Check which port frontend is actually running on
   - Update FRONTEND_URL environment variable to match
   - Consider forcing Vite to use specific port

2. **Long-term Solution**:
   - Add port configuration to vite.config.ts
   - Document required environment variables
   - Add validation for environment configuration

**Next Steps**:
1. Determine actual frontend port
2. Update environment configuration
3. Test account creation again
4. Query database to verify accounts

## Key Challenges and Analysis
### Restaurant Settings Management (Priority: High)
- **What**: Admin interface for all customer-facing content
- **Why**: Eliminate hardcoded values and give owner full control
- **Status**: Backend ready, need migration and frontend
- **Challenges**:
  1. Complex form with many sections
  2. Image upload handling
  3. Real-time preview of changes
  4. Validation of opening hours format
  5. Menu selection interface
  
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

## Current Focus: Production-Ready Reservation System

As the restaurant owner and superadmin, the immediate priorities are:

### Immediate Tasks for Live Reservations

#### 1. Email Service Implementation (Priority: CRITICAL)
- [x] Choose email provider (SendGrid recommended)
- [x] Install SendGrid package
- [x] Implement real email sending service
- [x] Update controllers to send emails
- [ ] Set up SendGrid account and API keys
- [ ] Test verification emails
- [ ] Test reservation confirmation emails

#### 2. Complete Customer Dashboard (Priority: HIGH)
- [x] Basic dashboard UI created
- [x] Create customer reservation service
- [x] Create backend routes for customer reservations
- [ ] Connect reservation data to dashboard
- [ ] Add ability to view/cancel reservations
- [ ] Add profile update functionality

#### 3. Admin Reservation Management (Priority: CRITICAL)
- [x] Create admin reservation list view
- [x] Add ability to manually create reservations
- [x] View all reservations with filters
- [x] Edit/cancel reservations as admin
- [x] Add customer notes/preferences
- [x] Quick status updates from list view

#### 4. Reservation Flow Enhancements (Priority: HIGH)
- [x] Add confirmation emails for reservations
- [ ] Add reservation reminder emails (scheduled task)
- [ ] Implement reservation modification
- [x] Add guest notes to reservations

#### 5. Basic Operational Settings (Priority: HIGH)
- [ ] Set restaurant operating hours
- [ ] Define max party size
- [ ] Set reservation time slots
- [ ] Add basic availability rules

### Just Completed
1. **SendGrid Email Integration**:
   - Installed @sendgrid/mail package
   - Updated emailService.ts with real SendGrid implementation
   - Added email templates for verification, password reset, reservation confirmation, and welcome emails
   - Created EMAIL_SETUP.md documentation

2. **Admin Reservation Management**:
   - Created comprehensive ReservationManagementPage
   - Added filtering by date and status
   - Quick status updates from dropdown
   - Manual reservation creation dialog
   - Edit/delete functionality
   - Total covers counter
   - Added route to navigation under TableFarm module

3. **Customer Reservation Backend**:
   - Created customerReservationController with full CRUD operations
   - Created customerReservationService for frontend
   - Added customer-specific reservation routes
   - Integrated email confirmation on reservation creation

### Next Steps
1. **Complete Customer Dashboard Integration**:
   - Update CustomerDashboardPage to use customerReservationService
   - Add cancel reservation functionality
   - Add reservation modification

2. **Set up SendGrid Account**:
   - Follow EMAIL_SETUP.md guide
   - Configure API keys in production
   - Test email delivery

3. **Basic Operational Settings**:
   - Create simple settings for operating hours
   - Add reservation time slot configuration
   - Implement basic availability checking

## Executor's Feedback or Assistance Requests

Current task: Implementing email service for production use. This is critical for:
- Customer email verification
- Reservation confirmations
- Password resets

Recommendation: Use SendGrid for reliable email delivery with good documentation and free tier.

## Current Architecture Analysis: Customer vs Staff User Separation

### Issue Summary
The current system has a conceptual overlap between:
1. **Staff Users**: Restaurant employees who use KitchenSync to manage the restaurant (recipes, prep, menus, etc.)
2. **Customer Users**: Restaurant patrons who only need access to make/view reservations and their profile

### Current Implementation

#### Database Level
- Single `User` table with `isCustomer` boolean flag
- `CustomerProfile` table for additional customer-specific data
- Roles: SuperAdmin, Admin, Manager, Staff, User (but customers also have roles)

#### Authentication
1. **Staff Authentication**:
   - Uses `/api/users` endpoints
   - `authMiddleware.ts` for general authentication
   - Full access to KitchenSync features

2. **Customer Authentication**:
   - Uses `/api/auth/customer` endpoints
   - `authenticateCustomer.ts` middleware that checks `isCustomer` flag
   - Separate `CustomerAuthContext` in frontend

#### Frontend Separation
- **Staff Portal**: Main app routes under `/` with `MainLayout`
- **Customer Portal**: Routes under `/customer/*` with `CustomerLayout`
- Separate auth contexts (AuthContext vs CustomerAuthContext)

### Problems with Current Approach

1. **Shared User Table**: 
   - Customers and staff in same table creates security/access concerns
   - Risk of privilege escalation if `isCustomer` flag is compromised
   - Confusing data model (why would a customer have a "role"?)

2. **Authentication Complexity**:
   - Two different auth systems for what should be completely separate entities
   - Middleware must constantly check `isCustomer` flag

3. **Conceptual Mixing**:
   - A restaurant customer is NOT a user of KitchenSync
   - They are a customer of the restaurant that happens to use KitchenSync

### Recommended Architecture

#### Option 1: Separate Customer Entity (Recommended)
1. **Database Changes**:
   ```sql
   -- Remove isCustomer from users table
   ALTER TABLE users DROP COLUMN is_customer;
   
   -- Create separate customers table
   CREATE TABLE customers (
     id SERIAL PRIMARY KEY,
     restaurant_id INTEGER REFERENCES restaurants(id),
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     name VARCHAR(255),
     phone VARCHAR(50),
     email_verified BOOLEAN DEFAULT false,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Update reservations to reference customers
   ALTER TABLE reservations 
     DROP COLUMN customer_id,
     ADD COLUMN customer_id INTEGER REFERENCES customers(id);
   ```

2. **Benefits**:
   - Clear separation of concerns
   - No risk of privilege escalation
   - Simpler authentication logic
   - Scalable for multi-restaurant future

3. **API Structure**:
   ```
   /api/auth/staff/* - Staff authentication
   /api/auth/customer/* - Customer authentication
   /api/admin/* - Staff-only endpoints
   /api/customer/* - Customer-only endpoints
   /api/public/* - Public endpoints (menus, etc.)
   ```

#### Option 2: Role-Based Access Control (Current Enhancement)
1. **Keep single User table but enforce strict separation**:
   - Add `user_type` enum: 'STAFF' | 'CUSTOMER'
   - Remove role inheritance between types
   - Strict middleware enforcement

2. **Challenges**:
   - Still conceptually mixed
   - More complex middleware
   - Harder to scale

### Migration Strategy

1. **Phase 1**: Create new customer infrastructure
   - New customers table
   - New auth endpoints
   - Keep existing for compatibility

2. **Phase 2**: Migrate existing customers
   - Script to move customer users to new table
   - Update reservations foreign keys
   - Test thoroughly

3. **Phase 3**: Remove old infrastructure
   - Remove isCustomer flag
   - Clean up mixed authentication
   - Update documentation

### Implementation Tasks

- [ ] Design new customer database schema
- [ ] Create customer auth controllers
- [ ] Build customer-specific middleware
- [ ] Update reservation/order models
- [ ] Create migration scripts
- [ ] Update frontend auth flow
- [ ] Test customer isolation
- [ ] Document new architecture

## Production Migration Plan: Customer/User Separation

### 🚨 CRITICAL SAFETY MEASURES 🚨

1. **Pre-Migration Backup**
   - Full database backup before ANY changes
   - Test restore procedure on separate database
   - Keep backup for at least 30 days

2. **Migration Testing Protocol**
   - Test ENTIRE migration on staging database first
   - Verify all existing functionality works
   - Test rollback procedure

3. **Zero Downtime Strategy**
   - Deploy backend code that supports BOTH old and new schemas
   - Run migration scripts
   - Deploy frontend code
   - Clean up legacy code in future release

### Phase 1: Pre-Migration Analysis (LOCAL)

#### 1.1 Analyze Current State
- [ ] Run `npm run db:check` on LOCAL database
- [ ] Run `npm run db:check` on PRODUCTION database (read-only)
- [ ] Document all differences between environments
- [ ] Identify all uncommitted changes

#### 1.2 Git Status Check
- [ ] Review all uncommitted changes: `git status`
- [ ] Create feature branch: `git checkout -b feature/customer-user-separation`
- [ ] Commit all local changes with clear messages
- [ ] Document any experimental code that shouldn't go to production

### Phase 2: Code Preparation

#### 2.1 Backend Compatibility Layer
- [ ] Create backward-compatible authentication middleware
- [ ] Support both `users.isCustomer=true` AND `customers` table
- [ ] Add feature flags for gradual rollout
- [ ] Ensure all endpoints work with both schemas

#### 2.2 Database Schema Updates
- [ ] Review Prisma schema for customer tables
- [ ] Ensure no breaking changes to existing tables
- [ ] Add indexes for performance
- [ ] Create safe migration scripts

#### 2.3 Migration Scripts
- [ ] Create idempotent migration scripts (can run multiple times safely)
- [ ] Add dry-run mode to all scripts
- [ ] Include progress logging
- [ ] Add rollback capability

### Phase 3: Staging Environment Testing

#### 3.1 Create Staging Database
- [ ] Clone production database to staging
- [ ] Run full migration process
- [ ] Test all functionality:
  - [ ] Staff login/operations
  - [ ] Customer registration
  - [ ] Customer login
  - [ ] Reservations (staff + customer)
  - [ ] Orders
  - [ ] All existing features

#### 3.2 Performance Testing
- [ ] Measure query performance
- [ ] Check for N+1 queries
- [ ] Verify indexes are used
- [ ] Load test authentication endpoints

### Phase 4: Production Migration Plan

#### 4.1 Pre-Migration (Day Before)
1. [ ] Final backup of production database
2. [ ] Notify users of potential brief slowdown
3. [ ] Deploy backend with compatibility layer (no breaking changes)
4. [ ] Monitor for any issues

#### 4.2 Migration Day
1. **Hour 0: Final Preparations**
   - [ ] Take fresh backup
   - [ ] Put site in read-only mode (optional)
   - [ ] Run pre-migration checks

2. **Hour 1: Database Migration**
   - [ ] Create customer tables
   - [ ] Migrate existing customers from users table
   - [ ] Create customer_restaurants links
   - [ ] Verify data integrity

3. **Hour 2: Backend Deployment**
   - [ ] Deploy updated backend code
   - [ ] Test all endpoints
   - [ ] Monitor error logs

4. **Hour 3: Frontend Deployment**
   - [ ] Deploy customer portal updates
   - [ ] Test customer flows
   - [ ] Test staff flows

5. **Hour 4: Verification**
   - [ ] Run comprehensive test suite
   - [ ] Check all user reports
   - [ ] Monitor performance metrics

#### 4.3 Post-Migration
- [ ] Monitor for 24 hours
- [ ] Address any user issues
- [ ] Plan cleanup of legacy code

### Phase 5: Rollback Plan

#### 5.1 Immediate Rollback (< 1 hour)
1. Revert frontend deployment
2. Revert backend deployment
3. Keep new tables (no data loss)

#### 5.2 Full Rollback (if critical issues)
1. Restore from backup
2. Revert all code deployments
3. Investigate and fix issues

### Migration Scripts Checklist

1. **create-customer-tables.js**
   - Creates tables if not exist
   - Idempotent (safe to run multiple times)
   - No data destruction

2. **migrate-customers.js**
   - Copies customers from users to customers table
   - Preserves all data
   - Creates audit log
   - Idempotent with checks

3. **verify-migration.js**
   - Checks data integrity
   - Reports any issues
   - Non-destructive

### Testing Checklist

#### Staff Operations
- [ ] Login as staff
- [ ] Create/edit recipes
- [ ] Manage menus
- [ ] Handle reservations
- [ ] Process orders

#### Customer Operations
- [ ] Register new account
- [ ] Login
- [ ] Make reservation
- [ ] View reservations
- [ ] Cancel reservation
- [ ] View menu

#### Data Integrity
- [ ] All existing users can login
- [ ] All reservations intact
- [ ] All orders intact
- [ ] No data loss

### Communication Plan

1. **Pre-Migration**
   - Email users about improvements
   - No downtime expected
   - New customer features

2. **During Migration**
   - Status page updates
   - Monitor support channels

3. **Post-Migration**
   - Success announcement
   - Guide for new features
   - Support contact info

### Success Criteria

1. **Zero Data Loss**
   - All users can access their accounts
   - All reservations preserved
   - All orders intact

2. **Functionality**
   - Staff operations unaffected
   - Customer portal fully functional
   - No performance degradation

3. **User Experience**
   - Seamless transition for existing users
   - Clear communication
   - Quick issue resolution

### Lessons from Previous Incidents

1. **NEVER run scripts on production without:**
   - Reading the script completely
   - Understanding what it does
   - Having a fresh backup
   - Testing on staging first

2. **Always use `.env.local` for development**
   - Production credentials only for emergencies
   - Use read-only access when possible

3. **Backup before ANY operation**
   - Even "safe" operations
   - Test restore procedure
   - Keep multiple backup versions

## Production Migration Progress (2025-05-25)

### Completed Tasks
1. ✅ Created comprehensive migration plan in scratchpad
2. ✅ Created production-safe migration scripts:
   - `production-customer-migration.js` - Main migration with dry-run, execute, and rollback modes
   - `production-backup.js` - JSON backup script for pre-migration safety
   - `production-preflight-check.js` - Read-only verification script
3. ✅ Created detailed migration guide: `backend/docs/PRODUCTION_MIGRATION_GUIDE.md`
4. ✅ Fixed schema compatibility issues:
   - User model uses `name` instead of `firstName`/`lastName`
   - No `isActive` field in User model
   - No email verification fields in User model
5. ✅ Created feature branch: `feature/customer-user-separation-production`

### Script Features
- **Safety First**: All scripts default to dry-run mode
- **Comprehensive Logging**: Detailed JSON logs with timestamps
- **Rollback Capability**: Can undo migration if issues found
- **Production Checks**: Multiple confirmations for production changes
- **Idempotent**: Scripts can be run multiple times safely

### Next Steps
1. [ ] Test all scripts on local database
2. [ ] Commit all changes to feature branch
3. [ ] Create staging environment for testing
4. [ ] Update backend code for compatibility layer
5. [ ] Run full test suite
6. [ ] Schedule production migration window

### Important Notes
- Production database uses different schema (name vs firstName/lastName)
- Customer tables partially exist in production (customer_profiles)
- Reservations table already has customer_id column
- 3 customers need to be migrated from users table
- All scripts require explicit confirmation for production execution

### Migration Safety Checklist
- [ ] Backup production database
- [ ] Test on staging environment
- [ ] Review all uncommitted changes
- [ ] Ensure rollback plan is ready
- [ ] Monitor for 24 hours post-migration

## Production Fix: Reservation Foreign Key (2025-05-26)

### Issue Fixed
Customer reservations were failing with 500 error because:
1. The `reservations.customer_id` foreign key was pointing to `users` table instead of `customers` table
2. The `reservations.user_id` field was NOT NULL, preventing customer-only reservations
3. The customerReservationController wasn't using the `customerId` field due to type mismatch

### Changes Made
1. **Database Changes**:
   - Fixed foreign key constraint: `reservations.customer_id` now references `customers(id)`
   - Made `user_id` nullable to allow customer reservations without staff assignment
   - Created and ran `fix-reservation-foreign-key.js` script

2. **Schema Updates**:
   - Updated Prisma schema to mark `userId` as optional (`Int?`)
   - Regenerated Prisma client to update TypeScript types

3. **Code Updates**:
   - Updated `customerReservationController` to use `customerId` field
   - Removed requirement for `userId` in customer reservations

### Result
Customer reservations now work correctly. Customers can create reservations through the customer portal without errors.