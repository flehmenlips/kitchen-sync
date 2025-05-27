#!/usr/bin/env node

/**
 * Test API Endpoint
 * Tests the recipes endpoint to see what error is occurring
 */

const https = require('https');

// Test configuration
const API_URL = 'https://kitchen-sync-app.onrender.com';
const TOKEN = process.argv[2]; // Pass token as argument

if (!TOKEN) {
  console.log('Usage: node test-api-endpoint.js <auth-token>');
  console.log('Get the token from browser DevTools > Application > Local Storage');
  process.exit(1);
}

console.log('🔍 Testing KitchenSync API Endpoints');
console.log('===================================\n');

// Test 1: User info endpoint
function testUserEndpoint() {
  return new Promise((resolve) => {
    console.log('1. Testing /api/users/profile...');
    
    const options = {
      hostname: 'kitchen-sync-app.onrender.com',
      path: '/api/users/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log('   Response:', JSON.parse(data));
        } else {
          console.log('   Error:', data);
        }
        console.log();
        resolve();
      });
    }).on('error', (err) => {
      console.log('   Request failed:', err.message);
      resolve();
    });
  });
}

// Test 2: Restaurants endpoint
function testRestaurantsEndpoint() {
  return new Promise((resolve) => {
    console.log('2. Testing /api/user/restaurants...');
    
    const options = {
      hostname: 'kitchen-sync-app.onrender.com',
      path: '/api/user/restaurants',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('   Response:', response);
          if (response.restaurants && response.restaurants.length > 0) {
            console.log('   ✅ Found restaurants:', response.restaurants.map(r => `${r.name} (ID: ${r.id})`).join(', '));
          }
        } else {
          console.log('   Error:', data);
        }
        console.log();
        resolve();
      });
    }).on('error', (err) => {
      console.log('   Request failed:', err.message);
      resolve();
    });
  });
}

// Test 3: Recipes endpoint WITHOUT restaurant header
function testRecipesWithoutHeader() {
  return new Promise((resolve) => {
    console.log('3. Testing /api/recipes WITHOUT X-Restaurant-Id header...');
    
    const options = {
      hostname: 'kitchen-sync-app.onrender.com',
      path: '/api/recipes',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          const recipes = JSON.parse(data);
          console.log(`   ✅ Success! Found ${recipes.length} recipes`);
        } else {
          console.log('   ❌ Error:', data);
        }
        console.log();
        resolve();
      });
    }).on('error', (err) => {
      console.log('   Request failed:', err.message);
      resolve();
    });
  });
}

// Test 4: Recipes endpoint WITH restaurant header
function testRecipesWithHeader() {
  return new Promise((resolve) => {
    console.log('4. Testing /api/recipes WITH X-Restaurant-Id: 2 header...');
    
    const options = {
      hostname: 'kitchen-sync-app.onrender.com',
      path: '/api/recipes',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'X-Restaurant-Id': '2' // Coq au Vin
      }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          const recipes = JSON.parse(data);
          console.log(`   ✅ Success! Found ${recipes.length} recipes`);
          if (recipes.length > 0) {
            console.log(`   First recipe: ${recipes[0].name}`);
          }
        } else {
          console.log('   ❌ Error:', data);
        }
        console.log();
        resolve();
      });
    }).on('error', (err) => {
      console.log('   Request failed:', err.message);
      resolve();
    });
  });
}

// Run all tests
async function runTests() {
  await testUserEndpoint();
  await testRestaurantsEndpoint();
  await testRecipesWithoutHeader();
  await testRecipesWithHeader();
  
  console.log('✅ Tests complete!');
  console.log('\n📋 Summary:');
  console.log('If recipes fail without X-Restaurant-Id but succeed with it,');
  console.log('then the frontend is not sending the restaurant context header.');
}

runTests(); 