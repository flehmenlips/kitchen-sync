#!/usr/bin/env node

/**
 * Cloudinary Cleanup Script - Emergency Free Plan Recovery
 * 
 * This script helps identify and remove unnecessary assets to get back under
 * the Cloudinary free plan limits while preserving important business assets.
 */

require('dotenv').config({ path: './backend/.env' });
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const DRY_RUN = !process.argv.includes('--execute');

async function analyzeAndCleanup() {
  console.log('🔍 CLOUDINARY CLEANUP ANALYSIS');
  console.log('===============================');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (safe)' : 'EXECUTE (will delete)'}`);
  console.log('');

  try {
    // Get current usage
    console.log('📊 Checking current usage...');
    const usage = await cloudinary.api.usage();
    console.log('Current plan:', usage.plan || 'Free');
    
    // Get all assets
    console.log('📁 Fetching all assets...');
    const allAssets = [];
    
    // Fetch images
    const images = await cloudinary.api.resources({
      resource_type: 'image',
      max_results: 500,
      type: 'upload'
    });
    allAssets.push(...images.resources);
    
    // Fetch videos  
    const videos = await cloudinary.api.resources({
      resource_type: 'video',
      max_results: 100,
      type: 'upload'
    });
    allAssets.push(...videos.resources);
    
    console.log(`📊 Total assets found: ${allAssets.length}`);
    
    // Categorize assets for cleanup priority
    const categories = {
      demoSamples: [],
      duplicates: [],
      oversized: [],
      oldUnused: [],
      keep: []
    };
    
    let totalSize = 0;
    
    allAssets.forEach(asset => {
      totalSize += asset.bytes || 0;
      
      // Demo/Sample assets (highest priority for removal)
      if (asset.public_id.startsWith('samples/') ||
          asset.public_id.startsWith('demo_') ||
          asset.public_id.includes('cld-sample') ||
          asset.public_id === 'sample' ||
          (asset.original_filename && asset.original_filename.includes('sample'))) {
        categories.demoSamples.push(asset);
      }
      // Large files (>5MB)
      else if (asset.bytes > 5 * 1024 * 1024) {
        categories.oversized.push(asset);
      }
      // Old assets (>6 months) that might be unused
      else if (new Date(asset.created_at) < new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)) {
        categories.oldUnused.push(asset);
      }
      // Keep these (business assets)
      else {
        categories.keep.push(asset);
      }
    });
    
    console.log('');
    console.log('📋 CLEANUP ANALYSIS:');
    console.log('=====================');
    console.log(`Total storage used: ${Math.round(totalSize / 1024 / 1024)} MB`);
    console.log('');
    console.log('Assets by category:');
    console.log(`🗑️  Demo/Sample assets: ${categories.demoSamples.length} (${Math.round(categories.demoSamples.reduce((sum, a) => sum + (a.bytes || 0), 0) / 1024 / 1024)} MB)`);
    console.log(`📏 Oversized assets (>5MB): ${categories.oversized.length} (${Math.round(categories.oversized.reduce((sum, a) => sum + (a.bytes || 0), 0) / 1024 / 1024)} MB)`);
    console.log(`⏰ Old unused assets: ${categories.oldUnused.length} (${Math.round(categories.oldUnused.reduce((sum, a) => sum + (a.bytes || 0), 0) / 1024 / 1024)} MB)`);
    console.log(`✅ Keep (business assets): ${categories.keep.length} (${Math.round(categories.keep.reduce((sum, a) => sum + (a.bytes || 0), 0) / 1024 / 1024)} MB)`);
    
    // Calculate potential savings
    const demoSavings = categories.demoSamples.reduce((sum, a) => sum + (a.bytes || 0), 0);
    const oversizedSavings = categories.oversized.reduce((sum, a) => sum + (a.bytes || 0), 0);
    
    console.log('');
    console.log('💾 POTENTIAL SAVINGS:');
    console.log('=====================');
    console.log(`Removing demo/samples: ${Math.round(demoSavings / 1024 / 1024)} MB`);
    console.log(`Removing oversized: ${Math.round(oversizedSavings / 1024 / 1024)} MB`);
    console.log(`Total potential savings: ${Math.round((demoSavings + oversizedSavings) / 1024 / 1024)} MB`);
    
    if (DRY_RUN) {
      console.log('');
      console.log('🔍 DRY RUN MODE - NO CHANGES MADE');
      console.log('To execute cleanup, run: node cleanup-cloudinary-excess.js --execute');
      console.log('');
      console.log('🚨 RECOMMENDED ACTIONS:');
      console.log('1. Remove demo/sample assets (safe)');
      console.log('2. Consider upgrading to Cloudinary paid plan');
      console.log('3. Optimize large images before upload');
      console.log('4. Use local storage for development assets');
      return;
    }
    
    // Execute cleanup
    console.log('');
    console.log('🗑️ EXECUTING CLEANUP...');
    console.log('========================');
    
    let deletedCount = 0;
    let deletedSize = 0;
    
    // Delete demo/sample assets first (safest)
    console.log('Removing demo/sample assets...');
    for (const asset of categories.demoSamples) {
      try {
        await cloudinary.uploader.destroy(asset.public_id, {
          resource_type: asset.resource_type
        });
        deletedCount++;
        deletedSize += asset.bytes || 0;
        console.log(`✅ Deleted: ${asset.public_id}`);
      } catch (error) {
        console.log(`❌ Failed to delete: ${asset.public_id} - ${error.message}`);
      }
    }
    
    console.log('');
    console.log('✅ CLEANUP COMPLETE!');
    console.log('====================');
    console.log(`Deleted ${deletedCount} assets`);
    console.log(`Freed ${Math.round(deletedSize / 1024 / 1024)} MB`);
    console.log('');
    console.log('🔄 Check your Cloudinary dashboard to verify the cleanup.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

// Run the analysis
analyzeAndCleanup().catch(console.error); 