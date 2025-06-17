# Website Builder Data Architecture Migration Plan

## Background and Motivation

After comprehensive analysis of the three main data tables (Restaurant, RestaurantSettings, ContentBlocks), we've identified significant data redundancy and unclear ownership boundaries. This migration plan establishes a clear data hierarchy and eliminates conflicts between the dual data systems.

## Revised Data Hierarchy

```
Restaurant (Source of Truth - Business Data)
├── Immutable Business Information
│   ├── name
│   ├── address, city, state, zipCode, country
│   ├── phone, email
│   ├── owner information (ownerName, ownerEmail)
│   ├── business registration (taxId, businessPhone, businessAddress)
│   └── platform management (onboardingStatus, verifiedAt, etc.)
│
├── RestaurantSettings (Website Configuration & Display)
│   ├── Template settings (templateId, customCss)
│   ├── Styling (colors, fonts, navigation)
│   ├── Meta information (metaTitle, metaDescription)
│   ├── Optional Display Overrides
│   │   ├── openingHours (moved from Restaurant)
│   │   ├── displayPhone, displayEmail, displayAddress
│   │   └── websiteName (can override restaurant.name)
│   └── Website behavior settings
│
└── ContentBlocks (Website Content)
    ├── Page-specific content (hero, about, etc.)
    ├── Modular content blocks
    ├── Images and media
    └── Custom content sections
```

## Key Architectural Decisions

1. **Business Data (Restaurant table)**
   - Contains only essential business information required for platform operation
   - Editable only by SUPER_ADMIN or through dedicated business settings
   - Serves as fallback data source for website display

2. **Website Configuration (RestaurantSettings)**
   - Restaurant owner has full control
   - Can override business data for website display
   - Contains all website-specific settings and preferences
   - **openingHours moved here** - optional and customizable

3. **Website Content (ContentBlocks)**
   - Fully managed by restaurant owner through Website Builder
   - Modular and flexible content management
   - Version-controlled and publishable

## Migration Plan - Phase 1: Schema Updates

### Step 1.1: Update Restaurant Table
```sql
-- Remove website-specific fields from Restaurant table
ALTER TABLE restaurants 
DROP COLUMN IF EXISTS opening_hours,
ADD COLUMN website_status VARCHAR(20) DEFAULT 'DRAFT',
ADD COLUMN last_website_update TIMESTAMP,
ADD COLUMN website_builder_enabled BOOLEAN DEFAULT false;

-- Add enum for website status
CREATE TYPE website_status_enum AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
ALTER TABLE restaurants ALTER COLUMN website_status TYPE website_status_enum USING website_status::website_status_enum;
```

### Step 1.2: Update RestaurantSettings Table
```sql
-- Add new fields for data management
ALTER TABLE restaurant_settings
ADD COLUMN opening_hours JSON,
ADD COLUMN use_business_contact_info BOOLEAN DEFAULT true,
ADD COLUMN custom_contact_overrides JSON DEFAULT '{}',
ADD COLUMN website_version INTEGER DEFAULT 1,
ADD COLUMN published_at TIMESTAMP,
ADD COLUMN last_modified_by INTEGER REFERENCES users(id);

-- Add indexes for performance
CREATE INDEX idx_restaurant_settings_published_at ON restaurant_settings(published_at);
CREATE INDEX idx_restaurant_settings_version ON restaurant_settings(website_version);
```

### Step 1.3: Update ContentBlocks Table
```sql
-- Add versioning and publishing fields
ALTER TABLE content_blocks
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN is_published BOOLEAN DEFAULT false,
ADD COLUMN published_at TIMESTAMP,
ADD COLUMN last_modified_by INTEGER REFERENCES users(id);

-- Add indexes
CREATE INDEX idx_content_blocks_version ON content_blocks(version);
CREATE INDEX idx_content_blocks_published ON content_blocks(is_published);
CREATE INDEX idx_content_blocks_published_at ON content_blocks(published_at);
```

## Migration Plan - Phase 2: Data Migration

