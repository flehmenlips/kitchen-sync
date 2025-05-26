# Customer-User Separation Plan

## Executive Summary
Separate restaurant customers from KitchenSync users into distinct database entities to improve security, clarity, and scalability.

## Current State
- Single `users` table with `isCustomer` boolean flag
- `customer_profiles` table for additional customer data
- Mixed authentication logic with conditional checks
- Conceptual confusion between system users and restaurant patrons

## Proposed Architecture

### Database Schema

```sql
-- Remove customer-related fields from users table
ALTER TABLE users DROP COLUMN is_customer;

-- Create dedicated customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL DEFAULT 1, -- For future multi-tenant support
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customers_email (email),
  INDEX idx_customers_restaurant (restaurant_id)
);

-- Create customer preferences table (replaces customer_profiles)
CREATE TABLE customer_preferences (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  dietary_restrictions TEXT,
  seating_preferences TEXT,
  special_occasions JSONB, -- Store birthdays, anniversaries
  marketing_opt_in BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update relationships
ALTER TABLE reservations 
  DROP CONSTRAINT fk_reservation_customer,
  ADD COLUMN customer_id INTEGER REFERENCES customers(id),
  ADD COLUMN guest_name VARCHAR(255), -- For walk-ins without accounts
  ADD COLUMN guest_email VARCHAR(255),
  ADD COLUMN guest_phone VARCHAR(50);

ALTER TABLE orders
  DROP CONSTRAINT fk_order_customer,
  ADD COLUMN customer_id INTEGER REFERENCES customers(id),
  ADD COLUMN guest_name VARCHAR(255);

-- Create customer sessions table
CREATE TABLE customer_sessions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer_sessions_token (token)
);

-- Migrate existing customer data
INSERT INTO customers (email, password, first_name, last_name, phone, email_verified, created_at, updated_at)
SELECT u.email, u.password, u.name as first_name, '' as last_name, cp.phone, cp.email_verified, u.created_at, u.updated_at
FROM users u
JOIN customer_profiles cp ON u.id = cp.user_id
WHERE u.is_customer = true;

-- Update foreign keys
UPDATE reservations r
SET customer_id = (
  SELECT c.id FROM customers c 
  JOIN users u ON u.email = c.email 
  WHERE u.id = r.customer_id AND u.is_customer = true
);

UPDATE orders o
SET customer_id = (
  SELECT c.id FROM customers c 
  JOIN users u ON u.email = c.email 
  WHERE u.id = o.customer_id AND u.is_customer = true
);
```

### API Structure

```
/api/auth/
  /login          - Staff login
  /logout         - Staff logout
  /register       - Staff registration (admin only)
  
/api/auth/customer/
  /login          - Customer login
  /logout         - Customer logout  
  /register       - Customer self-registration
  /verify-email   - Email verification
  /reset-password - Password reset
  
/api/admin/        - Staff-only endpoints
  /users          - Manage staff users
  /customers      - View/manage customers
  
/api/customer/     - Customer-only endpoints
  /profile        - Customer profile
  /reservations   - Customer's reservations
  /orders         - Customer's order history
  
/api/public/       - No auth required
  /menu           - View menus
  /availability   - Check reservation availability
```

### Benefits

1. **Clear Separation of Concerns**
   - Staff users manage the restaurant
   - Customers interact with the restaurant
   - No conceptual mixing

2. **Enhanced Security**
   - Completely separate authentication flows
   - No shared tables or permissions
   - Impossible for customers to gain staff privileges

3. **Simplified Logic**
   - No more `isCustomer` checks everywhere
   - Cleaner middleware and auth logic
   - Easier to understand and maintain

4. **Future-Ready**
   - Customers belong to restaurants
   - Easy to add multi-restaurant support
   - Can have different customer features per restaurant

5. **Better Data Modeling**
   - Customers don't need "roles"
   - Can optimize each table for its purpose
   - Cleaner relationships

## Implementation Plan

### Phase 1: Backend Infrastructure (Week 1)
1. Create new customer models in Prisma
2. Create customer auth controllers
3. Create customer-specific middleware
4. Create migration scripts
5. Test with new customer accounts

### Phase 2: Frontend Updates (Week 2)
1. Create new customer auth service
2. Update CustomerAuthContext to use new endpoints
3. Update customer registration/login forms
4. Update customer dashboard
5. Test customer flows

### Phase 3: Data Migration (Week 3)
1. Create backup of production database
2. Test migration scripts on staging
3. Run migration in production
4. Verify all customers can still login
5. Monitor for issues

### Phase 4: Cleanup (Week 4)
1. Remove `isCustomer` flag from users
2. Remove old customer_profiles table
3. Remove mixed auth logic
4. Update all documentation
5. Final testing

## Migration Script

```typescript
// backend/scripts/migrate-customers.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCustomers() {
  console.log('Starting customer migration...');
  
  // Get all customer users
  const customerUsers = await prisma.user.findMany({
    where: { isCustomer: true },
    include: { customerProfile: true }
  });
  
  console.log(`Found ${customerUsers.length} customers to migrate`);
  
  for (const user of customerUsers) {
    try {
      // Create customer record
      const customer = await prisma.customer.create({
        data: {
          email: user.email,
          password: user.password,
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          phone: user.customerProfile?.phone,
          emailVerified: user.customerProfile?.emailVerified || false,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
      
      // Update reservations
      await prisma.reservation.updateMany({
        where: { customerId: user.id },
        data: { customerId: customer.id }
      });
      
      // Update orders
      await prisma.order.updateMany({
        where: { customerId: user.id },
        data: { customerId: customer.id }
      });
      
      console.log(`Migrated customer: ${user.email}`);
    } catch (error) {
      console.error(`Failed to migrate customer ${user.email}:`, error);
    }
  }
  
  console.log('Migration complete!');
}

migrateCustomers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Rollback Plan

If issues arise:
1. Keep old user records with `isCustomer` flag
2. Add fallback logic to check both tables
3. Gradually migrate over time
4. Can revert foreign keys if needed

## Success Metrics

1. All existing customers can login
2. No lost reservations or orders
3. Cleaner codebase with less conditional logic
4. Improved security boundaries
5. Easier to add new customer features

## Long-term Vision

With separated customers:
- Add customer loyalty programs
- Restaurant-specific customer features
- Customer analytics per restaurant
- Multi-restaurant customer accounts
- Guest checkout without accounts 