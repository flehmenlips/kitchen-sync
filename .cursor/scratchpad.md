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
- Always check if backend/frontend servers are already running before trying to start them (use `lsof -i :3001` for backend, `lsof -i :5173` for frontend)

## Project Status Board
- [x] Implement Admin Dashboard backend
- [x] Create customer management API
- [x] Create staff management API
- [x] Build admin frontend structure
- [x] Implement customer list view
- [x] Add email testing infrastructure
- [x] Fix production API URL configuration
- [x] Create platform database schema
- [x] Apply platform architecture migration
- [x] Create platform auth controller
- [x] Create platform auth middleware
- [x] Create platform routes
- [x] Create first super admin account (george@seabreeze.farm)
- [x] Implement restaurant listing controller
- [x] Implement restaurant details controller
- [x] Create comprehensive restaurant management endpoints
- [x] Add restaurant analytics endpoints
- [x] Add platform analytics endpoint
- [x] Test all platform auth and restaurant endpoints
- [x] Create platform admin UI components
- [x] Build platform admin layout with navigation
- [x] Create restaurant service for API calls
- [x] Build restaurant list page with filters and pagination
- [x] Update routing structure for platform admin
- [x] Create restaurant detail page with tabs
- [x] Add restaurant verification/suspension modals
- [x] Build platform analytics dashboard with charts
- [x] Update platform dashboard with real data
- [x] Implement multi-tenancy backend (Phase 1-5 complete)
- [x] Fix multi-tenancy frontend issues with restaurant context
- [x] Create subscription database schema
- [x] Create Stripe service for payment integration
- [x] Create subscription controller with CRUD operations
- [x] Add subscription routes to platform API
- [ ] Create subscription UI components
- [ ] Build subscription list page
- [ ] Create subscription detail/edit modals
- [ ] Implement Stripe webhook handling
- [ ] Create billing portal integration
- [ ] Implement multi-tenancy frontend
- [ ] Create restaurant context provider
- [ ] Add restaurant selector UI
- [ ] Test multi-restaurant scenarios
- [ ] Complete customer detail modal
- [ ] Complete customer edit form
- [ ] Build staff management UI
- [ ] Create analytics visualizations
- [ ] Add export functionality
- [ ] Implement bulk operations
- [ ] Add customer communication features
- [ ] Create help documentation
- [ ] Create admin management pages for super admins
- [ ] Build subscription management interface
- [ ] Implement diner authentication
- [ ] Create TableFarm Next.js project

## Executor's Feedback or Assistance Requests

### Phase 5 Complete - Multi-Tenancy and Platform Admin Progress

We've made excellent progress today:

1. **Fixed Platform Admin Production Issues**:
   - Added missing platform-specific columns to restaurants table
   - Fixed enum type conversions for OnboardingStatus
   - Platform admin dashboard now loads successfully with all 7 restaurants

2. **Fixed Multi-Tenancy Frontend Issues**:
   - Added X-Restaurant-Id header to all API services
   - Fixed 401 errors when accessing prep board and other endpoints
   - George can now access all his data at Coq au Vin

3. **Implemented Subscription System Backend**:
   - Created comprehensive database schema for subscriptions, invoices, and usage tracking
   - Built Stripe service for payment integration
   - Created subscription controller with full CRUD operations
   - Added subscription routes with proper role-based access control
   - Backend builds successfully with no TypeScript errors

### Next Steps
We're ready to build the subscription UI components in the platform admin dashboard. This will include:
- Subscription list page with filters and pagination
- Subscription detail view with Stripe data
- Admin override capabilities for SUPER_ADMIN role
- Integration with Stripe customer portal

The backend infrastructure is solid and ready to support the frontend implementation.

# KitchenSync Multi-Tenancy Fix Plan

## Background and Motivation
KitchenSync currently has a broken multi-tenancy model where:
1. Any staff user can see ALL reservations from ALL restaurants
2. Data models are inconsistently tied to restaurants
3. The RestaurantStaff relationship exists but isn't utilized
4. New users automatically become staff in the production restaurant

## Key Challenges and Analysis

### Current State Issues:
1. **Reservations Controller**: Shows all reservations regardless of restaurant
2. **Hardcoded Restaurant ID**: Everything defaults to restaurant ID 1
3. **Missing Restaurant Context**: User sessions don't track which restaurant they're working with
4. **Incomplete Schema**: Many models (Recipe, Menu, Ingredient) lack restaurantId

### Required Changes:
1. Add restaurantId to all relevant models
2. Implement restaurant context in user sessions
3. Filter all queries by current restaurant
4. Separate restaurant account creation from staff addition
5. Implement proper restaurant switching for multi-restaurant staff

## High-level Task Breakdown

### Phase 1: Schema Updates
- [ ] Add restaurantId to Recipe, Menu, Ingredient, UnitOfMeasure, PrepTask, PrepColumn models
- [ ] Create migration script to assign existing data to restaurant 1
- [ ] Update all Prisma queries to include restaurantId filters

### Phase 2: Restaurant Context
- [ ] Add currentRestaurantId to user session/JWT
- [ ] Create restaurant selection UI for multi-restaurant staff
- [ ] Update all API endpoints to use current restaurant context

### Phase 3: Reservation Filtering Fix
- [ ] Update getReservations to filter by restaurantId
- [ ] Ensure all reservation CRUD operations respect restaurant boundaries
- [ ] Add restaurant validation to prevent cross-restaurant data access

### Phase 4: Restaurant Registration
- [ ] Create restaurant registration flow (separate from user registration)
- [ ] Restaurant owner creates restaurant account
- [ ] Owner can invite staff members
- [ ] Staff join specific restaurants via invitation

### Phase 5: Access Control
- [ ] Implement middleware to check RestaurantStaff permissions
- [ ] Validate user has access to current restaurant
- [ ] Prevent unauthorized restaurant switching

## Current Status / Progress Tracking
- [x] Identified multi-tenancy issues
- [ ] Schema updates planned
- [ ] Implementation started

