# Cloudinary Setup Instructions

## 1. Verify Your Cloudinary Credentials

1. Log in to your Cloudinary dashboard: https://console.cloudinary.com/
2. On the dashboard home page, look for the "Account Details" section
3. You should see:
   - Cloud name: `dhaacekdd`
   - API Key: (verify this matches what you provided)
   - API Secret: (this is what you need for the .env file)

## 2. Create a Folder in Cloudinary

### Method 1: Through the Dashboard
1. Click on "Media Library" in the left sidebar
2. Click the "Create folder" button (top right)
3. Name it "recipe-photos" and click "Create"

### Method 2: Through Upload (Automatic)
Folders will be created automatically when you upload a file specifying the folder.

## 3. Configure Your Environment

1. Add the following to your `.env` file:
```
CLOUDINARY_CLOUD_NAME=dhaacekdd
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

2. Update the uploadMiddleware.ts file to use Cloudinary for storage

## 4. Test the Integration

1. Try a test upload:
```javascript
// Test code
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload a test file
cloudinary.uploader.upload('path/to/image.jpg', {
  folder: 'recipe-photos'
}).then(result => {
  console.log(result);
});
```

## 5. Update Your Application Code

After testing is successful, you'll need to:

1. Update the recipe photo upload controller
2. Update any frontend code to properly display the Cloudinary URLs
3. Consider migrating existing photos

## Important Notes

1. **Security**: Never commit your API Secret to version control
2. **URLs**: Cloudinary URLs are in the format: `https://res.cloudinary.com/dhaacekdd/image/upload/v1234567890/recipe-photos/image.jpg`
3. **Transformations**: You can add transformations to URLs, e.g., `https://res.cloudinary.com/dhaacekdd/image/upload/w_300,h_300,c_fill/recipe-photos/image.jpg`
4. **Migration**: For existing photos, you'll need to upload them to Cloudinary and update database records 