#!/usr/bin/env node

/**
 * Production Data Testing Setup Script
 * 
 * This script helps set up local development environment
 * with production data for safe testing before deployment.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 PRODUCTION DATA TESTING SETUP');
console.log('=================================');
console.log('This script helps you test changes against production data locally');
console.log('');

// Check environment
if (process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: Do not run this script in production environment!');
  process.exit(1);
}

console.log('📋 MANUAL STEPS REQUIRED:');
console.log('');
console.log('1. 🔄 CREATE PRODUCTION BACKUP:');
console.log('   - Go to Render Dashboard > Database');
console.log('   - Use pgAdmin or database tools to create backup');
console.log('   - Save backup file to: backend/database-backups/');
console.log('');

console.log('2. 💾 BACKUP CURRENT LOCAL DATABASE:');
console.log('   Run: npm run db:backup:local');
console.log('');

console.log('3. 🗄️ RESTORE PRODUCTION DATA LOCALLY:');
console.log('   - Open local pgAdmin');
console.log('   - Drop current local database');
console.log('   - Create new database with same name');
console.log('   - Restore from production backup file');
console.log('');

console.log('4. 🧪 TEST WITH PRODUCTION DATA:');
console.log('   - Start servers: npm run dev:all');
console.log('   - Test customer portals with real restaurant slugs');
console.log('   - Verify content blocks load correctly');
console.log('   - Test navigation and Website Builder');
console.log('');

console.log('📊 PRODUCTION RESTAURANTS TO TEST:');
console.log('Based on your production data, test these restaurants:');

const testRestaurants = [
  { name: 'Coq au Vin', slug: 'coq-au-vin', url: 'localhost:5173/?restaurant=coq-au-vin' },
  { name: 'Seabreeze Kitchen', slug: 'seabreeze-kitchen', url: 'localhost:5173/?restaurant=seabreeze-kitchen' },
  { name: 'Mountain View Bistro', slug: 'mountain-view-bistro', url: 'localhost:5173/?restaurant=mountain-view-bistro' },
  { name: 'Harvest Table', slug: 'harvest-table', url: 'localhost:5173/?restaurant=harvest-table' },
  { name: 'Coastal Grill', slug: 'coastal-grill', url: 'localhost:5173/?restaurant=coastal-grill' }
];

testRestaurants.forEach((restaurant, index) => {
  console.log(`   ${index + 1}. ${restaurant.name}`);
  console.log(`      Slug: ${restaurant.slug}`);
  console.log(`      Test URL: ${restaurant.url}`);
  console.log('');
});

console.log('🔍 TESTING CHECKLIST:');
console.log('');
console.log('□ Customer portals load without errors');
console.log('□ Content blocks render correctly');
console.log('□ Navigation links work properly');
console.log('□ Website Builder shows real content blocks');
console.log('□ API endpoints return correct data');
console.log('□ Error handling works for edge cases');
console.log('□ Performance is acceptable');
console.log('');

console.log('🚀 DEPLOYMENT CONFIDENCE:');
console.log('Once all tests pass with production data locally,');
console.log('you can deploy to production with high confidence!');
console.log('');

console.log('📝 NEXT STEPS:');
console.log('1. Complete manual steps above');
console.log('2. Run comprehensive testing');
console.log('3. If all tests pass, proceed with deployment');
console.log('4. Use: npm run deploy:production (when ready)');
console.log('');

// Check if we can provide any automated assistance
const backupDir = path.join(__dirname, '../database-backups');
if (fs.existsSync(backupDir)) {
  const backupFiles = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.sql') || file.endsWith('.dump'))
    .sort((a, b) => b.localeCompare(a)); // Most recent first
  
  if (backupFiles.length > 0) {
    console.log('💾 AVAILABLE BACKUP FILES:');
    backupFiles.slice(0, 5).forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    console.log('');
  }
}

console.log('⚠️  IMPORTANT SAFETY NOTES:');
console.log('- Always backup your local database before restoring production data');
console.log('- Never run this process in production environment');
console.log('- Test thoroughly before deploying');
console.log('- Keep production backup files secure');
console.log(''); 