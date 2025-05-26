# KitchenSync Development Scratchpad

## Project Overview
KitchenSync is a comprehensive restaurant management platform that integrates recipe management, kitchen prep workflows, menu creation, reservations, and order management into a single system.

## Current Version: 2.11.1

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
- ✅ Customer authentication system

#### 5. Content Management System - v2.10.0
- ✅ Dynamic content blocks
- ✅ Multiple block types (Text, HTML, Image, CTA, Hero, etc.)
- ✅ Drag-and-drop reordering
- ✅ Page-specific content
- ✅ Cloudinary image management

#### 6. Restaurant Settings & Branding - v2.10.0
- ✅ Complete website customization
- ✅ Theme colors and fonts
- ✅ Logo and image management
- ✅ SEO settings
- ✅ Social media links
- ✅ Opening hours

#### 7. Admin Dashboard - NEW v2.11.1
- ✅ Customer management with search and filtering
- ✅ Customer analytics endpoints
- ✅ Staff management endpoints
- ✅ Role-based access control
- ✅ Admin-only navigation menu
- ✅ Email testing infrastructure

### 🚧 In Progress

#### ChefRail (Kitchen Display)
- Status: Planned
- Real-time order display
- Kitchen communication system
- Order status tracking

## Recent Achievements (v2.11.1)

### Admin Dashboard Implementation
1. **Customer Management**
   - Comprehensive customer list with pagination
   - Search by name, email, or phone
   - Filter by email verification status
   - View reservation counts and last visit
   - Customer detail and edit modals (placeholders)
   - Add notes and manage tags (API ready)

2. **Staff Management**
   - Full CRUD API for staff users
   - Role-based permissions
   - Activity tracking
   - Password reset functionality
   - User activation/deactivation

3. **Analytics**
   - Customer analytics API
   - Staff analytics API
   - Ready for dashboard visualization

4. **Email Infrastructure**
   - SendGrid integration
   - Email testing scripts
   - Templates for verification, welcome, password reset, and reservations
   - Production environment documentation

### Customer/User Separation (v2.11.0)
1. **Database Migration**
   - Separate `customers` table for restaurant patrons
   - Fixed foreign key constraints
   - Made `user_id` nullable in reservations
   - Production-safe migration scripts

2. **Authentication Updates**
   - Separate customer auth flow
   - Customer-specific middleware
   - Fixed cross-authentication issues

## Technical Stack

### Database
- PostgreSQL with Prisma ORM
- Single-tenant architecture (MVP)
- Restaurant ID = 1 for all operations
- Separate users (staff) and customers tables

### Authentication
- JWT-based auth for both staff and customers
- Separate auth contexts and storage
- Role hierarchy: SuperAdmin > Admin > User
- Customer accounts separate from staff

### Email Service
- SendGrid for transactional emails
- Templates for all user communications
- Test scripts for development
- Environment-based configuration

### Image Management
- Cloudinary for all uploads
- Automatic optimization
- Public ID tracking for updates/deletes

### Frontend Architecture
- React with TypeScript
- Material-UI components
- Separate layouts for admin/customer
- Theme provider for dynamic styling
- React Query for data fetching

## Environment Variables Required

### Backend
```
DATABASE_URL=
JWT_SECRET=
SESSION_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SENDGRID_API_KEY=
FROM_EMAIL=
FRONTEND_URL=
```

### Frontend
```
VITE_API_URL=http://localhost:3001/api
```

## API Structure

### Public Endpoints
- `/api/public/*` - Restaurant info, menus
- `/api/auth/customer/*` - Customer authentication

### Customer Endpoints
- `/api/customer/*` - Customer-specific features
- `/api/customer/reservations` - Reservation management

### Staff Endpoints
- `/api/users/*` - Staff authentication
- `/api/recipes/*`, `/api/menus/*`, etc. - Restaurant management
- `/api/admin/*` - Admin-only features (NEW)

