# Changelog

All notable changes to KitchenSync will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.0] - 2025-01-03

### Added
- **Production-Ready Website Builder** - Complete stability and advanced customization
  - Resolved all production deployment issues and database schema conflicts
  - Comprehensive error handling with graceful fallbacks
  - Database schema synchronization between local and production environments
  - Authentication security fixes for customer/admin system separation
  - Stable API endpoints with proper routing and middleware configuration
- **Advanced Navigation Customization**
  - Layout options: topbar, sidebar, or hybrid navigation layouts
  - Alignment control: left, center, right, or justified navigation alignment
  - Style themes: modern, classic, minimal, or rounded navigation styles
  - Mobile responsiveness with dedicated mobile menu controls
  - Dynamic navigation with automatic inclusion of custom pages
  - System page protection for essential navigation items
- **Info Panes Customization System**
  - Card title customization for Opening Hours, Location, and Contact cards
  - Visibility controls to show/hide individual info cards
  - Content personalization to match restaurant branding
  - Responsive design that adapts to all screen sizes
- **Opening Hours Display System**
  - Robust data parsing for opening hours (JSON string or object formats)
  - Consistent display across all website sections (info cards, footer, etc.)
  - Error prevention for numbered list display bugs (0: -, 1: -, etc.)
  - Format flexibility supporting various time formats
- **Database Schema Management**
  - Production synchronization with comprehensive SQL migration scripts
  - Automatic addition of missing database columns
  - Schema validation with intelligent field filtering
  - Safe migration procedures with rollback capabilities

### Fixed
- **Critical Production Fixes**
  - Database schema conflicts between local and production environments
  - API routing issues causing HTML responses instead of JSON
  - Authentication conflicts between customer and admin systems
  - Static file serving middleware configuration
  - Opening hours data format inconsistencies across all endpoints
- **Website Builder Stability**
  - Field mapping for all customization options
  - Data type conversion for arrays, JSON, and complex data types
  - Save functionality with proper error handling
  - State management in customization forms
  - Validation logic for all customization inputs

### Technical
- Intelligent field filtering system based on database schema availability
- Enhanced error recovery with detailed logging and recovery mechanisms
- Proper API middleware ordering to prevent conflicts
- Comprehensive data type validation for complex data structures
- Unified API service integration with proper error handling 
## [3.2.0] - 2024-12-28

### Added
- **Page Manager System** - Complete page management with virtual page architecture
  - Full CRUD operations for restaurant pages with intuitive interface
  - Virtual page architecture using existing ContentBlock data (no database changes)
  - System page protection for essential pages (Home, About, Menu, Contact)
  - Dynamic page creation with flexible content organization
  - SEO optimization with meta titles, descriptions, and keywords
- **Website Builder-Page Manager Synchronization**
  - Unified content management with single source of truth
  - Real-time synchronization between Website Builder and Page Manager
  - ContentBlocks table established as authoritative source for hero/about content
  - Direct image upload integration to content management system
- **Content Block Organization**
  - Visual content management with drag-and-drop organization
  - Page-content association with clear filtering
  - Multiple content block types (text, image, hero, contact)
  - Intuitive content ordering within pages

### Fixed
- **Production Deployment Issues**
  - Resolved Prisma schema P1012 validation error with missing ContentBlock model
  - Fixed page-to-content-block association issues with consistent pageId mapping
  - Professional button layout and spacing improvements
  - Automatic creation of missing system pages
- **Data Synchronization**
  - Resolved 0% synchronization between Website Builder and Page Manager
  - Established ContentBlocks as single source of truth for all hero/about content
  - Real-time content synchronization across all systems

### Technical
- Virtual page system with hash-based ID generation
- Production-safe implementation requiring no database schema changes
- Comprehensive API for page management operations
- Enhanced error handling and recovery mechanisms

## [3.1.0] - 2024-12-25

