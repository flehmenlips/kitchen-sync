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
    
    console.log(`Uploaded image to Cloudinary: ${result.public_id}`);
    
    // Delete the local file after successful upload
    try {
      await unlinkAsync(filePath);
      console.log(`Deleted local file: ${filePath}`);
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
  if (!publicId) {
    console.warn('No publicId provided for deletion, skipping');
    return;
  }
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image from Cloudinary: ${publicId}, result: ${result.result}`);
  } catch (error) {
    console.error(`Error deleting image from Cloudinary (${publicId}):`, error);
    throw error;
  }
};

export default {
  uploadImage,
  deleteImage
}; 