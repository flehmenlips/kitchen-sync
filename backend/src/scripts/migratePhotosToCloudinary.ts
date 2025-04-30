import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

// Initialize the Prisma client
const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary
 */
async function uploadToCloudinary(filePath: string) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'recipe-photos',
      resource_type: 'image'
    });
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error(`Error uploading ${filePath} to Cloudinary:`, error);
    throw error;
  }
}

/**
 * Migrates all recipe photos to Cloudinary
 */
async function migratePhotos() {
  try {
    console.log('Starting photo migration to Cloudinary...');
    
    // Find all recipes with photos
    const recipes = await prisma.recipe.findMany({
      where: {
        photoUrl: { not: null }
      }
    });
    
    console.log(`Found ${recipes.length} recipes with photos to migrate`);
    
    // Track migration statistics
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const recipe of recipes) {
      try {
        if (!recipe.photoUrl) {
          skippedCount++;
          continue;
        }

        // Skip photos that are already on Cloudinary
        if (recipe.photoUrl.includes('cloudinary.com')) {
          console.log(`Recipe ${recipe.id} already uses Cloudinary, skipping`);
          skippedCount++;
          continue;
        }
        
        // Ensure the photoUrl doesn't start with a slash
        const photoUrl = recipe.photoUrl.startsWith('/') 
          ? recipe.photoUrl.substring(1) 
          : recipe.photoUrl;
        
        // Convert relative path to absolute
        const localPath = path.join(__dirname, '../../public', photoUrl);
        
        // Check if the file exists
        if (!fs.existsSync(localPath)) {
          console.error(`File not found for recipe ${recipe.id}: ${localPath}`);
          errorCount++;
          continue;
        }
        
        console.log(`Migrating photo for recipe ${recipe.id}: ${recipe.name}`);
        console.log(`Local path: ${localPath}`);
        
        // Upload to Cloudinary
        const result = await uploadToCloudinary(localPath);
        
        // Update the database with Cloudinary URL
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            photoUrl: result.url,
            photoPublicId: result.publicId
          }
        });
        
        console.log(`Successfully migrated photo for recipe ${recipe.id}`);
        console.log(`New URL: ${result.url}`);
        successCount++;
        
      } catch (error) {
        console.error(`Error migrating photo for recipe ${recipe.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\nMigration Summary:');
    console.log(`Total recipes processed: ${recipes.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Skipped (already on Cloudinary): ${skippedCount}`);
    console.log(`Failed: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\nSome photos failed to migrate. You may need to re-run the script or handle them manually.');
    } else {
      console.log('\nAll photos migrated successfully!');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migratePhotos().catch(console.error); 