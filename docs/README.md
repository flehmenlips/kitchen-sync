# KitchenSync Documentation

Welcome to the comprehensive documentation for KitchenSync, a full-stack restaurant management system built with Node.js, Express, React, and TypeScript.

## Overview

KitchenSync is a multi-tenant SaaS platform that provides restaurants with tools for:
- **Recipe Management** (CookBook Module)
- **Menu Building** with visual designer
- **Reservation System** (TableFarm Module)
- **Prep Task Management** (AgileChef Module)
- **Website Builder** with custom themes
- **Customer Portal** with subdomain routing
- **Platform Administration** with analytics
- **Multi-tenant Architecture** with data isolation

## Documentation Structure

### 📚 Core Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with endpoints, authentication, request/response formats, and examples
- **[Frontend Components](./FRONTEND_COMPONENTS.md)** - React components, hooks, services, and utilities documentation
- **[Backend Services](./BACKEND_SERVICES.md)** - Server-side services, controllers, middleware, and utilities
- **[Usage Examples](./USAGE_EXAMPLES.md)** - Practical examples and developer guide for common use cases

### 🏗️ Architecture

```
KitchenSync/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Request processing
│   │   ├── routes/          # API route definitions
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript definitions
│   ├── prisma/              # Database schema and migrations
│   └── public/              # Static files
├── frontend/                # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client services
│   │   ├── context/         # React context providers
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript definitions
└── docs/                    # Documentation (this directory)
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd kitchensync

# Install dependencies for both backend and frontend
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev:all
```

### Environment Setup

Create `backend/.env.local` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/kitchensync_local"
JWT_SECRET="your-jwt-secret"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
STRIPE_SECRET_KEY="sk_test_..."
EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
```

## Key Features

### 🍳 CookBook Module
- Recipe creation and management
- Ingredient tracking with units
- Recipe scaling and yield calculations
- Photo uploads via Cloudinary
- Category and tag organization
- Recipe import/export

### 🍽️ Menu Builder
- Visual drag-and-drop menu designer
- Multiple menu layouts and themes
- Recipe linking to menu items
- Print-ready formatting
- Logo and branding customization

### 📅 TableFarm (Reservations)
- Customer reservation booking
- Staff reservation management
- Automatic email confirmations
- Time slot management
- Customer preferences tracking

### 📋 AgileChef (Prep Management)
- Kanban-style prep boards
- Task assignment and tracking
- Recipe-linked prep tasks
- Progress monitoring

### 🌐 Website Builder
- Template-based website creation
- Custom theming and branding
- Content block management
- SEO optimization
- Custom domain support

### 👥 Customer Portal
- Subdomain-based customer access
- Customer registration and authentication
- Reservation booking
- Menu viewing
- Account management

### ⚙️ Platform Administration
- Multi-restaurant management
- Subscription and billing
- Analytics and reporting
- User management
- System monitoring

## API Overview

### Authentication

KitchenSync uses dual authentication systems:

**Staff Authentication:**
```http
POST /api/users/login
Authorization: Bearer <jwt_token>
```

**Customer Authentication:**
```http
POST /api/auth/customer/login
Authorization: Bearer <customer_jwt_token>
```

### Core Endpoints

| Module | Base URL | Description |
|--------|----------|-------------|
| Recipes | `/api/recipes` | Recipe CRUD operations |
| Menus | `/api/menus` | Menu management |
| Reservations | `/api/reservations` | Staff reservation management |
| Customer Reservations | `/api/customer/reservations` | Customer booking |
| Orders | `/api/orders` | Order management |
| Content | `/api/content-blocks` | Website content |
| Platform | `/api/platform` | Admin operations |

### Example API Call

```typescript
// Create a new recipe
const response = await fetch('/api/recipes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Marinara Sauce',
    instructions: 'Heat oil, add garlic...',
    ingredients: [
      { ingredientId: 1, quantity: 2, unitId: 15 }
    ]
  })
});
```

## Frontend Architecture

### Component Structure

```
src/components/
├── common/              # Shared components
│   ├── ProtectedRoute.tsx
│   ├── ConfirmationDialog.tsx
│   └── RestaurantSelector.tsx
├── layout/              # Layout components
│   ├── MainLayout.tsx
│   ├── Sidebar.tsx
│   └── TopBar.tsx
├── recipe/              # Recipe-specific components
├── menu/                # Menu builder components
├── customer/            # Customer portal components
└── admin/               # Admin components
```

### State Management

- **React Query** for server state
- **React Context** for global application state
- **Local State** with useState for component state
- **Form State** with controlled components

### Key Hooks

```typescript
// Authentication
const { user, login, logout } = useAuth();
const { customer, login: customerLogin } = useCustomerAuth();

// Data fetching
const { recipes, isLoading } = useRecipes();
const { menus, createMenu } = useMenus();

// UI utilities
const { showSuccess, showError } = useSnackbar();
const { confirm } = useConfirmDialog();
```

## Database Schema

### Core Models

- **Restaurant** - Multi-tenant restaurant data
- **User** - Staff members
- **Customer** - Customer accounts
- **Recipe** - Recipe data with ingredients
- **Menu** - Menu structure with sections and items
- **Reservation** - Reservation bookings
- **Order** - Order management
- **ContentBlock** - Website content

### Relationships

```
Restaurant (1) → (many) Users
Restaurant (1) → (many) Customers (via CustomerRestaurant)
Restaurant (1) → (many) Recipes
Recipe (1) → (many) MenuItems
Customer (1) → (many) Reservations
```

## Multi-tenant Architecture

### Data Isolation

All data is isolated by restaurant using:
- Database-level filtering via Prisma
- Middleware-enforced restaurant context
- JWT tokens with restaurant claims

### Subdomain Routing

Customer portals are accessible via subdomains:
- `restaurant-name.kitchensync.restaurant` → Customer portal
- `kitchensync.restaurant` → Staff portal

## Development Guidelines

### Backend Best Practices

1. **Controllers** handle HTTP requests only
2. **Services** contain business logic
3. **Middleware** processes requests (auth, validation, context)
4. **Utilities** provide helper functions
5. Always validate input data
6. Use TypeScript interfaces for type safety
7. Implement proper error handling

### Frontend Best Practices

1. **Components** should be single-purpose and reusable
2. **Hooks** for data fetching and state logic
3. **Services** for API communication
4. Use TypeScript for type safety
5. Implement loading and error states
6. Follow Material-UI design system

### Security Considerations

- JWT tokens for authentication
- Input validation and sanitization
- SQL injection prevention via Prisma
- XSS protection
- Rate limiting
- CORS configuration
- Environment variable protection

## Deployment

### Environment Requirements

- Node.js 18+ runtime
- PostgreSQL database
- Cloudinary account (image storage)
- Stripe account (payments)
- Email service provider

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and approval
6. Merge to main branch

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Test coverage requirements

## Support and Resources

- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - This documentation site
- **API Reference** - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Examples** - [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Documentation Quick Links

- 🚀 **[Usage Examples](./USAGE_EXAMPLES.md)** - Start here for practical examples
- 🔌 **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- ⚛️ **[Frontend Components](./FRONTEND_COMPONENTS.md)** - React component guide
- 🛠️ **[Backend Services](./BACKEND_SERVICES.md)** - Server-side architecture

For specific questions or issues, please check the relevant documentation section above or create an issue in the repository.