### Added
- **Clean Restaurant URLs** - Professional URL structure for restaurant portals
  - Removed `/customer` prefix from restaurant subdomain URLs
  - Clean URLs like `restaurant.kitchensync.restaurant/menu`
  - Improved branding and SEO benefits
- **Dual-Routing System**
  - Conditional routing based on domain context (restaurant subdomain vs main domain)
  - Backward compatibility with legacy `/customer/*` URLs on main domain
  - Context-aware navigation adapting to current domain
  - ConditionalRoutes component for smart routing logic
- **Enhanced Customer Experience**
  - Professional appearance with clean URLs
  - Simplified navigation and easier URL sharing
  - Mobile-friendly URL structure
  - Brand consistency across all customer touchpoints

### Technical
- SubdomainRouter enhancement for clean URL handling
- buildCustomerUrl utility for conditional URL generation
- Updated navigation across CustomerLayout, CustomerDashboardPage, CustomerLoginForm
- Comprehensive testing coverage for all routing scenarios

## [3.0.0] - 2024-12-22

### Added
- **Major Platform Restructure** - Complete transformation to modular, subscription-based platform
  - Modular platform architecture with subscription-based features
  - Multi-tenant system with complete restaurant isolation
  - Subdomain routing system (restaurant.kitchensync.restaurant)
  - Module-based navigation system
- **Website Builder Module**
  - Visual website builder with drag-and-drop functionality
  - Professional templates including Fine Dining inspired by Arden PDX
  - Complete theme customization with colors, fonts, and layouts
  - Integrated content management for restaurant websites
- **Subscription Tiers**
  - TRIAL: 14-day free trial with full access
  - FREE: Basic features for small operations
  - HOME: $29/month for home-based food businesses
  - STARTER: $79/month with MenuBuilder access
  - PROFESSIONAL: $149/month with all modules
  - ENTERPRISE: $199/month with advanced features and support
- **Module System**
  - Core Modules (All Tiers): Dashboard, CookBook, AgileChef, Issue Tracker
  - Premium Modules: MenuBuilder (Starter+), TableFarm (Professional+), ChefRail (Professional+), Website & Marketing (Professional+)

### Changed
- **Breaking Changes**
  - Restaurant Settings renamed to Website Builder
  - Routes changed from `/settings` to `/website`
  - Complete database restructure for multi-tenant support
  - Enhanced authentication system for multi-tenant support

### Technical
- Express downgraded to 4.x for improved stability
- Multi-tenant database architecture with secure data isolation
- Sophisticated subdomain routing system
- DNS configuration for wildcard subdomain support
- Module-based backend architecture with feature toggles

## [2.12.0] - 2024-12-18

### Added
- **Stripe Integration** - Complete payment processing system
  - Working Stripe checkout integration with secure payment processing
  - Subscription management with automated creation and billing
  - Payment method storage and invoice generation
  - Multi-tenant billing with restaurant-specific subscription tracking
- **New Pricing Tier Structure**
  - HOME Tier: $29/month for home-based food businesses
  - ENTERPRISE Tier: $199/month (renamed and enhanced from previous HOME tier)
  - Improved tier progression with better feature distribution
  - Flexible billing with monthly and annual options
- **Platform Admin Features**
  - Billing analytics dashboard with comprehensive revenue metrics
  - Subscription management tools for admin oversight
  - Payment monitoring with real-time status tracking
  - Revenue reporting and customer support tools

### Technical
- Stripe Price ID validation before checkout session creation
- Enhanced error handling for payment-related issues
- Webhook integration for secure payment event processing
- Comprehensive audit trail for all billing-related changes
- **Admin Dashboard** - Comprehensive admin interface for managing customers and staff
  - Customer management with search, filtering, and pagination
  - Customer analytics API endpoints
  - Staff management API with full CRUD operations
  - Staff analytics endpoints
  - Role-based access control for admin features
  - Admin-only navigation menu item
- **Email Testing Infrastructure**
  - Test scripts for all email types (verification, welcome, password reset, reservations)
  - NPM scripts: `test:email` and `test:email:local`
  - Comprehensive email testing documentation
