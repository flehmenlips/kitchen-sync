# Production Environment Setup Guide

## Required Environment Variables for Render

### Email Service (SendGrid)
```bash
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@seabreezekitchen.com
FRONTEND_URL=https://kitchen-sync-app.onrender.com
```

### Authentication
```bash
JWT_SECRET=your-secure-jwt-secret-here
SESSION_SECRET=your-secure-session-secret-here
```

### Database
```bash
DATABASE_URL=postgresql://... (automatically provided by Render)
```

### Cloudinary (for image uploads)
```bash
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## Setting Up in Render

1. **Navigate to Backend Service**
   - Go to https://dashboard.render.com
   - Select your backend service (kitchen-sync-backend)

2. **Add Environment Variables**
   - Click "Environment" in the left sidebar
   - Click "+ Add Environment Variable"
   - Add each variable listed above

3. **SendGrid Specific Setup**
   - Get your API key from https://app.sendgrid.com/settings/api_keys
   - Ensure sender email is verified in SendGrid
   - For production, complete domain authentication

4. **Save Options**
   - Choose "Save and deploy" to apply immediately
   - Or "Save only" to apply on next manual deploy

## Verifying Email Service

After deployment, test email functionality by:
1. Creating a new customer account
2. Checking for verification email
3. Making a test reservation
4. Checking for confirmation email

## Troubleshooting

If emails aren't sending:
1. Check Render logs for SendGrid errors
2. Verify API key is correct
3. Ensure FROM_EMAIL is verified in SendGrid
4. Check SendGrid dashboard for blocked/bounced emails 