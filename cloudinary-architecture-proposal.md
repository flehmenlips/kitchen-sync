# KitchenSync Cloudinary Multi-Tenant Architecture

## 🏗️ **PROPOSED CLOUDINARY FOLDER STRUCTURE**

### **Level 1: Platform Organization**
```
cloudinary-root/
├── platform/                          # KitchenSync platform assets
│   ├── marketing/                     # Public marketing materials
│   ├── templates/                     # Website templates and demos
│   └── system/                       # System icons, defaults
├── restaurants/                       # All restaurant-specific assets
│   ├── {restaurant_id}/              # Individual restaurant isolation
│   │   ├── assets/                   # General restaurant assets
│   │   ├── content-blocks/           # Website builder content
│   │   ├── recipe-photos/            # Recipe and food images
│   │   ├── branding/                 # Logos, brand assets
│   │   ├── menus/                    # Menu-related images
│   │   ├── staff/                    # Staff photos
│   │   └── marketing/                # Restaurant marketing materials
│   └── shared/                       # Cross-restaurant shared assets (if any)
└── temp/                             # Temporary uploads (auto-cleanup)
```

### **Level 2: Restaurant-Specific Structure (Example: Restaurant ID 2)**
```
restaurants/2/                         # Coq au Vin
├── assets/                           # General assets
│   ├── hero-images/                  
│   ├── gallery/                      
│   └── miscellaneous/                
├── content-blocks/                   # Website builder content
│   ├── hero/                         
│   ├── about/                        
│   ├── contact/                      
│   └── features/                     
├── recipe-photos/                    # Recipe system
│   ├── appetizers/                   
│   ├── mains/                        
│   ├── desserts/                     
│   └── beverages/                    
├── branding/                         # Restaurant identity
│   ├── logos/                        
│   ├── brand-colors/                 
│   └── typography-samples/           
├── menus/                           # Menu system assets
│   ├── menu-covers/                  
│   ├── category-images/              
│   └── item-photos/                  
├── staff/                           # Staff management
│   └── profile-photos/               
└── marketing/                       # Restaurant marketing
    ├── social-media/                 
    ├── promotions/                   
    └── events/                       
```

## 🔐 **SECURITY & ACCESS CONTROL**

### **Database Schema Enhancement**
```sql
-- Enhanced BrandAsset model with security
ALTER TABLE brand_assets ADD COLUMN folder_structure TEXT; -- Full folder path
ALTER TABLE brand_assets ADD COLUMN access_level TEXT DEFAULT 'RESTAURANT'; -- RESTAURANT, PLATFORM, SHARED
ALTER TABLE brand_assets ADD COLUMN created_by INTEGER; -- User who uploaded
ALTER TABLE brand_assets ADD COLUMN security_hash TEXT; -- Asset verification hash
```

### **Access Control Rules**
1. **Restaurant Level**: Can only access `restaurants/{their_id}/`
2. **Platform Admin**: Can access all `restaurants/` and `platform/`
3. **SuperAdmin**: Full access to entire Cloudinary account
4. **Tech Support**: Temporary access with audit logging

### **Security Validation Functions**
```typescript
// Enhanced ownership validation
export const validateAssetAccess = (
  publicId: string, 
  restaurantId: number, 
  userRole: 'RESTAURANT' | 'PLATFORM_ADMIN' | 'SUPERADMIN'
): boolean => {
  const expectedPrefix = `restaurants/${restaurantId}/`;
  
  switch (userRole) {
    case 'RESTAURANT':
      return publicId.startsWith(expectedPrefix);
    case 'PLATFORM_ADMIN':
      return publicId.startsWith('restaurants/') || publicId.startsWith('platform/');
    case 'SUPERADMIN':
      return true; // Full access
    default:
      return false;
  }
};
```

## 🚀 **MIGRATION STRATEGY FOR COQ AU VIN**

### **Phase 1: Asset Classification & Cleanup**
1. **Identify Legitimate Assets**:
   - Keep: `restaurants/2/assets/` (2 assets)
   - Review: `content-blocks/` (33 assets)
   - Review: `recipe-photos/` (56 assets)

2. **Remove Contamination**:
   - Delete: `samples/` (51 assets)
   - Delete: `seabreeze_farm/` (58 assets)
   - Delete: `demo_*` assets (4 assets)
   - Delete: Personal videos (3 assets)

### **Phase 2: Folder Reorganization**
```typescript
// Migration script to reorganize Coq au Vin assets
const reorganizeCoqAuVinAssets = async () => {
  const restaurantId = 2;
  const baseFolder = `restaurants/${restaurantId}`;
  
  // Map current folders to new structure
  const folderMapping = {
    'content-blocks': `${baseFolder}/content-blocks`,
    'recipe-photos': `${baseFolder}/recipe-photos`,
    'restaurant-settings': `${baseFolder}/branding`,
    'menu-logos': `${baseFolder}/menus`
  };
  
  // Migrate each asset to proper folder structure
  // Update database records with new publicIds
  // Update cloudinaryPublicId field consistently
};
```

### **Phase 3: Enhanced Asset Management**
1. **Database Updates**:
   - Populate `cloudinaryPublicId` for all assets
   - Add folder structure tracking
   - Implement usage tracking

2. **Upload Service Updates**:
   - Enforce folder structure in uploads
   - Add automatic categorization
   - Implement access control

## 🛠️ **IMPLEMENTATION PLAN**

### **Immediate Actions (Today)**
1. **Asset Audit**: Identify which of the 236 assets actually belong to Coq au Vin
2. **Contamination Removal**: Delete obviously foreign assets
3. **Folder Migration**: Move legitimate assets to proper folder structure

### **Short Term (This Week)**
1. **Enhanced Upload Service**: Implement strict folder structure
2. **Security Validation**: Add ownership validation to all asset operations
3. **Database Schema**: Update asset records with proper folder tracking

### **Long Term (Next Month)**
1. **Multi-Tenant Rollout**: Apply architecture to all restaurants
2. **Platform Admin Tools**: Build admin interface for asset management
3. **Audit Logging**: Track all asset access and modifications

## 🔍 **NEXT STEPS FOR COQ AU VIN**

Would you like me to:

1. **Start with contamination cleanup** - Remove the obvious foreign assets first?
2. **Analyze content-blocks and recipe-photos** - Determine which actually belong to Coq au Vin?
3. **Implement the folder migration** - Move legitimate assets to proper structure?
4. **Build the enhanced security system** - Implement the access control architecture?

The current 236 assets need immediate attention, with ~116 assets clearly needing removal (samples + seabreeze_farm + demos + personal videos). 