- **Production Environment Documentation**
  - SendGrid setup guide
  - Environment variable documentation
  - Email configuration instructions

### Changed
- Updated navigation to include Admin Dashboard for admin users
- Enhanced backend package.json with email testing scripts

### Security
- Implemented strict role-based access control for admin endpoints
- Added permission checks for customer data access

## [2.11.0] - 2025-05-26

### Added
- **Customer/User Separation** - Complete architectural separation of staff and customers
  - Separate `customers` table for restaurant patrons
  - Customer-specific authentication flow
  - Production-safe migration scripts
  - Rollback capabilities for migrations

### Fixed
- Fixed reservation foreign key constraint (customer_id now references customers table)
- Made user_id nullable in reservations table to support customer-only reservations
- Fixed customer registration name field mapping
- Resolved cross-authentication issues between staff and customers
- Fixed CORS configuration for production environment

### Changed
- Updated Prisma schema to reflect new customer architecture
- Modified reservation controller to use proper customer references

### Security
- Enhanced authentication separation to prevent privilege escalation
- Isolated customer and staff authentication contexts

## [2.10.0] - 2024-12-20

### Added
- **Content Management System**
  - Dynamic content blocks with multiple types
  - Drag-and-drop content reordering
  - Page-specific content management
  - Cloudinary integration for images
- **Restaurant Settings & Branding**
  - Complete website customization interface
  - Theme colors and fonts configuration
  - Logo and image management
  - SEO settings
  - Social media links
  - Operating hours management
- **Customer Portal**
  - Public-facing customer website
  - Customer registration and login
  - Email verification flow
  - Reservation booking interface
  - Menu viewing
  - Customer dashboard

### Changed
- Restructured frontend to support separate customer and staff portals
- Enhanced routing to handle public and private sections

## [2.9.0] - 2024-12-15

### Added
- **TableFarm Module** - Complete reservation and order management
  - Reservation calendar system
  - Customer information management
  - Order entry and management
  - Integration with MenuBuilder for menu items

## [2.8.0] - 2024-12-01

### Added
- **MenuBuilder Enhancements**
  - Rich text editing for menu descriptions
  - PDF export functionality
  - Advanced theme customization
  - Logo upload support

### Changed
- Improved menu preview interface
- Enhanced drag-and-drop functionality

## [2.7.0] - 2024-11-15

### Added
- **AgileChef Improvements**
  - Custom column management
  - Enhanced drag-and-drop between columns
  - Recipe integration in prep tasks
  - Task priority settings

## [2.6.0] - 2024-11-01

### Added
- **MenuBuilder Module**
  - Create and manage multiple menus
  - Drag-and-drop menu sections and items
  - Recipe integration
  - Print-friendly layouts

## [2.5.0] - 2024-10-15

### Added
- **AgileChef Module** - Prep management system
  - Kanban-style task board
  - Recipe-based task creation
  - Custom workflow columns

## [2.4.0] - 2024-10-01

### Added
- Recipe photo upload with Cloudinary
- Enhanced recipe detail views
- Ingredient categorization

### Fixed
- Recipe scaling calculations
- Unit conversion accuracy

## [2.3.0] - 2024-09-15

### Added
- Sub-recipe support
- Recipe import from text
- Batch recipe operations

## [2.2.0] - 2024-09-01

### Added
- Issue tracking system
- User profile management
- Dashboard analytics

## [2.1.0] - 2024-08-15

### Added
- Recipe categorization
- Advanced search functionality
- Print recipe cards

## [2.0.0] - 2024-08-01

### Added
- Complete UI redesign with Material-UI
- React Query for data management
- TypeScript migration completed

### Changed
- Migrated from JavaScript to TypeScript
- New component architecture
- Improved API structure

## [1.0.0] - 2024-07-01

### Added
- Initial release
- Basic recipe management
- Ingredient tracking
- Unit conversion system
- User authentication 