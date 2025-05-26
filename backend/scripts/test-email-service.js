require('dotenv').config({ path: '.env' }); // Use production config
const { emailService } = require('../dist/services/emailService');

// Test email configuration
const TEST_EMAIL = process.env.TEST_EMAIL || 'your-test-email@example.com';
const TEST_NAME = 'Test User';

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration\n');
  
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY is not set!');
    console.log('   Please set this environment variable to test email sending.');
    return;
  }

  if (!process.env.FROM_EMAIL) {
    console.warn('⚠️  FROM_EMAIL is not set, using default: noreply@seabreezekitchen.com');
  }

  if (!process.env.FRONTEND_URL) {
    console.warn('⚠️  FRONTEND_URL is not set, using default for test links');
  }

  console.log('✅ SendGrid configuration found');
  console.log(`📧 Sending test emails to: ${TEST_EMAIL}`);
  console.log(`📤 From email: ${process.env.FROM_EMAIL || 'noreply@seabreezekitchen.com'}\n`);

  // Test 1: Verification Email
  try {
    console.log('1️⃣  Testing Verification Email...');
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/verify-email?token=test-verification-token`;
    await emailService.sendVerificationEmail(TEST_EMAIL, TEST_NAME, verificationUrl);
    console.log('   ✅ Verification email sent successfully!\n');
  } catch (error) {
    console.error('   ❌ Verification email failed:', error.message, '\n');
  }

  // Test 2: Password Reset Email
  try {
    console.log('2️⃣  Testing Password Reset Email...');
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/reset-password?token=test-reset-token`;
    await emailService.sendPasswordResetEmail(TEST_EMAIL, TEST_NAME, resetUrl);
    console.log('   ✅ Password reset email sent successfully!\n');
  } catch (error) {
    console.error('   ❌ Password reset email failed:', error.message, '\n');
  }

  // Test 3: Reservation Confirmation Email
  try {
    console.log('3️⃣  Testing Reservation Confirmation Email...');
    const reservationDetails = {
      date: 'Saturday, June 1, 2025',
      time: '7:00 PM',
      partySize: 4,
      specialRequests: 'Window table preferred',
      confirmationNumber: 'SBK123456'
    };
    await emailService.sendReservationConfirmation(TEST_EMAIL, TEST_NAME, reservationDetails);
    console.log('   ✅ Reservation confirmation email sent successfully!\n');
  } catch (error) {
    console.error('   ❌ Reservation confirmation email failed:', error.message, '\n');
  }

  // Test 4: Welcome Email
  try {
    console.log('4️⃣  Testing Welcome Email...');
    await emailService.sendWelcomeEmail(TEST_EMAIL, TEST_NAME);
    console.log('   ✅ Welcome email sent successfully!\n');
  } catch (error) {
    console.error('   ❌ Welcome email failed:', error.message, '\n');
  }

  console.log('📊 Email testing complete!');
  console.log(`📥 Check ${TEST_EMAIL} for the test emails.`);
  
  // Additional debugging info
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n💡 Tip: In development mode, emails are also logged to console.');
  }
}

// Run the test
testEmailService()
  .then(() => {
    console.log('\n✨ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script error:', error);
    process.exit(1);
  }); 