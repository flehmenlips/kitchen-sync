import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = process.env.LOCAL_ASSETS_PATH || './public/uploads';
const BASE_URL = process.env.ASSET_BASE_URL || 'http://localhost:3001/uploads';

/**
 * Local Storage Service - Alternative to Cloudinary
 * Use this during development to bypass Cloudinary limits
 */

export const uploadToLocal = async (file: any, folder: string = 'general'): Promise<{
  url: string;
  publicId: string;
  bytes: number;
}> => {
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
  
  // Get file stats
  const stats = fs.statSync(filePath);
  
  return {
    url: `${BASE_URL}/${folder}/${fileName}`,
    publicId: `${folder}/${fileName}`,
    bytes: stats.size
  };
};

export const deleteFromLocal = async (publicId: string): Promise<void> => {
  const filePath = path.join(UPLOADS_DIR, publicId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const listLocalAssets = async (folder: string = ''): Promise<any[]> => {
  const folderPath = path.join(UPLOADS_DIR, folder);
  
  if (!fs.existsSync(folderPath)) {
    return [];
  }
  
  const files = fs.readdirSync(folderPath, { withFileTypes: true });
  
  return files
    .filter(file => file.isFile())
    .map(file => {
      const filePath = path.join(folderPath, file.name);
      const stats = fs.statSync(filePath);
      
      return {
        publicId: path.join(folder, file.name),
        url: `${BASE_URL}/${folder}/${file.name}`,
        fileName: file.name,
        bytes: stats.size,
        createdAt: stats.birthtime.toISOString(),
        format: path.extname(file.name).slice(1)
      };
    });
}; 