# KitchenSync Naming Conventions

## Overview
This document establishes strict naming conventions for the KitchenSync project to ensure consistency across database schema, Prisma models, TypeScript interfaces, and API endpoints.

## Database Schema (PostgreSQL)

### Table Names
- **Format**: `snake_case`
- **Plural**: Always use plural form
- **Examples**: `users`, `restaurants`, `restaurant_settings`, `content_blocks`

### Column Names
- **Format**: `snake_case`
- **Examples**: `restaurant_id`, `hero_title`, `created_at`, `is_active`

### Foreign Key Naming
- **Format**: `{referenced_table_singular}_id`
- **Examples**: `restaurant_id`, `user_id`, `menu_id`

### Index Names
- **Format**: `idx_{table}_{column(s)}`
- **Examples**: `idx_users_email`, `idx_restaurant_settings_restaurant_id`

### Constraint Names
- **Format**: `{table}_{column}_key` (unique), `{table}_{column}_fkey` (foreign key)
- **Examples**: `users_email_key`, `restaurant_settings_restaurant_id_fkey`

## Prisma Schema

### Model Names
- **Format**: `PascalCase`
- **Singular**: Always use singular form
- **Examples**: `User`, `Restaurant`, `RestaurantSettings`, `ContentBlock`

### Field Names
- **Format**: `camelCase`
- **Examples**: `restaurantId`, `heroTitle`, `createdAt`, `isActive`

### Required Mappings
- **ALL fields must have `@map` directives** when database column uses snake_case
- **Format**: `@map("database_column_name")`
- **Examples**:
  ```prisma
  restaurantId    Int      @map("restaurant_id")
  heroTitle       String?  @map("hero_title")
  createdAt       DateTime @map("created_at")
  isActive        Boolean  @map("is_active")
  ```

### Table Mappings
- **ALL models must have `@@map` directive**
- **Format**: `@@map("database_table_name")`
- **Example**: `@@map("restaurant_settings")`

## TypeScript Interfaces

### Interface Names
- **Format**: `PascalCase`
- **Descriptive**: Include purpose/context
- **Examples**: `RestaurantSettings`, `WebsiteBuilderData`, `UserCredentials`

### Property Names
- **Format**: `camelCase`
- **Match Prisma field names exactly**
- **Examples**: `restaurantId`, `heroTitle`, `createdAt`

## API Endpoints

### Route Paths
- **Format**: `kebab-case`
- **Plural for collections**: `/api/restaurants`, `/api/content-blocks`
- **Singular for single resources**: `/api/restaurant/:id`, `/api/content-block/:id`

### Query Parameters
- **Format**: `camelCase`
- **Examples**: `?restaurantId=1`, `?includeInactive=true`

### Request/Response Body Fields
- **Format**: `camelCase`
- **Match TypeScript interface properties**

## File and Directory Names

### Files
- **Format**: `camelCase` for TypeScript files
- **Format**: `kebab-case` for other files
- **Examples**: `restaurantSettings.ts`, `website-builder.css`

### Directories
- **Format**: `kebab-case`
- **Examples**: `website-builder/`, `restaurant-settings/`

## Environment Variables

### Format
- **Format**: `SCREAMING_SNAKE_CASE`
- **Prefix with context**: `DATABASE_`, `STRIPE_`, `EMAIL_`
- **Examples**: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `EMAIL_SERVICE_API_KEY`

## Validation Rules

### Prisma Schema Validation
1. **Every field with snake_case database column MUST have `@map` directive**
2. **Every model MUST have `@@map` directive**
3. **Foreign key fields MUST end with `Id` and map to `_id` columns**
4. **Boolean fields starting with `is` MUST map to `is_` columns**
5. **Timestamp fields MUST map to `_at` columns**

### TypeScript Validation
1. **Interface properties MUST match Prisma field names exactly**
2. **API service methods MUST use camelCase parameters**
3. **Database query results MUST be transformed to camelCase**

## Migration Strategy

### For Existing Code
1. **Audit all Prisma models** for missing `@map` directives
2. **Regenerate Prisma client** after adding mappings
3. **Update TypeScript interfaces** to match Prisma fields
4. **Test all database operations** after changes

### For New Development
1. **Always define database schema first** with snake_case
2. **Create Prisma model** with proper mappings
3. **Generate TypeScript interfaces** from Prisma
4. **Implement API endpoints** using camelCase

## Tools and Automation

### Pre-commit Hooks
- Validate Prisma schema has all required `@map` directives
- Check TypeScript interfaces match Prisma models
- Lint API endpoint naming

### Scripts
- `npm run schema:validate` - Check schema mappings
- `npm run schema:fix` - Auto-add missing mappings
- `npm run types:generate` - Generate TypeScript types from Prisma

## Examples

### Complete Model Example
```prisma
model RestaurantSettings {
  id                         Int              @id @default(autoincrement())
  restaurantId               Int              @unique @map("restaurant_id")
  heroTitle                  String?          @map("hero_title") @db.VarChar(255)
  heroSubtitle               String?          @map("hero_subtitle")
  isActive                   Boolean          @default(true) @map("is_active")
  createdAt                  DateTime         @default(now()) @map("created_at")
  updatedAt                  DateTime         @updatedAt @map("updated_at")
  
  restaurant                 Restaurant       @relation(fields: [restaurantId], references: [id])
  
  @@map("restaurant_settings")
}
```

### TypeScript Interface Example
```typescript
interface RestaurantSettings {
  id: number;
  restaurantId: number;
  heroTitle?: string;
  heroSubtitle?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoint Example
```typescript
// Route: PUT /api/restaurant-settings/:id
app.put('/api/restaurant-settings/:id', async (req, res) => {
  const { heroTitle, heroSubtitle } = req.body; // camelCase
  
  const result = await prisma.restaurantSettings.update({
    where: { id: parseInt(req.params.id) },
    data: { heroTitle, heroSubtitle } // Prisma handles mapping
  });
  
  res.json(result); // Returns camelCase to frontend
});
```

## Enforcement

### Code Review Checklist
- [ ] All Prisma fields have `@map` directives where needed
- [ ] All models have `@@map` directives
- [ ] TypeScript interfaces match Prisma models
- [ ] API endpoints use consistent naming
- [ ] Database migrations follow snake_case

### Automated Checks
- ESLint rules for naming conventions
- Prisma schema validation in CI/CD
- TypeScript strict mode enabled
- API endpoint testing for naming consistency

---

**This document is mandatory for all developers and AI agents working on KitchenSync. Any deviation from these conventions must be approved by the project lead and documented as an exception.** 