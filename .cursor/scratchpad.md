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
- [ ] Apply restaurant settings database migration
- [ ] Create restaurant settings admin interface
- [ ] Update customer portal to use dynamic restaurant settings
- [ ] Implement customer reservations list
- [ ] Add customer authentication
- [ ] Create order entry interface for staff
- [ ] Add WebSocket support for real-time updates
- [ ] Implement ChefRail module
- [ ] Implement Recipe URL Import feature
- [ ] Add user authentication improvements
- [ ] Implement backup and data export features

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

## Executor's Feedback or Assistance Requests
- Restaurant settings model and controller created
- Need to run Prisma migration before continuing
- Customer menu view is functional and ready
- Admin interface design should be comprehensive but user-friendly
- Consider adding image upload to Cloudinary for consistency with recipe photos

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
