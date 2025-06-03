// Test the subdomain pattern
const subdomainPattern = /^https:\/\/([a-z0-9-]+\.)?kitchensync\.restaurant$/;

console.log('Testing subdomain pattern...\n');

const testUrls = [
  'https://kitchensync.restaurant',
  'https://coq-au-vin.kitchensync.restaurant',
  'https://test-restaurant.kitchensync.restaurant',
  'https://www.kitchensync.restaurant',
  'https://api.kitchensync.restaurant'
];

testUrls.forEach(url => {
  console.log(`${url}: ${subdomainPattern.test(url)}`);
});

// Test if this pattern causes issues with Express
const express = require('express');
const app = express();

try {
  // Test CORS setup
  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && subdomainPattern.test(origin)) {
      console.log('Valid subdomain');
    }
    next();
  });
  
  console.log('\nRegex pattern works fine with Express!');
} catch (error) {
  console.error('\nError with regex pattern:');
  console.error(error);
} 