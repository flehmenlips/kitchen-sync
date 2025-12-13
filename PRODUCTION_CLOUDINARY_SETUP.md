# Production Cloudinary Setup for Render.com

## ✅ What Was Fixed

The thumbnail utility now uses `VITE_CLOUDINARY_CLOUD_NAME` environment variable. This needs to be set **at build time** for Vite applications.

## 🔧 Required Actions

### Option 1: Using render.yaml (Recommended - Already Updated)

The `render.yaml` file has been updated to include `VITE_CLOUDINARY_CLOUD_NAME` for both services. After you push this change:

1. **Push the updated render.yaml to GitHub**
2. **Render will automatically pick up the new environment variable**
3. **Redeploy your services** (or wait for auto-deploy if enabled)

### Option 2: Manual Setup in Render Dashboard

If you prefer to set it manually or need to update it:

#### For Backend Service (kitchen-sync-api)
Since your backend builds the frontend, add the variable here:

1. Go to https://dashboard.render.com
2. Select your **kitchen-sync-api** service
3. Click **"Environment"** in the left sidebar
4. Click **"+ Add Environment Variable"**
5. Add:
   - **Key**: `VITE_CLOUDINARY_CLOUD_NAME`
   - **Value**: `dhaacekdd`
6. Click **"Save Changes"**
7. **Redeploy** the service (Render will rebuild with the new variable)

#### For Frontend Static Service (kitchen-sync-app) - If Using Separate Service

If you're using the separate frontend static service:

1. Go to https://dashboard.render.com
2. Select your **kitchen-sync-app** service
3. Click **"Environment"** in the left sidebar
4. Click **"+ Add Environment Variable"**
5. Add:
   - **Key**: `VITE_CLOUDINARY_CLOUD_NAME`
   - **Value**: `dhaacekdd`
6. Click **"Save Changes"**
7. **Redeploy** the service

## ⚠️ Important Notes

### Why Build-Time Variables?

Vite embeds environment variables **at build time**, not runtime. This means:
- ✅ Variables must be available when `npm run build` runs
- ❌ Setting them after build won't work
- ✅ Must be in Render environment variables before deployment

### Current Configuration

Your `render.yaml` now includes:
```yaml
envVars:
  - key: VITE_CLOUDINARY_CLOUD_NAME
    value: dhaacekdd
```

This will be automatically applied to your services.

## 🧪 Testing After Deployment

1. **Deploy with the new environment variable**
2. **Open your production site**
3. **Navigate to Asset Library**
4. **Open browser console** (F12)
5. **Look for `[Thumbnail]` debug logs**
6. **Verify thumbnails are visible**

## 🔍 Troubleshooting

### Thumbnails Still Not Showing?

1. **Check browser console** for `[Thumbnail]` logs
2. **Verify the variable is set**:
   - In Render dashboard → Environment tab
   - Should see `VITE_CLOUDINARY_CLOUD_NAME=dhaacekdd`
3. **Check build logs**:
   - Look for any errors during frontend build
   - Verify the variable was available during build
4. **Verify Cloudinary cloud name**:
   - Should match your backend `CLOUDINARY_CLOUD_NAME`
   - Currently: `dhaacekdd`

### Variable Not Found?

If you see warnings like:
```
[Thumbnail] VITE_CLOUDINARY_CLOUD_NAME not set
```

This means:
- Variable wasn't available at build time
- Need to add it to Render environment variables
- Need to redeploy after adding

## 📝 Summary

**What Changed:**
- ✅ Updated `render.yaml` to include `VITE_CLOUDINARY_CLOUD_NAME`
- ✅ Added to both backend and frontend service configs

**What You Need to Do:**
1. **Push the updated render.yaml** (if not already done)
2. **Verify in Render dashboard** that the variable appears
3. **Redeploy** (or wait for auto-deploy)
4. **Test** thumbnails in production

The variable is now configured in `render.yaml`, so it will be automatically applied on your next deployment!

