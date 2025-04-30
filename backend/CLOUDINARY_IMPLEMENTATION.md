# Cloudinary Implementation for Kitchen Sync

This guide outlines how to implement Cloudinary for storing recipe photos in the Kitchen Sync application.

## 1. Install Dependencies

```bash
cd backend
npm install cloudinary
```

## 2. Environment Setup

Add these variables to your `.env` file:

```
CLOUDINARY_CLOUD_NAME=dhaacekdd
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 3. Create a Cloudinary Service

Create a new file: `src/services/cloudinaryService.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary
 * @param filePath Local path to the file to upload
 * @returns Promise with the upload result
 */
export const uploadImage = async (filePath: string): Promise<{url: string, publicId: string}> => {
  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'recipe-photos',
      resource_type: 'image'
    });
    
    // Delete the local file after successful upload
    try {
      await unlinkAsync(filePath);
    } catch (error) {
      console.warn(`Warning: Could not delete local file ${filePath}`, error);
    }
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Deletes an image from Cloudinary
 * @param publicId The public ID of the image to delete
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default {
  uploadImage,
  deleteImage
};
```

## 4. Update the Recipe Controller

Modify `src/controllers/recipeController.ts` to use Cloudinary:

```typescript
// Add this import at the top
import cloudinaryService from '../services/cloudinaryService';

// Then update the uploadRecipePhoto function
export const uploadRecipePhoto = async (req: MulterRequest, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Not authorized, user ID missing' });
    return;
  }

  try {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);

    // ...existing validation code...

    // If no file was uploaded
    if (!req.file) {
      res.status(400).json({ message: 'Please upload an image file' });
      return;
    }

    // Upload to Cloudinary instead of storing locally
    const uploadResult = await cloudinaryService.uploadImage(req.file.path);
    
    // Store the Cloudinary URL in the database
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        photoUrl: uploadResult.url,
        photoPublicId: uploadResult.publicId // Optional: store public ID for future reference
      },
    });

    res.status(200).json({
      message: 'Recipe photo uploaded successfully',
      photoUrl: uploadResult.url,
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Error uploading recipe photo:', error);
    res.status(500).json({ message: 'Error uploading recipe photo' });
  }
};

// Optional: Add a function to delete photos when recipes are deleted
export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  // ...existing code...
  
  try {
    // Get the recipe to find the photo public ID
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }});
    
    // Delete the photo from Cloudinary if it exists
    if (recipe?.photoPublicId) {
      await cloudinaryService.deleteImage(recipe.photoPublicId);
    }
    
    // Continue with existing delete logic...
  } catch (error) {
    // ...existing error handling...
  }
};
```

## 5. Database Schema Update (Optional)

Consider adding a `photoPublicId` field to your recipe table:

```prisma
model Recipe {
  // ...existing fields
  photoUrl String?
  photoPublicId String? // Add this field to store Cloudinary public IDs
}
```

Run a migration to update your database schema:

```bash
npx prisma migrate dev --name add_photo_public_id
```

## 6. Frontend Updates

No changes needed for basic functionality! Your current code loads images from the URL provided by the server, which will now be a Cloudinary URL.

For advanced usage, you can enhance the frontend to:

- Display different sized images based on viewport size
- Show loading states while images are uploading
- Add image editing capabilities

## 7. Migration Strategy for Existing Photos

If you have existing photos, create a migration script:

```typescript
// scripts/migratePhotosToCloudinary.ts
import { PrismaClient } from '@prisma/client';
import path from 'path';
import cloudinaryService from '../src/services/cloudinaryService';

const prisma = new PrismaClient();

async function migratePhotos() {
  try {
    // Find all recipes with photos
    const recipes = await prisma.recipe.findMany({
      where: {
        photoUrl: { not: null }
      }
    });
    
    console.log(`Found ${recipes.length} recipes with photos to migrate`);
    
    for (const recipe of recipes) {
      try {
        if (!recipe.photoUrl) continue;
        
        // Convert relative path to absolute
        const localPath = path.join(__dirname, '../public', recipe.photoUrl);
        
        // Upload to Cloudinary
        const result = await cloudinaryService.uploadImage(localPath);
        
        // Update the database with Cloudinary URL
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            photoUrl: result.url,
            photoPublicId: result.publicId
          }
        });
        
        console.log(`Migrated photo for recipe ${recipe.id}: ${recipe.name}`);
      } catch (error) {
        console.error(`Error migrating photo for recipe ${recipe.id}:`, error);
      }
    }
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migratePhotos();
```

## 8. Testing Your Implementation

1. Test uploading a new photo
2. Verify the URL is saved correctly
3. Check that the image loads in the frontend
4. Test the migration script with a small batch of photos

## 9. Advanced Features (Optional)

Once basic integration is working, consider adding:

- Image transformations (thumbnails, etc.)
- Upload progress indicators
- Direct frontend uploads (bypassing your server)
- Image optimization settings 