## Executor's Feedback or Assistance Requests
- Need to decide on approach: Add restaurantId to all models vs. use RestaurantStaff for access control
- Consider impact on existing production data
- Plan for data migration strategy

## Lessons
- Multi-tenancy must be designed from the start
- Restaurant context should be part of every API request
- Access control needs to be enforced at the database query level

# KitchenSync SaaS Platform Architecture Plan

## Background and Motivation
Transform KitchenSync from a single-restaurant application into a full SaaS platform where:
1. Restaurants can sign up and manage their own instances
2. SuperAdmin can manage the platform, onboard restaurants, handle billing
3. Proper separation between platform management and restaurant operations
4. Subscription-based monetization model

## Key Architecture Decisions

### Account Structure Best Practices
1. **Separate Platform Admin from Restaurant Operations**
   - Platform SuperAdmin account (you@kitchensync.com) - manages the platform
   - Restaurant Owner account (george@seabreeze.farm) - manages your restaurant
   - Never mix platform administration with restaurant operations

2. **User Hierarchy**
   - **Platform Level**: SuperAdmin → Platform Support Staff
   - **Restaurant Level**: Owner → Manager → Staff → Customer

3. **Data Isolation**
   - Complete data isolation between restaurants
   - Platform admins can view aggregate analytics but not restaurant data
   - Support mode for platform admins to assist restaurants (with audit trail)

## High-level Task Breakdown

### Phase 1: Platform Foundation
- [ ] Create separate Platform Admin portal (`/platform-admin`)
- [ ] Implement restaurant registration flow
- [ ] Add subscription/billing models to schema
- [ ] Create onboarding workflow for new restaurants
- [ ] Implement platform-level authentication

### Phase 2: SuperAdmin Portal Features
1. **Restaurant Management**
   - [ ] List all restaurants with status, subscription info
   - [ ] View restaurant details (owner, plan, usage stats)
   - [ ] Suspend/activate restaurants
   - [ ] Impersonate mode for support (with audit logging)

2. **User Management**
   - [ ] View all platform users
   - [ ] Verify restaurant owners
   - [ ] Handle support tickets
   - [ ] Manage platform staff

3. **Billing & Subscriptions**
   - [ ] Subscription plan management (Starter, Professional, Enterprise)
   - [ ] Usage tracking (seats, storage, API calls)
   - [ ] Payment integration (Stripe)
   - [ ] Invoice generation
   - [ ] Trial period management

4. **Analytics & Monitoring**
   - [ ] Platform health dashboard
   - [ ] Restaurant growth metrics
   - [ ] Revenue analytics
   - [ ] Usage patterns
   - [ ] System performance

5. **Onboarding & Support**
   - [ ] Onboarding checklist for new restaurants
   - [ ] Document verification
   - [ ] Setup assistance
   - [ ] Training resources
   - [ ] Support ticket system

### Phase 3: Multi-Tenancy Implementation
1. **Schema Updates**
   ```prisma
   model Subscription {
     id               Int                @id @default(autoincrement())
     restaurantId     Int                @unique
     plan             SubscriptionPlan
     status           SubscriptionStatus
     currentPeriodEnd DateTime
     trialEndsAt      DateTime?
     seats            Int
     // ... billing details
   }

   model PlatformAdmin {
     id          Int      @id @default(autoincrement())
     email       String   @unique
     name        String
     role        PlatformRole // SUPER_ADMIN, SUPPORT, BILLING
     // ... separate from restaurant users
   }
   ```

2. **Restaurant Context**
   - [ ] Add restaurantId to ALL data models
   - [ ] Implement restaurant selection for multi-restaurant users
   - [ ] Update all queries to filter by restaurant
   - [ ] Add middleware for restaurant context validation

3. **API Structure**
   - `/api/platform/*` - Platform admin endpoints
   - `/api/auth/platform/*` - Platform admin auth
   - `/api/restaurants/:restaurantId/*` - Restaurant-specific APIs
   - `/api/public/*` - Public endpoints (menus, etc.)

### Phase 4: Billing Integration
1. **Subscription Plans**
   - **Starter**: $49/month - 5 staff, basic features
   - **Professional**: $149/month - 20 staff, all features
   - **Enterprise**: Custom pricing - unlimited staff, API access

2. **Features by Plan**
   - Staff seats limit
   - Storage limits
   - API rate limits
   - Advanced features (analytics, integrations)

3. **Payment Flow**
   - Stripe integration for payments
   - Automated billing
   - Payment failure handling
   - Plan upgrades/downgrades

### Phase 5: Restaurant Onboarding
1. **Self-Service Flow**
   - Sign up with business email
   - Verify email
   - Enter restaurant details
   - Choose plan (14-day trial)
   - Add payment method
   - Initial setup wizard

2. **Admin Verification**
   - Review new signups
   - Verify business credentials
   - Approve/reject with notes
   - Manual onboarding for enterprise

## Database Schema Updates

```prisma
// Platform-specific models
model PlatformAdmin {
  id                Int                 @id @default(autoincrement())
  email             String              @unique
  password          String
  name              String
  role              PlatformRole
  lastLoginAt       DateTime?
  createdAt         DateTime            @default(now())
  actions           PlatformAction[]
  supportTickets    SupportTicket[]
}

model Restaurant {
  // ... existing fields ...
  subscription      Subscription?
  onboardingStatus  OnboardingStatus    @default(PENDING)
  verifiedAt        DateTime?
  verifiedBy        Int?
  suspendedAt       DateTime?
  suspendedReason   String?
}

model Subscription {
  id                 Int                 @id @default(autoincrement())
  restaurantId       Int                 @unique
  plan               SubscriptionPlan
  status             SubscriptionStatus
  stripeCustomerId   String?
  stripeSubId        String?
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAt           DateTime?
  canceledAt         DateTime?
  trialEndsAt        DateTime?
  seats              Int                 @default(5)
  restaurant         Restaurant          @relation(fields: [restaurantId], references: [id])
  invoices           Invoice[]
  usageRecords       UsageRecord[]
}

model SupportTicket {
  id            Int             @id @default(autoincrement())
  restaurantId  Int
  subject       String
  description   String
  status        TicketStatus
  priority      TicketPriority
  assignedTo    Int?
  restaurant    Restaurant      @relation(fields: [restaurantId], references: [id])
  admin         PlatformAdmin?  @relation(fields: [assignedTo], references: [id])
  messages      TicketMessage[]
}

enum PlatformRole {
  SUPER_ADMIN
  SUPPORT
  BILLING
  DEVELOPER
}

enum SubscriptionPlan {
  TRIAL
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum OnboardingStatus {
  PENDING
  IN_PROGRESS
  VERIFIED
  REJECTED
  COMPLETED
}
```

