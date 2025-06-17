# Website Builder Data Architecture Migration Plan

## Background and Motivation

After comprehensive analysis of the three main data tables (Restaurant, RestaurantSettings, ContentBlocks), we've identified significant data redundancy and unclear ownership boundaries. This migration plan establishes a clear data hierarchy and eliminates conflicts between the dual data systems.

## Current Problem

The existing system has overlapping data sources:
- **CustomerHomePage.tsx** reads from `RestaurantSettings` table
- **WebsiteBuilderPage.tsx** reads from `ContentBlocks` table  
- **Restaurant** table contains business data that overlaps with both

This creates confusion where restaurant owners edit content in the Website Builder but changes don't appear on their live website.

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

## Migration Plan Overview

### Phase 1: Schema Updates (2 days)
- Update Restaurant table: Remove openingHours, add website status fields
- Update RestaurantSettings table: Add openingHours, versioning, and override fields
- Update ContentBlocks table: Add versioning and publishing fields

### Phase 2: Data Migration (3 days)
- Migrate openingHours from Restaurant to RestaurantSettings
- Migrate hero/about content from RestaurantSettings to ContentBlocks
- Clean up duplicate fields in RestaurantSettings

### Phase 3: Backend Updates (5 days)
- Update Prisma schema with new field mappings
- Update services and controllers for new data flow
- Add versioning and publishing logic

### Phase 4: Frontend Updates (7 days)
- Update CustomerHomePage to use new data hierarchy
- Update Website Builder interface with data source indicators
- Add version control and publishing UI

### Phase 5: Testing and Validation (3 days)
- Data integrity tests
- Frontend integration tests
- Performance validation

## Success Criteria
1. ✅ Clear data ownership boundaries established
2. ✅ No data loss during migration
3. ✅ Customer portals display correctly
4. ✅ Website builder functions with new architecture
5. ✅ Admin panel allows business data management
6. ✅ Version control and publishing workflow operational
7. ✅ Performance maintained or improved

## Implementation Priority
This migration should be **HIGH PRIORITY** as it resolves the core data conflict that prevents the Website Builder from functioning correctly. Restaurant owners currently cannot see their Website Builder changes on their live websites due to this architectural issue.

## Timeline Estimate
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
