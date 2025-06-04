# KitchenSync - Restaurant Management Platform
> Version 3.2.0

A comprehensive, modular restaurant management platform that streamlines kitchen operations, menu management, customer interactions, and website creation. Built for restaurants of all sizes with subscription-based feature access.

## 🚀 Latest Release (v3.2.0)

### Major Features Added:
- **Page Manager System**: Complete page management with virtual page architecture
- **Website Builder-Page Manager Synchronization**: Unified content management with real-time sync
- **Content Block Organization**: Visual content management with drag-and-drop organization
- **Virtual Page Architecture**: Production-safe page system using existing data (no database changes)
- **SEO Optimization**: Meta titles, descriptions, and keywords for all pages

## 🏗️ Platform Architecture

KitchenSync is built as a modular, subscription-based platform with multi-tenant architecture supporting unlimited restaurants. Each restaurant gets its own subdomain (restaurant.kitchensync.restaurant) with complete data isolation.

### 📊 Subscription Tiers

#### Core Modules (All Tiers)
- **Dashboard**: Restaurant overview and analytics
- **CookBook**: Recipe management and organization  
- **AgileChef**: Kitchen workflow management
- **Issue Tracker**: Problem tracking and resolution

#### Premium Modules
- **MenuBuilder** (Starter+): Professional menu creation and management
- **TableFarm** (Professional+): Advanced reservation and table management
- **ChefRail** (Professional+): Kitchen display and order management
- **Website & Marketing** (Professional+): Complete website and marketing tools

#### Pricing Structure
- **TRIAL**: 14-day free trial with full access
- **FREE**: Basic features for small operations
- **HOME**: $29/month for home-based food businesses
- **STARTER**: $79/month with MenuBuilder access
- **PROFESSIONAL**: $149/month with all modules
- **ENTERPRISE**: $199/month with advanced features and support

## 🌟 Module Overview

### 1. **CookBook** (Recipe Management System)
- Create, store, and manage recipes with ingredients and instructions
- Categorize recipes for easy organization
- Calculate recipe yields and scaling
- Track prep and cook times
- Photo upload support via Cloudinary

### 2. **AgileChef** (Kitchen Prep Management)
- Kanban-style prep task management
- Drag-and-drop task organization
- Real-time kitchen workflow tracking
- Customizable prep columns

### 3. **MenuBuilder** (Menu Design & Management)
- Create multiple menus (lunch, dinner, seasonal)
- Drag-and-drop menu item ordering
- Link recipes directly to menu items
- Rich text formatting and styling options
- Real-time menu preview
- PDF export functionality

### 4. **TableFarm** (Front-of-House Operations)
- Reservation calendar system
- Order entry and management
- Table management
- Customer database with separate authentication

### 5. **Website & Marketing** (Website Builder & Page Manager)
- **Website Builder**: Visual drag-and-drop website creation
- **Page Manager**: Complete page management with virtual page architecture
- **Template System**: Professional templates including Fine Dining designs
- **Content Management**: Unified content management across all systems
- **SEO Tools**: Meta optimization and search engine visibility
- **Theme Customization**: Complete branding control with colors, fonts, and layouts

### 6. **ChefRail** (Kitchen Display System)
- Real-time order display (Coming Soon)
- Kitchen communication
- Order tracking and timing

## 🌐 Multi-Tenant Customer Portals

Each restaurant gets a professional customer portal at `restaurant.kitchensync.restaurant` featuring:
- **Clean URLs**: Professional URLs without `/customer` prefix
- **Branded Experience**: Complete restaurant branding and customization
- **Dynamic Content**: Content managed through Website Builder and Page Manager
- **Mobile Optimized**: Responsive design for all devices
- **SEO Optimized**: Search engine friendly with meta optimization

### Customer Portal Features
- Restaurant information and branding
- Online menu viewing
- Reservation system
- Contact information and hours
- Dynamic content blocks
- Professional template designs