### Step 2.1: Migrate Opening Hours
```sql
-- Move opening_hours from restaurants to restaurant_settings
UPDATE restaurant_settings 
SET opening_hours = r.opening_hours
FROM restaurants r 
WHERE restaurant_settings.restaurant_id = r.id 
AND r.opening_hours IS NOT NULL;

-- Verify migration
SELECT 
  rs.restaurant_id,
  r.name,
  rs.opening_hours IS NOT NULL as has_hours_in_settings,
  r.opening_hours IS NOT NULL as has_hours_in_restaurant
FROM restaurant_settings rs
JOIN restaurants r ON rs.restaurant_id = r.id;
```

### Step 2.2: Migrate Website Content to ContentBlocks
```sql
-- Create migration script to move hero content
INSERT INTO content_blocks (restaurant_id, page, block_type, title, subtitle, content, image_url, image_public_id, button_text, button_link, display_order, is_active)
SELECT 
  restaurant_id,
  'home' as page,
  'hero' as block_type,
  hero_title as title,
  hero_subtitle as subtitle,
  NULL as content,
  hero_image_url as image_url,
  hero_image_public_id as image_public_id,
  hero_cta_text as button_text,
  hero_cta_link as button_link,
  1 as display_order,
  true as is_active
FROM restaurant_settings 
WHERE hero_title IS NOT NULL OR hero_subtitle IS NOT NULL
ON CONFLICT DO NOTHING;

-- Create migration script to move about content
INSERT INTO content_blocks (restaurant_id, page, block_type, title, content, image_url, image_public_id, display_order, is_active)
SELECT 
  restaurant_id,
  'home' as page,
  'about' as block_type,
  about_title as title,
  about_description as content,
  about_image_url as image_url,
  about_image_public_id as image_public_id,
  2 as display_order,
  true as is_active
FROM restaurant_settings 
WHERE about_title IS NOT NULL OR about_description IS NOT NULL
ON CONFLICT DO NOTHING;
```

### Step 2.3: Clean Up RestaurantSettings
```sql
-- Remove migrated content fields (keep configuration fields)
ALTER TABLE restaurant_settings
DROP COLUMN IF EXISTS hero_title,
DROP COLUMN IF EXISTS hero_subtitle,
DROP COLUMN IF EXISTS hero_image_url,
DROP COLUMN IF EXISTS hero_image_public_id,
DROP COLUMN IF EXISTS hero_cta_text,
DROP COLUMN IF EXISTS hero_cta_link,
DROP COLUMN IF EXISTS about_title,
DROP COLUMN IF EXISTS about_description,
DROP COLUMN IF EXISTS about_image_url,
DROP COLUMN IF EXISTS about_image_public_id;
```

## Migration Plan - Phase 3: Backend Updates

### Step 3.1: Update Prisma Schema
```prisma
model Restaurant {
  // Remove opening_hours
  // Add new fields
  websiteStatus        WebsiteStatus?  @default(DRAFT) @map("website_status")
  lastWebsiteUpdate    DateTime?       @map("last_website_update")
  websiteBuilderEnabled Boolean        @default(false) @map("website_builder_enabled")
}

model RestaurantSettings {
  // Add new fields
  openingHours           Json?     @map("opening_hours")
  useBusinessContactInfo Boolean   @default(true) @map("use_business_contact_info")
  customContactOverrides Json?     @default("{}") @map("custom_contact_overrides")
  websiteVersion         Int       @default(1) @map("website_version")
  publishedAt           DateTime? @map("published_at")
  lastModifiedBy        Int?      @map("last_modified_by")
  
  // Remove content fields (moved to ContentBlocks)
  // heroTitle, heroSubtitle, etc.
}

model ContentBlock {
  // Add new fields
  version        Int       @default(1)
  isPublished    Boolean   @default(false) @map("is_published")
  publishedAt    DateTime? @map("published_at")
  lastModifiedBy Int?      @map("last_modified_by")
}

enum WebsiteStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### Step 3.2: Update Services and Controllers
1. **RestaurantService Updates**
   - Remove opening_hours from business data methods
   - Add website status management methods
   - Add data validation for business vs website data

2. **RestaurantSettingsService Updates**
   - Add opening_hours management
   - Add contact override logic
   - Add version control methods

3. **ContentBlockService Updates**
   - Add versioning support
   - Add publishing workflow
   - Add content validation

## Migration Plan - Phase 4: Frontend Updates

### Step 4.1: Update CustomerHomePage
```typescript
// Remove direct RestaurantSettings dependency
// Use new data flow: Restaurant -> RestaurantSettings -> ContentBlocks

