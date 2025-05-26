# Changelog

All notable changes to KitchenSync will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.11.1] - 2025-05-26

### Added
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