## 🛠️ Tech Stack

### Backend
- Node.js + TypeScript
- Express.js 4.x (for stability)
- PostgreSQL with Prisma ORM
- Multi-tenant architecture with data isolation
- JWT Authentication with role-based access
- Cloudinary for image management
- Stripe integration for payments

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) component library
- React Router v6 with subdomain routing
- React Query for data fetching
- Vite for build tooling
- Context-based restaurant management

## 📦 Installation & Development

### Prerequisites
- Node.js 20+ (required for both backend and frontend)
- PostgreSQL database
- Cloudinary account for image management

### Quick Start
```bash
# Clone and install
git clone https://github.com/yourusername/kitchen-sync.git
cd kitchen-sync
npm run install:all

# Set up environment variables (see Environment Setup below)

# Run database migrations
npm run db:migrate

# Start development servers (ALWAYS use these commands from project root)
npm run dev:all        # Start both backend and frontend
npm run backend        # Start backend only (LOCAL database)
npm run frontend       # Start frontend only
```

### ⚠️ Important Development Commands
**ALWAYS run commands from the project root directory:**
- `npm run backend` - Start backend with LOCAL database (safe for development)
- `npm run frontend` - Start frontend dev server
- `npm run dev:all` - Start both backend and frontend
- `npm run db:studio` - Open Prisma Studio
- `npm run db:check` - Check multi-tenant status

**NEVER run `npm run dev` in the backend directory** (it uses PRODUCTION database)

### Environment Setup

#### Backend (.env.local for development)
```bash
DATABASE_URL="your-local-postgresql-url"
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@yourrestaurant.com"
FRONTEND_URL="http://localhost:5173"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"
```

#### Frontend (.env)
```bash
VITE_API_URL="http://localhost:3001/api"
VITE_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
```

## 🚀 Deployment

### Production Environment
- **Backend**: Deployed on Render.com with PostgreSQL
- **Frontend**: Static site deployment with automatic builds
- **DNS**: Wildcard subdomain configuration (*.kitchensync.restaurant)
- **Payments**: Stripe integration for subscription management

### Database Safety
- `backend/.env.local` = LOCAL database (safe to use)
- `backend/.env` = PRODUCTION database (dangerous - do not use for development)
- All root-level npm scripts automatically use the LOCAL database

## 👥 User Management

### Staff Roles
- **SuperAdmin**: Full system access, platform administration
- **Admin**: Restaurant management, settings, and admin dashboard
- **User**: Staff members with kitchen and menu management access

### Customer System
- **Separate Authentication**: Customers have their own authentication system
- **Multi-Restaurant Support**: Customers can belong to multiple restaurants
- **Guest Options**: Reservations available without account creation

## 🔒 Security & Architecture

### Multi-Tenant Security
- Complete data isolation between restaurants
- Restaurant context throughout the application
- Secure subdomain routing
- Role-based access control

### Payment Security
- PCI compliance through Stripe integration
- No sensitive payment data stored locally
- Webhook signature verification
- Secure subscription management

## 📊 Current Status (v3.2.0)

### ✅ Completed Features
- Multi-tenant platform architecture
- Subscription-based module system
- Website Builder with template system
- Page Manager with virtual page architecture
- Clean restaurant URLs
- Content management synchronization
- Stripe payment integration
- Customer portal system

### 🔄 In Development
- Advanced analytics dashboard
- Mobile app for restaurant management
- Third-party integrations (POS systems)
- Advanced marketing automation

## 📄 Documentation

- **Release Notes**: Individual release notes for each version (v2.10.0 - v3.2.0)
- **API Documentation**: Comprehensive API documentation in `/docs`
- **Development Guide**: Setup and development instructions
- **Deployment Guide**: Production deployment instructions

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure TypeScript compilation passes
5. Submit a pull request

For detailed development guidelines, see the development documentation in `/docs`. 