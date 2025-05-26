# KitchenSync Multi-Tenant Architecture Design

## Current State Analysis

Currently, KitchenSync has:
1. **Mixed User Model**: A single `User` table with both staff (restaurant employees) and customers mixed together
2. **Single Restaurant**: The system assumes one restaurant (ID: 1)
3. **Partial Customer Separation**: A separate `Customer` model was added but not fully integrated
4. **Role-based Access**: Uses `UserRole` enum (USER, ADMIN, SUPERADMIN) for staff

## Requirements for Multi-Tenancy

### Business Requirements
1. **Multiple Restaurants**: Each restaurant owner can sign up and manage their own restaurant
2. **Staff Management**: Each restaurant has its own staff (servers, kitchen, managers, owners)
3. **Customer Accounts**: Customers can have accounts across multiple restaurants
4. **Data Isolation**: Each restaurant's data must be completely isolated
5. **Platform Administration**: SUPERADMIN role manages the entire platform

### Technical Requirements
1. **Scalability**: Support hundreds or thousands of restaurants
2. **Performance**: Fast queries even with large datasets
3. **Security**: Prevent data leaks between tenants
4. **Maintainability**: Easy to add new features
5. **Migration Path**: Smooth transition from current single-tenant system

## Architecture Options

### Option 1: Shared Database with Tenant ID (Row-Level Security)
```
- Single database
- Add tenantId/restaurantId to all tables
- Filter all queries by tenantId
```

**Pros:**
- Easiest to implement initially
- Single database to maintain
- Easy cross-tenant queries for platform analytics

**Cons:**
- Risk of data leaks if filters are forgotten
- Performance degrades with scale
- Harder to backup/restore individual tenants
- Complex migrations

### Option 2: Schema-per-Tenant
```
- Single database
- Each restaurant gets its own schema (e.g., restaurant_1.*, restaurant_2.*)
- Platform data in public schema
```

**Pros:**
- Better data isolation than Option 1
- Can backup/restore individual schemas
- Easier to scale than Option 1

**Cons:**
- PostgreSQL specific (less portable)
- Complex connection management
- Schema proliferation with many tenants

### Option 3: Database-per-Tenant
```
- Separate database for each restaurant
- Platform database for shared data
- Dynamic connection routing
```

**Pros:**
- Complete data isolation
- Easy backup/restore per tenant
- Can scale databases independently
- Best performance isolation

**Cons:**
- Most complex to implement
- Higher operational overhead
- More expensive (multiple database instances)
- Complex cross-tenant queries

### Option 4: Hybrid Approach (Recommended)
```
- Shared database for small tenants
- Dedicated databases for large tenants
- Platform database for system-wide data
```

## Recommended Architecture: Enhanced Shared Database

Given KitchenSync's current state and likely scale, I recommend starting with an enhanced shared database approach:

### Database Schema Design

```prisma
// Platform-level models
model Organization {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  ownerId           String   @map("owner_id")
  plan              PlanType @default(FREE)
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  owner             User     @relation("OrganizationOwner", fields: [ownerId], references: [id])
  restaurants       Restaurant[]
  users             OrganizationUser[]
  subscription      Subscription?
}

model User {
  id                String   @id @default(cuid())
  email             String   @unique
  password          String
  firstName         String?
  lastName          String?
  role              SystemRole @default(USER)
  isActive          Boolean  @default(true)
  emailVerified     Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  ownedOrganizations Organization[] @relation("OrganizationOwner")
  organizationMemberships OrganizationUser[]
  customerProfiles  CustomerProfile[]
}

model OrganizationUser {
  organizationId    String
  userId            String
  role              OrganizationRole @default(MEMBER)
  permissions       Json?
  isActive          Boolean @default(true)
  createdAt         DateTime @default(now())
  
  // Relations
  organization      Organization @relation(fields: [organizationId], references: [id])
  user              User @relation(fields: [userId], references: [id])
  
  @@id([organizationId, userId])
}

// Restaurant-level models (tenant-specific)
model Restaurant {
  id                String   @id @default(cuid())
  organizationId    String   @map("organization_id")
  name              String
  slug              String   
  // ... other restaurant fields
  
  // Relations
  organization      Organization @relation(fields: [organizationId], references: [id])
  staff             RestaurantStaff[]
  customers         CustomerProfile[]
  menus             Menu[]
  reservations      Reservation[]
  orders            Order[]
  
  @@unique([organizationId, slug])
  @@index([organizationId])
}

model RestaurantStaff {
  restaurantId      String
  userId            String
  role              StaffRole @default(STAFF)
  permissions       Json?
  isActive          Boolean @default(true)
  createdAt         DateTime @default(now())
  
  // Relations
  restaurant        Restaurant @relation(fields: [restaurantId], references: [id])
  user              User @relation(fields: [userId], references: [id])
  
  @@id([restaurantId, userId])
  @@index([restaurantId])
  @@index([userId])
}

model CustomerProfile {
  id                String   @id @default(cuid())
  userId            String
  restaurantId      String
  // ... customer preferences
  
  // Relations
  user              User @relation(fields: [userId], references: [id])
  restaurant        Restaurant @relation(fields: [restaurantId], references: [id])
  reservations      Reservation[]
  orders            Order[]
  
  @@unique([userId, restaurantId])
  @@index([userId])
  @@index([restaurantId])
}

// Enums
enum SystemRole {
  USER        // Regular user
  PLATFORM_ADMIN // Platform administrator
}

enum OrganizationRole {
  OWNER
  ADMIN
  MEMBER
}

enum StaffRole {
  OWNER
  MANAGER
  SERVER
  KITCHEN
  HOST
}

enum PlanType {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}
```