## Implementation Timeline

### Month 1: Foundation
- Platform admin portal structure
- Restaurant registration flow
- Basic subscription models
- SuperAdmin authentication

### Month 2: Core Features
- Restaurant management interface
- User verification system
- Basic billing integration
- Onboarding workflow

### Month 3: Advanced Features
- Full Stripe integration
- Analytics dashboard
- Support ticket system
- Usage tracking

### Month 4: Polish & Launch
- Performance optimization
- Security audit
- Documentation
- Beta testing with select restaurants

## Security Considerations

1. **Complete Isolation**
   - Restaurant data never accessible cross-tenant
   - Platform admins can't see restaurant data directly
   - Audit trail for all admin actions

2. **Support Mode**
   - Time-limited access
   - Read-only by default
   - Full audit logging
   - Customer notification

3. **API Security**
   - Rate limiting per restaurant
   - API keys per restaurant
   - Webhook validation
   - CORS per domain

## Monetization Strategy

1. **Pricing Tiers**
   - Freemium: 1 user, basic features (lead generation)
   - Starter: Small restaurants
   - Professional: Growing restaurants
   - Enterprise: Chains, franchises

2. **Add-ons**
   - Additional staff seats
   - SMS notifications
   - API access
   - White-label options
   - Priority support

3. **Revenue Streams**
   - Monthly subscriptions
   - Transaction fees for online orders
   - Premium integrations
   - Training and consulting

## Current Status / Progress Tracking
- [x] Identified need for platform admin portal
- [x] Defined account structure best practices
- [ ] Platform admin portal implementation
- [ ] Subscription system design
- [ ] Restaurant registration flow

## Executor's Feedback or Assistance Requests
- Need to decide on initial pricing model
- Should we build our own billing or use a service like Stripe Billing?
- Consider using a multi-tenant database vs database-per-tenant approach
- Need legal review for Terms of Service and Privacy Policy

## Lessons
- SaaS platforms require clear separation between platform and tenant operations
- SuperAdmin should never directly access customer data without audit trails
- Onboarding flow is critical for conversion and reducing support burden
- Start with simple billing, iterate based on customer feedback

# Platform Admin Foundation Implementation Plan (Option A)

## Architecture Overview

### Project Structure
KitchenSync will maintain its monorepo structure with three main applications:

1. **Restaurant App** (existing) - `/frontend` and `/backend`
   - Current restaurant management system
   - Customer portal at `/customer`
   - Admin dashboard at `/admin-dashboard`

2. **Platform Admin Portal** (new) - `/frontend/src/platform-admin`
   - Separate auth system using PlatformAdmin table
   - Accessed via `/platform-admin/*` routes
   - Complete isolation from restaurant operations

3. **Marketing Website** (new) - `/marketing-site` or subdomain
   - Public-facing website for KitchenSync platform
   - SEO-optimized landing pages
   - Pricing, features, demos
   - Restaurant signup flow
   - Can be deployed separately (e.g., kitchensync.com)

### Directory Structure
```
kitchen-sync/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── platform/           # New platform controllers
│   │   │   │   ├── authController.ts
│   │   │   │   ├── restaurantController.ts
│   │   │   │   ├── subscriptionController.ts
│   │   │   │   └── analyticsController.ts
│   │   │   └── ... (existing controllers)
│   │   ├── middleware/
│   │   │   ├── platformAuth.ts    # New platform auth middleware
│   │   │   └── ... (existing middleware)
│   │   ├── routes/
│   │   │   ├── platformRoutes.ts  # New platform routes
│   │   │   └── ... (existing routes)
│   │   └── services/
│   │       ├── stripeService.ts   # New Stripe integration
│   │       └── ... (existing services)
│   └── prisma/
│       └── schema.prisma          # Extended with platform models
├── frontend/
│   ├── src/
│   │   ├── platform-admin/        # New platform admin app
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── context/
│   │   │   └── PlatformApp.tsx
│   │   └── ... (existing app)
│   └── public/
└── marketing-site/                # New marketing website
    ├── pages/
    ├── components/
    └── public/
```

## Phase 1: Database Schema (Week 1)

