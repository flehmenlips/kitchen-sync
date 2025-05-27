# Platform Admin Migration Plan

## Current State
- Production has 7 restaurants with integer IDs (1-7)
- Platform admin tables do NOT exist in production yet
- Frontend platform admin UI exists but backend is missing

## Migration Strategy

### Phase 1: Deploy Platform Admin Tables
1. Create platform admin tables in production
2. Create initial platform admin user(s)
3. Link existing restaurants to platform

### Phase 2: Security Enhancement (Future)
- Consider migrating to UUIDs for restaurant IDs
- This would be a major breaking change requiring careful planning

### Phase 3: Platform Admin Features
- Restaurant CRUD operations
- Subscription management
- Usage tracking and billing
- Support ticket system

## Immediate Actions Needed

### 1. Create Platform Admin Migration SQL
```sql
-- Create platform admin tables
CREATE TABLE IF NOT EXISTS platform_admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_actions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES platform_admins(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL DEFAULT 'TRIAL',
  status VARCHAR(50) NOT NULL DEFAULT 'TRIAL',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_ends_at TIMESTAMP,
  seats INTEGER DEFAULT 5,
  monthly_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usage_records (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  metric VARCHAR(50) NOT NULL,
  value INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurant_notes (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  admin_id INTEGER NOT NULL REFERENCES platform_admins(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  assigned_to INTEGER REFERENCES platform_admins(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL,
  sender_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Create Initial Platform Admin
- Create first platform admin user with SUPERADMIN role
- This will allow management of all restaurants

### 3. Initialize Subscriptions
- Create subscription records for all existing restaurants
- Set them all to TRIAL initially
- Can be updated later with actual subscription data

## Security Considerations

### Current Integer ID Vulnerabilities:
- Sequential IDs are predictable (restaurant 1, 2, 3...)
- Could allow enumeration attacks
- Easy to guess other restaurant IDs

### UUID Migration (Future Enhancement):
**Pros:**
- Non-sequential, unpredictable
- More secure against enumeration
- Industry standard for public-facing IDs

**Cons:**
- Major breaking change
- Would require updating all foreign keys
- More complex migration process

### Recommendation:
1. Proceed with current integer IDs for now
2. Use proper authorization checks (already implemented)
3. Plan UUID migration as a future major version update
4. For now, ensure all endpoints verify restaurant access

## Platform Admin Features to Implement

### Essential CRUD Operations:
1. **Restaurant Management**
   - View all restaurants
   - Edit restaurant details
   - Activate/deactivate restaurants
   - View restaurant statistics

2. **User Management**
   - View restaurant staff
   - Reset passwords
   - Manage roles

3. **Subscription Management**
   - View/edit subscriptions
   - Process payments
   - Handle upgrades/downgrades

4. **Platform Monitoring**
   - Usage statistics
   - Revenue tracking
   - System health

### Safety Measures for CRUD:
- Require confirmation for destructive actions
- Log all platform admin actions
- Implement soft deletes where appropriate
- Regular backups before major operations 