const useRestaurantData = (restaurantId: number) => {
  // Get business data (fallback)
  const businessData = useRestaurantBusinessData(restaurantId);
  
  // Get website settings (overrides)
  const websiteSettings = useRestaurantSettings(restaurantId);
  
  // Get content blocks (primary content)
  const contentBlocks = useContentBlocks(restaurantId, 'home');
  
  // Merge data with proper precedence
  return useMemo(() => ({
    // Business data as fallback
    ...businessData,
    // Website settings override business data
    ...websiteSettings.displayOverrides,
    // Content blocks are primary content source
    content: contentBlocks
  }), [businessData, websiteSettings, contentBlocks]);
};
```

### Step 4.2: Update Website Builder Interface
1. **Add Data Source Indicators**
   - Show when data comes from business settings
   - Allow overrides for display purposes
   - Clear visual distinction between sources

2. **Add Version Control UI**
   - Draft/Published status indicators
   - Version history
   - Publishing workflow

3. **Add Admin Override Interface**
   - SUPER_ADMIN can edit business data
   - Restaurant owner can only override display

## Migration Plan - Phase 5: Testing and Validation

### Step 5.1: Data Integrity Tests
```sql
-- Verify no data loss during migration
SELECT 
  COUNT(*) as total_restaurants,
  COUNT(rs.id) as has_settings,
  COUNT(cb.restaurant_id) as has_content_blocks
FROM restaurants r
LEFT JOIN restaurant_settings rs ON r.id = rs.restaurant_id
LEFT JOIN (SELECT DISTINCT restaurant_id FROM content_blocks) cb ON r.id = cb.restaurant_id;

-- Verify opening hours migration
SELECT 
  r.name,
  rs.opening_hours IS NOT NULL as has_opening_hours,
  jsonb_typeof(rs.opening_hours) as hours_type
FROM restaurants r
JOIN restaurant_settings rs ON r.id = rs.restaurant_id
WHERE rs.opening_hours IS NOT NULL;
```

### Step 5.2: Frontend Integration Tests
1. Test customer portal displays correct data
2. Test website builder shows proper data sources
3. Test admin panel business data editing
4. Test publishing workflow

## Success Criteria
1. ✅ Clear data ownership boundaries established
2. ✅ No data loss during migration
3. ✅ Customer portals display correctly
4. ✅ Website builder functions with new architecture
5. ✅ Admin panel allows business data management
6. ✅ Version control and publishing workflow operational
7. ✅ Performance maintained or improved

## Timeline Estimate
- **Phase 1 (Schema Updates)**: 2 days
- **Phase 2 (Data Migration)**: 3 days
- **Phase 3 (Backend Updates)**: 5 days
- **Phase 4 (Frontend Updates)**: 7 days
- **Phase 5 (Testing)**: 3 days
- **Total**: 20 days (4 weeks)

## Risk Mitigation
1. **Backup Strategy**: Full database backup before migration
2. **Rollback Plan**: Maintain old schema until validation complete
3. **Staged Deployment**: Test on staging environment first
4. **Data Validation**: Comprehensive checks at each phase
5. **User Communication**: Notify restaurant owners of changes

## Next Steps
1. Review and approve migration plan
2. Create database backup procedures
3. Set up staging environment for testing
4. Begin Phase 1 implementation
5. Coordinate with stakeholders for deployment timeline 