### New Models
```prisma
// Platform administration
model PlatformAdmin {
  id                Int                 @id @default(autoincrement())
  email             String              @unique
  password          String
  name              String
  role              PlatformRole        @default(SUPPORT)
  lastLoginAt       DateTime?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  // Relations
  actions           PlatformAction[]
  supportTickets    SupportTicket[]    @relation("AssignedTickets")
  notes             RestaurantNote[]
  
  @@map("platform_admins")
}

model PlatformAction {
  id            Int            @id @default(autoincrement())
  adminId       Int
  action        String
  entityType    String?        // 'restaurant', 'subscription', etc.
  entityId      Int?
  metadata      Json?
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime       @default(now())
  
  admin         PlatformAdmin  @relation(fields: [adminId], references: [id])
  
  @@index([adminId])
  @@index([entityType, entityId])
  @@map("platform_actions")
}

// Restaurant enhancements
model Restaurant {
  // ... existing fields ...
  
  // Platform fields
  ownerEmail        String?
  ownerName         String?
  businessPhone     String?
  businessAddress   String?
  taxId             String?
  onboardingStatus  OnboardingStatus   @default(PENDING)
  onboardingSteps   Json?              @default("{}")
  verifiedAt        DateTime?
  verifiedBy        Int?
  suspendedAt       DateTime?
  suspendedReason   String?
  
  // Relations
  subscription      Subscription?
  notes             RestaurantNote[]
  documents         RestaurantDocument[]
}

// Subscription management
model Subscription {
  id                 Int                 @id @default(autoincrement())
  restaurantId       Int                 @unique
  plan               SubscriptionPlan    @default(TRIAL)
  status             SubscriptionStatus  @default(TRIAL)
  stripeCustomerId   String?             @unique
  stripeSubId        String?             @unique
  currentPeriodStart DateTime            @default(now())
  currentPeriodEnd   DateTime
  cancelAt           DateTime?
  canceledAt         DateTime?
  trialEndsAt        DateTime?
  seats              Int                 @default(5)
  
  // Billing
  billingEmail       String?
  billingName        String?
  billingAddress     Json?
  paymentMethod      Json?
  
  // Relations
  restaurant         Restaurant          @relation(fields: [restaurantId], references: [id])
  invoices           Invoice[]
  usageRecords       UsageRecord[]
  
  @@map("subscriptions")
}

model RestaurantNote {
  id            Int            @id @default(autoincrement())
  restaurantId  Int
  adminId       Int
  note          String         @db.Text
  isInternal    Boolean        @default(true)
  createdAt     DateTime       @default(now())
  
  restaurant    Restaurant     @relation(fields: [restaurantId], references: [id])
  admin         PlatformAdmin  @relation(fields: [adminId], references: [id])
  
  @@index([restaurantId])
  @@map("restaurant_notes")
}

// Enums
enum PlatformRole {
  SUPER_ADMIN
  ADMIN
  SUPPORT
  BILLING
}

enum OnboardingStatus {
  PENDING
  EMAIL_VERIFIED
  INFO_SUBMITTED
  PAYMENT_ADDED
  VERIFIED
  ACTIVE
  REJECTED
}

enum SubscriptionPlan {
  TRIAL
  STARTER      // $49/mo - 5 staff
  PROFESSIONAL // $149/mo - 20 staff
  ENTERPRISE   // Custom
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELED
  SUSPENDED
}
```

## Phase 2: Platform Backend (Week 2)

### API Endpoints
```typescript
// Platform Authentication
POST   /api/platform/auth/login
POST   /api/platform/auth/logout
GET    /api/platform/auth/me
POST   /api/platform/auth/refresh

// Restaurant Management
GET    /api/platform/restaurants
GET    /api/platform/restaurants/:id
PUT    /api/platform/restaurants/:id
POST   /api/platform/restaurants/:id/verify
POST   /api/platform/restaurants/:id/suspend
POST   /api/platform/restaurants/:id/notes
GET    /api/platform/restaurants/:id/activity

// Subscription Management
GET    /api/platform/subscriptions
GET    /api/platform/subscriptions/:id
PUT    /api/platform/subscriptions/:id
POST   /api/platform/subscriptions/:id/cancel

// Platform Analytics
GET    /api/platform/analytics/overview
GET    /api/platform/analytics/revenue
GET    /api/platform/analytics/growth
GET    /api/platform/analytics/usage

// Support
GET    /api/platform/support/tickets
POST   /api/platform/support/tickets/:id/assign
POST   /api/platform/support/impersonate/:restaurantId
```

### Platform Auth Middleware
```typescript
// backend/src/middleware/platformAuth.ts
export const platformAuth = async (req, res, next) => {
  // Separate JWT secret for platform
  // Check PlatformAdmin table
  // Set req.platformAdmin
};

export const requirePlatformRole = (roles: PlatformRole[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.platformAdmin.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

## Phase 3: Platform Admin Portal UI (Week 3)

### Key Components
1. **Dashboard**
   - Total restaurants, MRR, growth metrics
   - Recent signups needing verification
   - Support tickets queue
   - System health indicators

2. **Restaurant Management**
   - Searchable/filterable restaurant list
   - Restaurant detail view with tabs:
     - Overview (info, subscription, stats)
     - Activity log
     - Notes
     - Documents
     - Support history

3. **Subscription Management**
   - View/edit subscriptions
   - Process upgrades/downgrades
   - Handle payment failures
   - Generate invoices

4. **Onboarding Pipeline**
   - Visual pipeline of restaurants in onboarding
   - Checklist for each restaurant
   - Document verification
   - Approval/rejection workflow

5. **Support Tools**
   - Ticket management
   - Impersonation mode (with safeguards)
   - Restaurant communication
   - Knowledge base management

## Phase 4: Restaurant Registration Flow (Week 4)

### Self-Service Signup
1. **Landing Page** (marketing site)
   - Feature overview
   - Pricing plans
   - Customer testimonials
   - "Start Free Trial" CTA

2. **Registration Steps**
   ```
   Step 1: Account Creation
   - Email, password, restaurant name
   - Email verification required
   
   Step 2: Restaurant Information
   - Business details
   - Contact information
   - Restaurant type/cuisine
   
   Step 3: Choose Plan
   - Show plan comparison
   - 14-day free trial for all plans
   - No credit card for trial
   
   Step 4: Initial Setup
   - Import existing data?
   - Set opening hours
   - Add first staff member
   
   Step 5: Welcome Dashboard
   - Onboarding checklist
   - Video tutorials
   - Schedule demo option
   ```

3. **Verification Process**
   - Automatic email verification
   - Platform admin reviews business info
   - May request additional documents
   - Approval/rejection with reasons

## Phase 5: Marketing Website

### Technology Choice
- **Next.js** - For SEO and performance
- **Tailwind CSS** - For rapid development
- **Deployed separately** - Vercel or Netlify
- **Domain**: kitchensync.com (marketing)
- **App domain**: app.kitchensync.com (restaurant app)

### Key Pages
1. **Homepage**
   - Hero with value proposition
   - Feature highlights
   - Customer testimonials
   - Pricing preview
   - CTA to start trial

2. **Features**
   - Detailed feature breakdown by module
   - Screenshots and videos
   - Use case scenarios

3. **Pricing**
   - Plan comparison table
   - FAQ section
   - Annual vs monthly toggle
   - "Contact Sales" for enterprise

4. **Resources**
   - Blog (SEO content)
   - Help documentation
   - Video tutorials
   - Webinars

5. **Company**
   - About us
   - Contact
   - Careers
   - Terms & Privacy

## Implementation Timeline

### Week 1: Database & Auth
- [ ] Create platform schema migrations
- [ ] Implement PlatformAdmin model
- [ ] Build platform auth system
- [ ] Create initial platform routes

### Week 2: Core Platform APIs
- [ ] Restaurant management endpoints
- [ ] Subscription handling
- [ ] Activity logging
- [ ] Basic analytics

### Week 3: Platform Admin UI
- [ ] Platform admin React app setup
- [ ] Dashboard and navigation
- [ ] Restaurant list and details
- [ ] Basic CRUD operations

### Week 4: Registration Flow
- [ ] Public registration API
- [ ] Registration UI flow
- [ ] Email verification
- [ ] Onboarding checklist

### Week 5: Marketing Site
- [ ] Next.js setup
- [ ] Landing page
- [ ] Pricing page
- [ ] Basic SEO

### Week 6: Integration & Testing
- [ ] Stripe integration
- [ ] End-to-end testing
- [ ] Documentation
- [ ] Deployment setup

## Security Considerations

1. **Complete Isolation**
   - Platform admins use separate auth system
   - Cannot directly access restaurant data
   - All actions logged with full context

2. **Impersonation Mode**
   - Requires explicit action with reason
   - Time-limited (2 hours default)
   - Read-only by default
   - Shows banner to restaurant users
   - Full audit trail

3. **Data Access**
   - Platform sees only aggregate data
   - Individual restaurant data requires impersonation
   - Export restrictions

## Deployment Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│  Marketing Site     │     │   Restaurant App    │
│ kitchensync.com     │     │ app.kitchensync.com │
│   (Next.js)         │     │  (React + Node)     │
└──────────┬──────────┘     └──────────┬──────────┘
           │                            │
           │         ┌──────────────────┴──────────┐
           │         │      API Backend            │
           │         │  api.kitchensync.com        │
           │         │   - Restaurant APIs         │
           └─────────┤   - Platform APIs           │
                     │   - Public APIs             │
                     └──────────────┬──────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │      PostgreSQL             │
                     │   - Restaurant Data         │
                     │   - Platform Data           │
                     └─────────────────────────────┘
```

