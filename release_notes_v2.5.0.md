# Kitchen Sync v2.5.0 - Cloudinary Integration for Recipe Photos

## Overview
This release enhances the recipe photo functionality by integrating Cloudinary cloud storage for improved performance, reliability, and scalability. Recipe photos are now stored in the cloud, providing faster loading times and reduced server storage requirements.

## New Features
- **Cloudinary Cloud Storage**: Recipe photos are now stored in Cloudinary's cloud service instead of on the local server
- **Improved Photo Management**: Added tracking of photo public IDs for better resource management
- **Automatic Photo Cleanup**: Old photos are automatically deleted from Cloudinary when replaced
- **Enhanced Error Handling**: Improved error recovery during photo upload process
- **Optimized Photo Loading**: Faster photo display with cloud-based CDN delivery

## Technical Improvements
- **Database Schema Update**: Added `photoPublicId` field to Recipe model
- **Migration Script**: Created SQL migration to add the photo_public_id column to the database
- **Cloudinary Service**: Added dedicated service for Cloudinary API integration
- **Environment Configuration**: Added Cloudinary credentials to environment setup
- **Dependency Updates**: Added UUID library for file handling

## Bug Fixes
- Fixed an issue where the Prisma client import was missing in the recipe controller
- Resolved issues with photo URL construction in development vs production environments
- Added proper cleanup of temporary files after upload

## Developer Notes
- The application now requires Cloudinary credentials in the environment variables:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Photos are stored in the `recipe-photos` folder in Cloudinary
- Photo URLs are now in the format: `https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/recipe-photos/[id].jpg`

## Deployment Information
- This release requires a database migration to add the `photo_public_id` column
- Run the provided SQL migration script: `add_photo_public_id_column.sql`
- Ensure Cloudinary environment variables are configured in production

---

Kitchen Sync team would like to thank all contributors for their continued support and feedback. 