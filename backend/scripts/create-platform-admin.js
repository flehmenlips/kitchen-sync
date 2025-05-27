require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

console.log('\n=== CREATE PLATFORM SUPER ADMIN ===\n');

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function createSuperAdmin() {
  try {
    const email = await question('Email: ');
    const name = await question('Name: ');
    const password = await question('Password: ');

    console.log('\nCreating platform super admin...');

    const response = await axios.post(`${API_URL}/platform/auth/setup`, {
      email,
      name,
      password
    });

    console.log('\n✅ Super admin created successfully!');
    console.log('Admin details:', response.data.admin);
    console.log('\nYou can now log in at /platform-admin with these credentials.');
  } catch (error) {
    if (error.response) {
      console.error('\n❌ Error:', error.response.data.message);
      if (error.response.status === 403) {
        console.log('Platform admins already exist. Use the platform admin portal to create additional admins.');
      }
    } else {
      console.error('\n❌ Error:', error.message);
    }
  } finally {
    rl.close();
  }
}

createSuperAdmin(); 