### Access Control Layers

1. **System Level**: Platform admins manage organizations
2. **Organization Level**: Organization owners manage restaurants
3. **Restaurant Level**: Restaurant managers manage staff and operations
4. **Customer Level**: Customers interact with multiple restaurants

### Implementation Strategy

#### Phase 1: Foundation (Current)
1. Separate Customer and User models ✓
2. Add Restaurant model ✓
3. Implement basic customer portal ✓

#### Phase 2: Multi-Restaurant Support
1. Add Organization model
2. Modify Restaurant to belong to Organization
3. Update all queries to filter by restaurantId
4. Implement tenant context middleware

#### Phase 3: Enhanced Access Control
1. Replace simple roles with permission system
2. Add RestaurantStaff for granular permissions
3. Implement organization-level user management

#### Phase 4: Platform Features
1. Add subscription/billing models
2. Implement platform admin dashboard
3. Add cross-tenant analytics for platform

### Security Considerations

1. **Tenant Context**: Always set tenant context in middleware
2. **Query Scoping**: Use Prisma middleware to auto-filter queries
3. **API Security**: Validate tenant access on every request
4. **Data Validation**: Ensure IDs belong to current tenant

### Example Implementation

```typescript
// Middleware to set tenant context
export const tenantMiddleware = async (req, res, next) => {
  const user = req.user;
  const restaurantId = req.headers['x-restaurant-id'] || req.query.restaurantId;
  
  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurant ID required' });
  }
  
  // Verify user has access to this restaurant
  const hasAccess = await prisma.restaurantStaff.findFirst({
    where: {
      userId: user.id,
      restaurantId: restaurantId,
      isActive: true
    }
  });
  
  if (!hasAccess && user.role !== 'PLATFORM_ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  req.tenantId = restaurantId;
  next();
};

// Prisma middleware to auto-filter queries
prisma.$use(async (params, next) => {
  const tenantId = getCurrentTenantId();
  
  if (tenantId && isTenantModel(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        restaurantId: tenantId
      };
    }
  }
  
  return next(params);
});
```

## Migration Plan

### Step 1: Add Organization Layer
```sql
-- Add organization
INSERT INTO organizations (id, name, slug, owner_id) 
VALUES ('default', 'Default Organization', 'default', [current_superadmin_id]);

-- Link existing restaurant
UPDATE restaurants SET organization_id = 'default';
```

### Step 2: Migrate Users
```sql
-- Create OrganizationUser entries for existing staff
INSERT INTO organization_users (organization_id, user_id, role)
SELECT 'default', id, 
  CASE 
    WHEN role = 'SUPERADMIN' THEN 'OWNER'
    WHEN role = 'ADMIN' THEN 'ADMIN'
    ELSE 'MEMBER'
  END
FROM users WHERE role IN ('USER', 'ADMIN', 'SUPERADMIN');
```

### Step 3: Separate Customers
```sql
-- Already done with Customer model
-- Just need to create CustomerProfile entries
```

## Conclusion

The recommended approach provides:
- **Flexibility**: Start simple, scale as needed
- **Security**: Multiple layers of access control
- **Maintainability**: Clear separation of concerns
- **Scalability**: Can evolve to database-per-tenant if needed

This architecture supports your immediate needs while providing a clear path for growth. 