## Current Status / Progress Tracking
- [x] Comprehensive plan created
- [ ] Database schema design
- [ ] Platform auth implementation
- [ ] Restaurant registration flow
- [ ] Platform admin portal
- [ ] Marketing website

## Next Actions
1. Review and approve plan
2. Create platform schema migration
3. Set up platform auth system
4. Build first platform API endpoint

# TableFarm: Consumer Reservation Platform Architecture

## Strategic Overview

### Business Model Transformation
Transform TableFarm from a restaurant-internal tool to a consumer-facing reservation platform like OpenTable/Resy/Tock:

1. **Network Effect**: Diners have one account across all restaurants
2. **Data Ownership**: Platform owns customer relationships
3. **Revenue Streams**: 
   - Per-reservation fees from restaurants
   - Premium diner features
   - Marketing opportunities
4. **Value Proposition**:
   - For Restaurants: Access to diner network, marketing reach
   - For Diners: Discover restaurants, manage all reservations in one place

### Platform Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TableFarm Ecosystem                        │
├─────────────────────┬────────────────────┬──────────────────┤
│   TableFarm.com     │  KitchenSync.com   │ Restaurant Apps  │
│  (Consumer App)     │  (Platform Admin)  │  (Staff Portal)  │
├─────────────────────┴────────────────────┴──────────────────┤
│                    Unified Backend API                        │
├───────────────────────────────────────────────────────────────┤
│                    PostgreSQL Database                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │Platform Data│  │Diner Accounts│  │Restaurant Data   │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Database Schema Updates

### Core Platform Models

