# Local Storage Migration Guide

## 🎯 **IMMEDIATE SOLUTION: Local File Storage**

To get your asset functionality working immediately while staying within Cloudinary limits:

### **Step 1: Enable Local Storage Mode**

Add to `backend/.env.local`:
```env
# Asset Storage Configuration
ASSET_STORAGE_MODE=local  # Switch from 'cloudinary' to 'local'
LOCAL_ASSETS_PATH=./public/uploads
ASSET_BASE_URL=http://localhost:3001/uploads
```

### **Step 2: Create Local Storage Service**

Create `backend/src/services/localStorageService.ts`:
```typescript
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = process.env.LOCAL_ASSETS_PATH || './public/uploads';

export const uploadToLocal = async (file: any, folder: string = 'general'): Promise<{url: string, publicId: string}> => {
  // Ensure uploads directory exists
  const folderPath = path.join(UPLOADS_DIR, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  // Generate unique filename
  const fileExtension = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(folderPath, fileName);
  
  // Save file
  fs.writeFileSync(filePath, file.buffer);
  
  return {
    url: `${process.env.ASSET_BASE_URL}/${folder}/${fileName}`,
    publicId: `${folder}/${fileName}`
  };
};

export const deleteFromLocal = async (publicId: string): Promise<void> => {
  const filePath = path.join(UPLOADS_DIR, publicId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
```

### **Step 3: Update Asset Controller**

Modify `backend/src/controllers/assetController.ts`:
```typescript
// At the top, add storage mode detection
const STORAGE_MODE = process.env.ASSET_STORAGE_MODE || 'cloudinary';

// In uploadAsset function, replace Cloudinary upload with:
let uploadResult;
if (STORAGE_MODE === 'local') {
  uploadResult = await uploadToLocal(req.file, `restaurants/${restaurantId}`);
} else {
  uploadResult = await uploadImage(tempPath, `restaurants/${restaurantId}/assets`);
}
```

### **Step 4: Add Static File Serving**

In `backend/server.ts`:
```typescript
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
```

## 🔄 **MIGRATION BENEFITS**

### **Immediate Advantages:**
- ✅ **No Cloudinary limits** - unlimited local storage
- ✅ **Faster development** - no API calls for uploads
- ✅ **Cost-effective** - no monthly fees
- ✅ **Full control** - manage your own files

### **Production Considerations:**
- 📁 **Backup strategy** needed for file persistence
- 🌐 **CDN setup** recommended for performance
- 📈 **Scaling** may require file storage service later

## 🚀 **HYBRID APPROACH (Recommended)**

Use local storage for development and Cloudinary for production:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const STORAGE_MODE = isDevelopment ? 'local' : 'cloudinary';
```

This gives you:
- **Free development** with local storage
- **Production performance** with Cloudinary (when needed)
- **Easy switching** between modes

## 📋 **NEXT STEPS**

1. **Immediate**: Run the cleanup script to remove demo assets
2. **Short-term**: Implement local storage for development
3. **Long-term**: Consider Cloudinary paid plan for production scaling 