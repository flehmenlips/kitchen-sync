require('dotenv').config({ path: '.env.local' });
const { emailService } = require('../dist/services/emailService');

// Get test email from environment or use a default
const TEST_EMAIL = process.env.TEST_EMAIL || process.argv[2] || 'your-email@example.com';

async function testSingleEmail() {
  console.log('🧪 Testing Email Service with Verified Domain\n');
  
  // Check configuration
  const hasResend = !!process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@accounts.remise.farm';
  
  console.log('📋 Configuration:');
  console.log(`   Provider: ${hasResend ? 'Resend ✅' : 'Not configured ❌'}`);
  console.log(`   From Email: ${fromEmail}`);
  console.log(`   To Email: ${TEST_EMAIL}\n`);
  
  if (!hasResend) {
    console.error('❌ RESEND_API_KEY not found!');
    console.log('   Please set RESEND_API_KEY in your .env.local file.\n');
    process.exit(1);
  }
  
  if (!TEST_EMAIL || TEST_EMAIL === 'your-email@example.com') {
    console.error('❌ No test email provided!');
    console.log('   Usage: node scripts/test-single-email.js your-email@example.com');
    console.log('   Or set TEST_EMAIL in .env.local\n');
    process.exit(1);
  }
  
  console.log('📧 Sending test verification email...\n');
  
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/verify-email?token=test-token-123`;
    
    await emailService.sendVerificationEmail(
      TEST_EMAIL,
      'Test User',
      verificationUrl
    );
    
    console.log('✅ Email sent successfully!\n');
    console.log(`📥 Check ${TEST_EMAIL} for the test email.`);
    console.log(`📚 View in Resend Dashboard: https://resend.com/emails\n`);
    
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    
    if (error.message.includes('domain is not verified')) {
      console.log('\n💡 Domain verification issue:');
      console.log('   Make sure accounts.remise.farm is verified in Resend:');
      console.log('   https://resend.com/domains\n');
    } else if (error.message.includes('rate_limit')) {
      console.log('\n💡 Rate limit: Wait a few seconds and try again.\n');
    }
    
    process.exit(1);
  }
}

testSingleEmail()
  .then(() => {
    console.log('✨ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