```prisma
// Diner account (across all restaurants)
model Diner {
  id                    Int                     @id @default(autoincrement())
  email                 String                  @unique
  password              String
  firstName             String?
  lastName              String?
  phone                 String?
  phoneVerified         Boolean                 @default(false)
  emailVerified         Boolean                 @default(false)
  profilePhoto          String?
  bio                   String?
  
  // Platform preferences
  emailOptIn            Boolean                 @default(true)
  smsOptIn              Boolean                 @default(false)
  marketingOptIn        Boolean                 @default(true)
  
  // Status
  isActive              Boolean                 @default(true)
  joinedAt              DateTime                @default(now())
  lastActiveAt          DateTime?
  
  // Relations
  reservations          Reservation[]
  reviews               Review[]
  favorites             FavoriteRestaurant[]
  dinerPreferences      DinerPreference[]
  loyaltyPoints         LoyaltyPoints[]
  notifications         DinerNotification[]
  savedCards            SavedPaymentMethod[]
  
  @@index([email])
  @@map("diners")
}

// Restaurant-specific diner preferences/notes
model DinerRestaurantProfile {
  dinerId               Int
  restaurantId          Int
  
  // Restaurant's notes about this diner
  internalNotes         String?
  tags                  String[]
  vipStatus             Boolean                 @default(false)
  spendingTier          SpendingTier?
  
  // Stats
  totalReservations     Int                     @default(0)
  totalSpent            Decimal?                @db.Decimal(10, 2)
  averagePartySize      Float?
  noShowCount           Int                     @default(0)
  cancellationCount     Int                     @default(0)
  
  // Preferences known by restaurant
  seatingPreferences    String?
  allergyNotes          String?
  specialOccasions      Json?
  
  firstVisit            DateTime                @default(now())
  lastVisit             DateTime?
  
  diner                 Diner                   @relation(fields: [dinerId], references: [id])
  restaurant            Restaurant              @relation(fields: [restaurantId], references: [id])
  
  @@id([dinerId, restaurantId])
  @@map("diner_restaurant_profiles")
}

// Enhanced Reservation model
model Reservation {
  id                    Int                     @id @default(autoincrement())
  
  // Diner info (platform-owned)
  dinerId               Int?                    // Registered diner
  guestEmail            String?                 // Guest without account
  guestPhone            String?
  guestName             String?
  
  // Restaurant info
  restaurantId          Int
  
  // Reservation details
  partySize             Int
  reservationDate       DateTime
  reservationTime       String
  
  // Platform features
  specialRequests       String?
  occasion              ReservationOccasion?
  dietaryRestrictions   String[]
  
  // Status
  status                ReservationStatus       @default(PENDING)
  source                ReservationSource       @default(PLATFORM_WEB)
  
  // Payment/Ticketing
  depositRequired       Boolean                 @default(false)
  depositAmount         Decimal?                @db.Decimal(10, 2)
  depositPaid           Boolean                 @default(false)
  ticketingEventId      Int?
  
  // Platform tracking
  platformFee           Decimal?                @db.Decimal(10, 2)
  confirmationCode      String                  @unique
  
  // Relations
  diner                 Diner?                  @relation(fields: [dinerId], references: [id])
  restaurant            Restaurant              @relation(fields: [restaurantId], references: [id])
  review                Review?
  
  @@index([dinerId])
  @@index([restaurantId])
  @@index([reservationDate])
  @@map("reservations")
}

// Restaurant discovery features
model FavoriteRestaurant {
  dinerId               Int
  restaurantId          Int
  addedAt               DateTime                @default(now())
  
  diner                 Diner                   @relation(fields: [dinerId], references: [id])
  restaurant            Restaurant              @relation(fields: [restaurantId], references: [id])
  
  @@id([dinerId, restaurantId])
  @@map("favorite_restaurants")
}

// Reviews (platform-owned)
model Review {
  id                    Int                     @id @default(autoincrement())
  dinerId               Int
  restaurantId          Int
  reservationId         Int                     @unique
  
  // Ratings
  overallRating         Int                     // 1-5
  foodRating            Int?
  serviceRating         Int?
  ambianceRating        Int?
  
  // Content
  reviewText            String?
  wouldRecommend        Boolean?
  
  // Platform moderation
  status                ReviewStatus            @default(PENDING)
  moderatedAt           DateTime?
  moderatedBy           Int?
  
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt
  
  // Relations
  diner                 Diner                   @relation(fields: [dinerId], references: [id])
  restaurant            Restaurant              @relation(fields: [restaurantId], references: [id])
  reservation           Reservation             @relation(fields: [reservationId], references: [id])
  
  @@index([restaurantId, status])
  @@map("reviews")
}

// Platform-wide loyalty
model LoyaltyPoints {
  id                    Int                     @id @default(autoincrement())
  dinerId               Int
  restaurantId          Int?                    // null = platform points
  
  points                Int
  reason                String
  reservationId         Int?
  
  earnedAt              DateTime                @default(now())
  expiresAt             DateTime?
  
  diner                 Diner                   @relation(fields: [dinerId], references: [id])
  restaurant            Restaurant?             @relation(fields: [restaurantId], references: [id])
  
  @@index([dinerId])
  @@map("loyalty_points")
}

// Enums
enum ReservationSource {
  PLATFORM_WEB        // TableFarm.com
  PLATFORM_APP        // TableFarm mobile app
  RESTAURANT_WIDGET   // Restaurant's website widget
  RESTAURANT_STAFF    // Staff entered
  PHONE              // Called in
  WALK_IN            // Walk-in converted
}

enum ReservationOccasion {
  BIRTHDAY
  ANNIVERSARY
  DATE_NIGHT
  BUSINESS_MEAL
  SPECIAL_CELEBRATION
  OTHER
}

enum ReviewStatus {
  PENDING
  PUBLISHED
  HIDDEN
  REMOVED
}

enum SpendingTier {
  BRONZE    // < $500/year
  SILVER    // $500-2000/year
  GOLD      // $2000-5000/year
  PLATINUM  // > $5000/year
}
```

## Platform Components

### 1. TableFarm.com (Consumer Platform)

**Technology Stack**:
- Next.js for SEO and performance
- React Native for mobile apps
- Deployed independently

**Key Features**:

1. **Discovery**
   - Search restaurants by cuisine, location, availability
   - Curated lists and recommendations
   - Reviews and ratings
   - Photos and menus

2. **Diner Account**
   - Single sign-on across all restaurants
   - Reservation history
   - Favorite restaurants
   - Dietary preferences
   - Payment methods

3. **Reservations**
   - Real-time availability
   - Book across multiple restaurants
   - Modify/cancel reservations
   - Add to calendar
   - Share with friends

4. **Loyalty & Rewards**
   - Platform-wide points system
   - Restaurant-specific rewards
   - Special access/perks
   - Referral bonuses

5. **Social Features**
   - Follow friends
   - Share dining experiences
   - Create lists
   - Event planning

### 2. Restaurant Integration

**What Restaurants Get**:
1. **Diner Insights**
   - Profile data (with privacy controls)
   - Dining history at their restaurant
   - Preferences and restrictions
   - Spending patterns

2. **Marketing Tools**
   - Targeted campaigns
   - Fill empty tables
   - Special events
   - VIP management

3. **Analytics**
   - Conversion rates
   - Diner demographics
   - Competitive insights
   - Revenue optimization

**What Restaurants Control**:
- Availability and table management
- Pricing and policies
- Internal notes and tags
- VIP designation
- House account management

**What Platform Controls**:
- Diner accounts and authentication
- Reviews and ratings
- Communication preferences
- Payment processing
- Cross-restaurant data

### 3. Revenue Model

**Restaurant Fees**:
- **Cover Fee**: $2-5 per seated diner
- **Subscription**: Monthly fee for advanced features
- **Marketing**: Promoted placement, targeted campaigns
- **Payments**: Transaction fees for deposits/prepayment

