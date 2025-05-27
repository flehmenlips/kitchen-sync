require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function testPlatformAuth() {
  console.log('\n=== TESTING PLATFORM AUTHENTICATION ===\n');

  try {
    // Test credentials
    const email = 'george@seabreeze.farm';
    const password = 'Geor3396tabl!';

    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_URL}/platform/auth/login`, {
      email,
      password
    });

    const { token, admin } = loginResponse.data;
    console.log('✅ Login successful!');
    console.log('Admin:', admin);
    console.log('Token:', token.substring(0, 50) + '...');

    // Test authenticated endpoint
    console.log('\n2. Testing authenticated endpoint...');
    const meResponse = await axios.get(`${API_URL}/platform/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Auth middleware working!');
    console.log('Current admin:', meResponse.data);

    // Test protected endpoint
    console.log('\n3. Testing role-protected endpoint...');
    const restaurantsResponse = await axios.get(`${API_URL}/platform/restaurants`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Role-based access working!');
    console.log('Response:', restaurantsResponse.data);

    // Test logout
    console.log('\n4. Testing logout...');
    await axios.post(`${API_URL}/platform/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Logout successful!');

    console.log('\n✅ All platform auth tests passed!');
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Instructions
console.log('This script tests the platform authentication system.');
console.log('Make sure you have created a platform admin first using:');
console.log('  node scripts/create-platform-admin.js');
console.log('\nUpdate the email/password in this script if needed.\n');

testPlatformAuth(); 