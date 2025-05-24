# KitchenSync User Roles & Architecture

## Implementation Strategy - Updated

### MVP Phase: Single Restaurant Focus
For the initial release, KitchenSync will operate as a single-restaurant system. This simplifies development, deployment, and testing while providing a complete solution for one restaurant operation.

#### Single Restaurant MVP Features:
1. **Customer Portal**: Public-facing reservation system for one restaurant
2. **Restaurant Portal**: Full management system for restaurant staff
3. **Simplified Architecture**: No restaurant selection or multi-tenant complexity
4. **Faster Time to Market**: Focus on core functionality without multi-tenant overhead

#### Future Phase: Multi-Restaurant Support
Once the single-restaurant system is proven and stable, we will add:
- Restaurant registration and onboarding
- Multi-tenant data isolation
- Restaurant discovery for customers
- Cross-restaurant analytics for chain operations

## User Types & Access Levels

### 1. **Customer (Public User)**
- **Access**: Customer Portal Only
- **Modules**: TableFarm (Customer View)
- **Features**:
  - Browse restaurant listings
  - Make reservations
  - View/modify their own reservations
  - Manage their profile
  - View order history
  - NO access to any restaurant management features

### 2. **Restaurant Staff - Front of House (FOH)**
- **Access**: Restaurant Portal - FOH View
- **Modules**: TableFarm (Restaurant View), Limited MenuBuilder (View Only)
- **Features**:
  - Manage all reservations
  - Create walk-in orders
  - View and update order status
  - Access customer information
  - View current menu (read-only)

### 3. **Restaurant Staff - Back of House (BOH)**
- **Access**: Restaurant Portal - BOH View
- **Modules**: ChefRail, AgileChef, CookBook (View Only)
- **Features**:
  - View incoming orders (ChefRail)
  - Update order item status
  - Access prep board (AgileChef)
  - View recipes (read-only)
  - NO access to customer data

### 4. **Restaurant Manager/Chef**
- **Access**: Restaurant Portal - Manager View
- **Modules**: All except SuperAdmin features
- **Features**:
  - Full CookBook access (create/edit recipes)
  - Full AgileChef access (manage prep workflow)
  - Full MenuBuilder access (design menus)
  - View TableFarm analytics
  - Limited ChefRail admin (assign stations)

### 5. **Restaurant Owner/Admin**
- **Access**: Restaurant Portal - Admin View
- **Modules**: All modules for their restaurant(s)
- **Features**:
  - All Manager features
  - User management for their restaurant
  - Financial reports
  - Multi-location management (if applicable)
  - System settings

### 6. **SuperAdmin**
- **Access**: System Admin Portal
- **Modules**: All modules + System Administration
- **Features**:
  - Manage all restaurants
  - System-wide user management
  - Platform analytics
  - Billing management
  - System configuration

## Portal Architecture

```
KitchenSync Platform
├── Customer Portal (customer.kitchensync.com)
│   ├── Public Landing Page
│   ├── Restaurant Discovery
│   ├── Reservation System
│   ├── Customer Account Management
│   └── Order History
│
├── Restaurant Portal (app.kitchensync.com)
│   ├── Role-Based Dashboard
│   ├── CookBook Module
│   ├── AgileChef Module
│   ├── MenuBuilder Module
│   ├── TableFarm Module (Restaurant View)
│   ├── ChefRail Module
│   └── Restaurant Settings
│
└── Admin Portal (admin.kitchensync.com)
    ├── Platform Analytics
    ├── Restaurant Management
    ├── User Management
    ├── Billing System
    └── System Configuration
```

## Module Interaction Flow

### Customer Journey
```
Customer → Customer Portal → Browse Restaurants → Make Reservation → Receive Confirmation
                                                 ↓
                                           View/Manage Bookings
```

### Restaurant Order Flow
```
Customer Reservation → TableFarm → Create Order → ChefRail → Kitchen Display
                          ↓                           ↑
                    FOH Staff View              Status Updates
```

### Recipe to Menu Flow
```
CookBook → Recipe Created → MenuBuilder → Menu Published → TableFarm → Customer Views Menu
             ↓
        AgileChef → Prep Tasks Generated
```

## Security & Data Isolation

### Customer Data Access
- Customers can only see their own data
- Restaurant staff can see customer data for their restaurant only
- Customer PII is protected and access is logged

### Restaurant Data Isolation
- Each restaurant's data is completely isolated
- Staff can only access their assigned restaurant(s)
- Cross-restaurant data sharing requires explicit permission

### Module Access Control
- Role-based permissions at the module level
- Feature-level permissions within modules
- API endpoints check user role and restaurant association

## Implementation Strategy

### 1. Frontend Routing
```typescript
// Customer Portal Routes
/customer/*
  /customer/restaurants
  /customer/reservations/new
  /customer/reservations
  /customer/account

// Restaurant Portal Routes
/restaurant/*
  /restaurant/dashboard
  /restaurant/cookbook
  /restaurant/agilechef
  /restaurant/menubuilder
  /restaurant/tablefarm
  /restaurant/chefrail

// Admin Portal Routes
/admin/*
  /admin/dashboard
  /admin/restaurants
  /admin/users
  /admin/billing
```

### 2. API Segregation
- Separate API endpoints for customer vs restaurant operations
- Different authentication tokens with role information
- Middleware to check portal access rights

### 3. UI/UX Differentiation
- Customer Portal: Clean, minimal, consumer-friendly
- Restaurant Portal: Functional, data-rich, efficient
- Admin Portal: Comprehensive, analytical, powerful 