**Diner Revenue**:
- **Premium Membership**: Priority access, perks
- **Ticketed Events**: Service fees
- **Gift Cards**: Float and breakage
- **Sponsored Content**: Restaurant promotions

### 4. Data Strategy

**Platform Owns**:
- Diner accounts and preferences
- Cross-restaurant behavior
- Reviews and ratings
- Communication permissions
- Payment methods

**Restaurants Access**:
- Their own reservation data
- Diner profiles (limited by privacy)
- Internal notes and history
- Analytics for their restaurant

**Privacy Controls**:
- GDPR/CCPA compliance
- Diner consent management
- Data portability
- Right to deletion

## Implementation Approach

### Phase 1: Data Model Separation (Week 1-2)
- [ ] Migrate from `Customer` to `Diner` model
- [ ] Create platform-owned reservation system
- [ ] Separate restaurant-specific from platform data
- [ ] Build privacy controls

### Phase 2: TableFarm.com MVP (Week 3-4)
- [ ] Next.js setup with SEO
- [ ] Restaurant discovery pages
- [ ] Diner registration/login
- [ ] Basic reservation flow
- [ ] Email/SMS notifications

### Phase 3: Restaurant Integration (Week 5-6)
- [ ] Update restaurant portal for new model
- [ ] Diner profile viewing (with privacy)
- [ ] Reservation management updates
- [ ] Analytics dashboards

### Phase 4: Advanced Features (Week 7-8)
- [ ] Reviews and ratings
- [ ] Loyalty points system
- [ ] Social features
- [ ] Mobile apps

### Phase 5: Monetization (Week 9-10)
- [ ] Payment processing
- [ ] Premium memberships
- [ ] Marketing tools
- [ ] Ticketed events

## Marketing & Growth Strategy

### Launch Strategy
1. **Soft Launch**: 5-10 partner restaurants
2. **Diner Acquisition**: 
   - Import existing customer data
   - Referral incentives
   - First reservation bonuses
3. **Restaurant Acquisition**:
   - Free trial period
   - Migration assistance
   - Success stories

### Network Effects
1. **More Diners → More Value for Restaurants**
2. **More Restaurants → More Choice for Diners**
3. **More Data → Better Recommendations**
4. **More Activity → Higher Engagement**

### Competitive Advantages
1. **Full-Stack Solution**: Restaurants get entire management system
2. **Better Data**: Deep integration with restaurant operations
3. **Lower Fees**: No venture capital pressure
4. **Customization**: White-label options

## Technical Considerations

### API Structure
```
/api/public/restaurants     - Discovery API
/api/public/availability    - Real-time availability
/api/diner/*               - Diner account management
/api/reservations/*        - Reservation CRUD
/api/reviews/*             - Review system
/api/restaurant/*          - Restaurant staff APIs
/api/platform/*            - Platform admin APIs
```

### Security Model
- OAuth2 for diner authentication
- Separate tokens for diners vs staff
- Rate limiting by API key
- Data encryption at rest

### Performance
- Redis for availability caching
- CDN for restaurant assets
- Elasticsearch for discovery
- WebSockets for real-time updates

## Migration Path

### From Current State to Platform
1. **Keep existing Customer model** for backward compatibility
2. **Create new Diner model** for platform accounts
3. **Dual-write period** where both work
4. **Gradual migration** of existing customers
5. **Sunset old system** after full migration

### Restaurant Onboarding
1. Existing KitchenSync restaurants get TableFarm free
2. New restaurants get both systems together
3. Standalone TableFarm option for simple needs
4. API-only option for chains

## Success Metrics

### Platform Health
- Total diners registered
- Monthly active diners
- Reservations per month
- Cross-restaurant usage

### Restaurant Success
- Covers (seated diners)
- No-show rate
- Average check size
- Repeat diner rate

### Business Metrics
- Revenue per restaurant
- Platform fee revenue
- Diner lifetime value
- Restaurant churn rate

# Integrated Implementation Plan: Platform Admin + TableFarm

## Overview
Parallel development of Platform Admin (B2B) and TableFarm (B2C) to accelerate revenue generation and create network effects from day one.

## Phase 1: Foundation & Data Architecture (Week 1-2)

### Database Schema Migration
```bash
# Create comprehensive migration for all platform models
npx prisma migrate dev --name add_platform_architecture
```

#### Core Models to Add:
1. **Platform Models**
   - PlatformAdmin (platform management)
   - PlatformAction (audit logging)
   - Subscription (restaurant billing)

2. **Diner Models** 
   - Diner (consumer accounts - platform owned)
   - DinerRestaurantProfile (restaurant-specific data)
   - FavoriteRestaurant
   - Review
   - LoyaltyPoints

3. **Enhanced Models**
   - Restaurant (add platform fields)
   - Reservation (add platform fields, dinerId)

### Implementation Tasks:
- [x] Create Prisma schema for all new models
- [x] Generate migration scripts
- [ ] Create data migration plan for existing customers → diners
- [ ] Set up dual-write system for transition period
- [x] Create platform JWT configuration

### Backend Structure:
```
backend/src/
├── controllers/
│   ├── platform/
│   │   ├── authController.ts
│   │   ├── restaurantController.ts
│   │   └── subscriptionController.ts
│   ├── diner/
│   │   ├── authController.ts
│   │   ├── reservationController.ts
│   │   └── profileController.ts
│   └── restaurant/
│       └── dinerManagementController.ts
├── middleware/
│   ├── platformAuth.ts
│   ├── dinerAuth.ts
│   └── restaurantAuth.ts
└── services/
    ├── stripeService.ts
    └── notificationService.ts
```

## Phase 2: Dual MVP Development (Week 3-4)

### A. Platform Admin MVP
**Goal**: Basic platform to onboard and manage restaurants

#### Features:
1. **Platform Auth**
   - [x] Separate login at `/platform-admin`
   - [x] PlatformAdmin authentication
   - [x] Role-based access (SUPER_ADMIN, SUPPORT)