### Admin Endpoints (NEW v2.11.1)
- `/api/admin/customers` - Customer management
- `/api/admin/customers/analytics` - Customer analytics
- `/api/admin/staff` - Staff management
- `/api/admin/staff/analytics` - Staff analytics

## Deployment Notes
- Auto-deploy enabled on Render
- Main branch triggers deployment
- Database hosted on Render PostgreSQL
- Static frontend on Render Static Site
- Environment variables must be set in Render dashboard

## Version History
- v2.11.1: Admin Dashboard, email testing infrastructure
- v2.11.0: Customer/user separation, production fixes
- v2.10.0: Content Management, Restaurant Settings, Customer Portal
- v2.9.0: TableFarm initial implementation
- v2.8.0: MenuBuilder enhancements
- v2.7.0: AgileChef improvements
- Previous versions: Core module development

## Known Issues & Limitations

1. Single restaurant support only (multi-tenant deferred)
2. No payment processing
3. No real-time updates (WebSocket support planned)
4. Basic reservation system (no table management yet)
5. Email reminders not implemented

## Next Steps

### Immediate Priorities
1. Complete customer detail modal implementation
2. Build analytics dashboard with charts
3. Implement staff management UI
4. Add export functionality for customer data
5. Create bulk operations for admin tasks

### Future Enhancements
1. ChefRail implementation
2. WebSocket for real-time updates
3. Email reminder system
4. Advanced reservation features
5. Multi-restaurant support
6. Payment processing
7. Mobile apps
8. API documentation

## Development Guidelines

### Database Safety
- ALWAYS use `npm run dev:local` for development
- NEVER use production database for testing
- Run `npm run db:check` before any operations
- Create backups before migrations

### Git Workflow
- Feature branches for new work
- Test thoroughly before merging
- Tag releases with version numbers
- Document all breaking changes

### Testing
- Test all features locally first
- Use staging environment when possible
- Test email flows with test script
- Verify customer/staff separation

## Recent Decisions and Changes

1. **Admin Dashboard Architecture** (2025-05-26)
   - Separate controllers for customer and staff management
   - Role-based middleware for access control
   - Comprehensive analytics endpoints
   - Placeholder UI components for iterative development

2. **Email Service Implementation** (2025-05-26)
   - SendGrid chosen for reliability and free tier
   - Test scripts for all email types
   - Environment-based configuration
   - Documentation for production setup

3. **Customer Management Design** (2025-05-26)
   - Paginated list with real-time search
   - Detailed customer profiles
   - Note and tag system for CRM
   - Integration with reservation data

## Lessons Learned
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
- Always use `npm run dev:local` in the backend
- CORS Configuration - ensure credentials: true for JWT auth
- Read the file before you try to edit it
- If there are vulnerabilities that appear in the terminal, run npm audit before proceeding
- Always ask before using the -force git command
- Separate Customer and Staff Authentication to avoid cross-authentication issues
- Customer Auth Context must be initialized properly to persist across routes
- Database Safety - NEVER use production database for development
- Use visual distinctions between prod and dev environments
- Create placeholder components to avoid build errors during development
- Implement proper TypeScript types for all API responses

## Project Status Board
- [x] Implement Admin Dashboard backend
- [x] Create customer management API
- [x] Create staff management API
- [x] Build admin frontend structure
- [x] Implement customer list view
- [x] Add email testing infrastructure
- [x] Fix production API URL configuration
- [ ] Wait for Render auto-deployment (in progress)
- [ ] Complete customer detail modal
- [ ] Complete customer edit form
- [ ] Build staff management UI
- [ ] Create analytics visualizations
- [ ] Add export functionality
- [ ] Implement bulk operations
- [ ] Add customer communication features
- [ ] Create help documentation

## Executor's Feedback or Assistance Requests

### Status Update (2025-05-26)
- Fixed the production API URL issue in both `adminApi.ts` and `config.ts`
- Both files now correctly use `https://kitchen-sync-api.onrender.com` when in production
- Changes have been committed and pushed to GitHub
- Render should automatically deploy the changes since auto-deploy is enabled
- Once deployed, the admin dashboard should work correctly in production