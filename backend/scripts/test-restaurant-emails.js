require('dotenv').config();
const { emailService } = require('../dist/services/emailService');

async function testRestaurantEmails() {
  console.log('🧪 Testing Restaurant Email Templates\n');

  const testEmail = process.env.TEST_EMAIL || 'your-test-email@example.com';
  const ownerName = 'John Smith';
  const restaurantName = 'The Gourmet Kitchen';
  
  console.log(`📤 Sending test emails to: ${testEmail}`);
  console.log(`📤 From email: ${process.env.FROM_EMAIL || 'noreply@seabreezekitchen.com'}\n`);

  try {
    // Test 1: Restaurant Verification Email
    console.log('1️⃣  Testing Restaurant Verification Email...');
    const verificationUrl = 'http://localhost:5173/verify-email?token=test-restaurant-verification-token';
    await emailService.sendRestaurantVerificationEmail(
      testEmail,
      ownerName,
      restaurantName,
      verificationUrl
    );
    console.log('   ✅ Restaurant verification email sent successfully!\n');

    // Test 2: Restaurant Welcome Email
    console.log('2️⃣  Testing Restaurant Welcome Email...');
    const loginUrl = 'http://localhost:5173/login';
    await emailService.sendRestaurantWelcomeEmail(
      testEmail,
      ownerName,
      restaurantName,
      loginUrl
    );
    console.log('   ✅ Restaurant welcome email sent successfully!\n');

    console.log('📊 Restaurant email testing complete!');
    console.log(`📥 Check ${testEmail} for the test emails.\n`);
    
    if (!process.env.SENDGRID_API_KEY) {
      console.log('⚠️  Note: SendGrid is not configured. Emails were logged to console only.');
      console.log('💡 To send actual emails, set SENDGRID_API_KEY in your .env file.\n');
    }

  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

// Run the test
testRestaurantEmails().then(() => {
  console.log('✨ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 