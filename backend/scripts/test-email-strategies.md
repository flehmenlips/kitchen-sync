# Email Testing Strategies for KitchenSync

## 1. Using the Test Script

First, build the backend to compile TypeScript:
```bash
cd backend
npm run build
```

Then run the test script with your email:
```bash
# Test with your personal email
TEST_EMAIL=your-email@gmail.com node scripts/test-email-service.js

# Or set it in .env file
echo "TEST_EMAIL=your-email@gmail.com" >> .env
node scripts/test-email-service.js
```

## 2. Using Gmail Aliases (Recommended for Testing)

If you have a Gmail account, you can create unlimited test emails using the "+" trick:
- Base email: `yourname@gmail.com`
- Test variations:
  - `yourname+test1@gmail.com`
  - `yourname+customer1@gmail.com`
  - `yourname+reservation@gmail.com`

All these emails will deliver to your main inbox!

## 3. Using Temporary Email Services

For testing without using your real email:

### Free Temporary Email Services:
- **10minutemail.com** - Get a temporary email for 10 minutes
- **temp-mail.org** - Disposable email addresses
- **guerrillamail.com** - Temporary email with API access
- **mailinator.com** - Public inboxes for testing

### Example with Mailinator:
1. Use any email like: `kitchentest123@mailinator.com`
2. Go to: `https://www.mailinator.com/v4/public/inboxes.jsp`
3. Enter `kitchentest123` to view the inbox
4. No signup required!

## 4. Using Email Testing Services (Professional)

For more advanced testing:

### Mailtrap.io (Recommended for Development)
- Catches all emails in a test inbox
- Shows HTML preview
- Checks spam score
- Free tier available

Setup:
1. Sign up at mailtrap.io
2. Get SMTP credentials
3. Use their SMTP settings instead of SendGrid for testing

### SendGrid Test Mode
SendGrid also offers a "Sandbox Mode" for testing:
```javascript
// In your email service, add sandbox mode for testing
const msg = {
  to: email,
  from: fromEmail,
  subject: subject,
  text: text,
  html: html,
  mailSettings: {
    sandboxMode: {
      enable: process.env.SENDGRID_SANDBOX === 'true'
    }
  }
};
```

## 5. Testing Different Scenarios

### Test Customer Registration Flow:
```bash
# 1. Create a customer with a test email
curl -X POST https://kitchen-sync-backend.onrender.com/api/auth/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname+test1@gmail.com",
    "password": "TestPass123!",
    "name": "Test Customer",
    "phone": "555-0123"
  }'

# 2. Check your email for verification
```

### Test Reservation Confirmation:
```bash
# First login to get a token, then create a reservation
# The confirmation email will be sent automatically
```

## 6. Monitoring Email Delivery

### In SendGrid Dashboard:
1. Go to Activity Feed
2. See all sent emails
3. Check delivery status
4. View bounces/blocks

### Common Issues:
- **Bounced**: Email address doesn't exist
- **Blocked**: Email flagged as spam
- **Deferred**: Temporary delivery issue

## 7. Testing Checklist

- [ ] Verification email arrives and links work
- [ ] Password reset email arrives and links work
- [ ] Reservation confirmation has correct details
- [ ] Welcome email is properly formatted
- [ ] Emails display correctly on mobile
- [ ] "From" address is correct
- [ ] No spam warnings
- [ ] Links point to correct production URL

## Quick Test Commands

```bash
# Test all email types at once
cd backend
npm run build
TEST_EMAIL=yourname+kitchen@gmail.com node scripts/test-email-service.js

# Test with production environment
NODE_ENV=production TEST_EMAIL=yourname+prod@gmail.com node scripts/test-email-service.js

# Test with local environment (console only)
TEST_EMAIL=test@example.com node -r dotenv/config scripts/test-email-service.js dotenv_config_path=.env.local
``` 