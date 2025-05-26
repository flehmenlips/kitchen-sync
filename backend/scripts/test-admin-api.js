const axios = require('axios');

// Replace with your actual token from the browser
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.log('Usage: node test-admin-api.js YOUR_TOKEN');
  console.log('Copy the token from browser localStorage (kitchenSyncUserInfo.token)');
  process.exit(1);
}

async function testAdminAPI() {
  try {
    console.log('Testing production admin API...');
    console.log('Token (first 20 chars):', TOKEN.substring(0, 20) + '...');
    
    const response = await axios.get('https://kitchen-sync-api.onrender.com/api/admin/customers', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 20
      }
    });
    
    console.log('\nSuccess! API Response:');
    console.log('- Total customers:', response.data.pagination?.total || response.data.length);
    console.log('- Response status:', response.status);
    console.log('- First few customers:', response.data.customers?.slice(0, 3).map(c => ({
      id: c.id,
      email: c.email
    })));
    
  } catch (error) {
    console.error('\nError calling admin API:');
    console.error('- Status:', error.response?.status);
    console.error('- Message:', error.response?.data?.error || error.message);
    console.error('- Full error:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('\nPossible causes:');
      console.log('1. Token has expired');
      console.log('2. Token is invalid');
      console.log('3. User does not have admin privileges');
      console.log('4. Backend auth middleware issue');
    }
  }
}

testAdminAPI(); 