2. **Restaurant Management**
   - [ ] List all restaurants
   - [ ] View restaurant details
   - [ ] Onboarding workflow
   - [ ] Subscription status

3. **Basic Analytics**
   - [ ] Total restaurants
   - [ ] Monthly recurring revenue
   - [ ] New signups

## Multi-Tenancy Implementation Progress (2025-05-27)

### ✅ Phase 1: Schema Updates - COMPLETE
- Added restaurantId to Recipe, Menu, Category, Ingredient, IngredientCategory, UnitOfMeasure, PrepColumn, PrepTask models
- Created migration script that assigns existing data to the first available restaurant
- Migration successfully applied to local database

### ✅ Phase 2: Controller Updates - COMPLETE
Updated all controllers to use restaurant context:
1. **RecipeController** - Complete with restaurant context filtering
2. **MenuController** - Complete with restaurant context filtering
3. **CategoryController** - Complete with restaurant context filtering
4. **IngredientController** - Complete with restaurant context filtering
5. **IngredientCategoryController** - Complete with restaurant context filtering
6. **UnitController** - Complete with restaurant context filtering
7. **PrepTaskController** - Complete with restaurant context filtering
8. **PrepColumnController** - Complete with restaurant context filtering

### ✅ Phase 3: Routes Updates - COMPLETE
All route files updated with restaurant context middleware:
- recipeRoutes.ts
- menuRoutes.ts
- categoryRoutes.ts
- ingredientRoutes.ts
- ingredientCategoryRoutes.ts
- unitRoutes.ts
- prepTaskRoutes.ts
- prepColumnRoutes.ts

### ✅ Phase 4: Utility Files Updates - COMPLETE
Fixed TypeScript errors in utility files:
- setupRestaurantDefaults.ts - Now accepts restaurantId parameter
- restaurantOnboardingController.ts - Fixed prepColumn creation
- defaultItems.ts - Updated type definitions
- setupUserDefaults.ts - Now accepts restaurantId parameter

### ✅ Phase 5: Additional Fixes - COMPLETE
1. **TypeScript Compilation** - All errors resolved, builds successfully
2. **Reservation Controller** - Updated with restaurant filtering via restaurantStaff
3. **RestaurantSettings Controller** - Removed hardcoded restaurantId, uses context

### 🚧 Phase 6: Frontend Updates - REMAINING
1. **Restaurant Context Provider**:
   - Create a React context for current restaurant
   - Initialize on app load from user's active restaurant
   - Add restaurant selector for multi-restaurant staff

2. **API Updates**:
   - Ensure all API calls respect restaurant context
   - Update API service to include restaurant headers if needed

3. **UI Updates**:
   - Add restaurant selector in header for multi-restaurant users
   - Show current restaurant context in UI
   - Update any hardcoded restaurant references

4. **Testing**:
   - Test all features with restaurant context
   - Verify no cross-restaurant data leakage
   - Test multi-restaurant staff scenarios

### Backend Multi-Tenancy Summary
✅ **BACKEND COMPLETE** - All backend multi-tenancy work is finished:
- Database schema updated with restaurantId on all relevant models
- Migration successfully applied
- All controllers filter by restaurant context
- Restaurant context middleware properly configured
- TypeScript compilation successful
- No hardcoded restaurant IDs remain

The backend now properly enforces multi-tenant data isolation. Each restaurant's data is completely separated, and users can only access data from restaurants they're associated with through the RestaurantStaff table.

## Project Status Board
- [x] Implement Admin Dashboard backend
- [x] Create customer management API
- [x] Create staff management API
- [x] Build admin frontend structure
- [x] Implement customer list view
- [x] Add email testing infrastructure
- [x] Fix production API URL configuration
- [x] Create platform database schema
- [x] Apply platform architecture migration
- [x] Create platform auth controller
- [x] Create platform auth middleware
- [x] Create platform routes
- [x] Create first super admin account (george@seabreeze.farm)
- [x] Implement restaurant listing controller
- [x] Implement restaurant details controller
- [x] Create comprehensive restaurant management endpoints
- [x] Add restaurant analytics endpoints
- [x] Add platform analytics endpoint
- [x] Test all platform auth and restaurant endpoints
- [x] Create platform admin UI components
- [x] Build platform admin layout with navigation
- [x] Create restaurant service for API calls
- [x] Build restaurant list page with filters and pagination
- [x] Update routing structure for platform admin
- [x] Create restaurant detail page with tabs
- [x] Add restaurant verification/suspension modals
- [x] Build platform analytics dashboard with charts
- [x] Update platform dashboard with real data
- [x] Implement multi-tenancy backend (Phase 1-5 complete)
- [x] Fix multi-tenancy frontend issues with restaurant context
- [x] Create subscription database schema
- [x] Create Stripe service for payment integration
- [x] Create subscription controller with CRUD operations
- [x] Add subscription routes to platform API
- [ ] Create subscription UI components
- [ ] Build subscription list page
- [ ] Create subscription detail/edit modals
- [ ] Implement Stripe webhook handling
- [ ] Create billing portal integration
- [ ] Implement multi-tenancy frontend
- [ ] Create restaurant context provider
- [ ] Add restaurant selector UI
- [ ] Test multi-restaurant scenarios
- [ ] Complete customer detail modal
- [ ] Complete customer edit form
- [ ] Build staff management UI
- [ ] Create analytics visualizations
- [ ] Add export functionality
- [ ] Implement bulk operations
- [ ] Add customer communication features
- [ ] Create help documentation
- [ ] Create admin management pages for super admins
- [ ] Build subscription management interface
- [ ] Implement diner authentication
- [ ] Create TableFarm Next.js project

## Platform Admin Created
- Email: george@seabreeze.farm
- Name: George Page
- Role: SUPER_ADMIN
- Created: 2025-01-05

## Next Steps
1. Implement the restaurant management controllers
2. Start building the platform admin UI in React
3. Create the diner authentication system
4. Begin TableFarm consumer platform development