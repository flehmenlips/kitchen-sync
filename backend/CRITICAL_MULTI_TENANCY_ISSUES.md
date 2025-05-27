# Critical Multi-Tenancy Issues in KitchenSync

## Executive Summary
The KitchenSync platform has critical architectural flaws in its multi-tenancy implementation that cause data leakage across restaurants. These issues require immediate schema changes and data migration.

## Critical Issues Found

### 1. Missing Restaurant Association in Core Models
The following models lack `restaurantId` fields, making them user-scoped instead of restaurant-scoped:

- **Recipe** - Only has `userId`, not `restaurantId`
- **Menu** - Only has `userId`, not `restaurantId`
- **Category** - Only has `userId`, not `restaurantId`
- **Ingredient** - Only has `userId`, not `restaurantId`
- **UnitOfMeasure** - Only has `userId`, not `restaurantId`
- **PrepColumn** - Only has `userId`, not `restaurantId`
- **PrepTask** - Only has `userId`, not `restaurantId`

This means:
- A user working at multiple restaurants sees ALL their recipes/menus across ALL restaurants
- Data created at one restaurant appears at another restaurant
- No proper data isolation between restaurants

### 2. SUPERADMIN Role Misuse
- New restaurant owners were being created as SUPERADMIN
- SUPERADMIN role was intended for platform administrators only
- This has been fixed by converting restaurant owners to ADMIN role

### 3. Hardcoded Restaurant IDs
- Restaurant settings controller was hardcoded to `restaurantId = 1`
- All restaurants were seeing/editing the same settings
- This has been fixed with restaurant context middleware

## Impact

### Security Impact
- **Data Leakage**: Recipes, menus, and ingredients from one restaurant visible at others
- **Privacy Violation**: Competitor restaurants could see each other's data
- **Compliance Risk**: Violates data isolation requirements

### Business Impact
- **Customer Trust**: Restaurants expect their data to be private
- **Legal Risk**: Potential lawsuits from data exposure
- **Platform Integrity**: Cannot operate as a true multi-tenant SaaS

## Required Schema Changes

### 1. Add restaurantId to Core Models
```prisma
model Recipe {
  // ... existing fields ...
  restaurantId Int @map("restaurant_id")
  restaurant Restaurant @relation(fields: [restaurantId], references: [id])
  
  @@index([restaurantId])
}

model Menu {
  // ... existing fields ...
  restaurantId Int @map("restaurant_id")
  restaurant Restaurant @relation(fields: [restaurantId], references: [id])
  
  @@index([restaurantId])
}

// Similar changes for Category, Ingredient, UnitOfMeasure, PrepColumn, PrepTask
```

### 2. Data Migration Required
1. For each model, determine restaurant association:
   - Find user's restaurant via RestaurantStaff table
   - If user has multiple restaurants, need business logic to assign
   - May need to duplicate shared resources

### 3. Update All Queries
Every query needs to filter by restaurantId:
```typescript
// Before (WRONG - shows all user's recipes across all restaurants)
const recipes = await prisma.recipe.findMany({
  where: { userId: req.user.id }
});

// After (CORRECT - shows only current restaurant's recipes)
const recipes = await prisma.recipe.findMany({
  where: { restaurantId: req.restaurantId }
});
```

## Temporary Mitigation (Implemented)

1. **Restaurant Context Middleware**: Added to track current restaurant
2. **Role Conversion**: Changed SUPERADMIN users to ADMIN
3. **UI Restaurant Selector**: Added to show current restaurant context
4. **Fixed Hardcoded IDs**: Restaurant settings now use context

**However, these mitigations do NOT fix the core issue of missing restaurantId fields.**

## Action Plan

### Phase 1: Immediate (Before ANY Production Use)
1. Create schema migration to add restaurantId to all affected models
2. Create data migration scripts to assign existing data to restaurants
3. Update all controllers to filter by restaurantId
4. Comprehensive testing of data isolation

### Phase 2: Code Updates
1. Update all recipe controllers
2. Update all menu controllers  
3. Update all ingredient/category/unit controllers
4. Update all prep board controllers
5. Add restaurantId validation to all create/update operations

### Phase 3: Testing & Validation
1. Create multi-restaurant test scenarios
2. Verify complete data isolation
3. Security audit of all endpoints
4. Performance testing with restaurant filters

## Production Migration Considerations

**DO NOT DEPLOY TO PRODUCTION WITHOUT FIXING THESE ISSUES**

The production migration plan needs to be updated to:
1. Add restaurantId fields to all affected tables
2. Populate restaurantId based on user-restaurant associations
3. Handle edge cases (users with multiple restaurants)
4. Add foreign key constraints
5. Update all application queries

## Conclusion

The current system has fundamental architectural flaws that prevent proper multi-tenant operation. While we've implemented some mitigations, the core issue of missing restaurant associations in key models must be fixed before this system can be used in production.

**Severity: CRITICAL**
**Priority: P0 - Must fix before production** 