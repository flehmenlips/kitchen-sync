// Cloudinary test script
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Check for environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please add these to your .env file');
  process.exit(1);
}

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Print configuration debug info (without revealing secret)
console.log('Cloudinary Configuration:');
console.log('- Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('- API key length:', process.env.CLOUDINARY_API_KEY.length, 'characters');
console.log('- API secret found:', !!process.env.CLOUDINARY_API_SECRET);

// Find a test image
let testFile = 'public/uploads/recipe-1745961955291-428514643.jpeg';
if (!fs.existsSync(testFile)) {
  console.log(`Test file not found: ${testFile}`);
  console.log('Looking for alternative test images...');
  
  try {
    if (fs.existsSync('public/uploads')) {
      const files = fs.readdirSync('public/uploads');
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      
      if (imageFiles.length > 0) {
        testFile = path.join('public/uploads', imageFiles[0]);
        console.log(`Using alternative test file: ${testFile}`);
      } else {
        console.log('No image files found in public/uploads');
        process.exit(1);
      }
    } else {
      console.error('uploads directory not found');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error finding test images:', err.message);
    process.exit(1);
  }
}

// Function to upload a test image and create folder
async function testCloudinaryUpload() {
  try {
    console.log('Attempting to upload test image...');
    const result = await cloudinary.uploader.upload(testFile, {
      folder: 'recipe-photos',
      resource_type: 'image'
    });
    
    console.log('\nUPLOAD SUCCESSFUL!');
    console.log('Image URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
    // Verify the folder was created by listing contents
    console.log('\nListing folder contents:');
    const folderContents = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'recipe-photos'
    });
    
    console.log(`Found ${folderContents.resources.length} resources in the folder.`);
    console.log('\nFolder setup complete! Cloudinary integration is working correctly.');
    
  } catch (error) {
    console.error('\nERROR UPLOADING IMAGE:');
    console.error(error.message);
    
    if (error.http_code) {
      console.error(`HTTP Status: ${error.http_code}`);
    }
    
    console.log('\nTROUBLESHOOTING TIPS:');
    console.log('1. Verify your Cloudinary credentials on the dashboard');
    console.log('2. Check for typos in your .env file');
    console.log('3. Ensure your Cloudinary account is active');
    console.log('4. Try regenerating your API key if problems persist');
  }
}

// Run the test
testCloudinaryUpload(); 