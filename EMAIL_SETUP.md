# Email Service Setup Guide

This guide will help you set up SendGrid for production email delivery in KitchenSync.

## Prerequisites

- SendGrid account (free tier available at https://sendgrid.com)
- Verified sender email address
- Production domain (optional but recommended)

## Step 1: Create SendGrid Account

1. Go to https://sendgrid.com and sign up for a free account
2. Complete the account verification process
3. Navigate to Settings > API Keys

## Step 2: Generate API Key

1. Click "Create API Key"
2. Give it a name like "KitchenSync Production"
3. Select "Full Access" permissions
4. Copy the API key (you won't be able to see it again!)

## Step 3: Verify Sender Identity

### Option A: Single Sender Verification (Quick Setup)
1. Go to Settings > Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your restaurant details:
   - From Email: noreply@yourrestaurant.com
   - From Name: Your Restaurant Name
   - Reply To: info@yourrestaurant.com
4. Check your email and click the verification link

### Option B: Domain Authentication (Recommended for Production)
1. Go to Settings > Sender Authentication
2. Click "Authenticate Your Domain"
3. Follow the DNS setup instructions
4. Add the required DNS records to your domain provider
5. Verify the domain

## Step 4: Configure Environment Variables

Add these to your production `.env` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key-here
FROM_EMAIL=noreply@yourrestaurant.com

# Frontend URL (for email links)
FRONTEND_URL=https://yourapp.com
```

## Step 5: Test Email Delivery

1. Create a test customer account
2. Check that verification email is sent
3. Make a test reservation
4. Verify confirmation email is received

## Email Templates

The system sends these emails automatically:

### 1. Email Verification
- Sent when a new customer registers
- Contains verification link
- Link expires in 24 hours

### 2. Password Reset
- Sent when customer requests password reset
- Contains reset link
- Link expires in 2 hours

### 3. Reservation Confirmation
- Sent when reservation is created
- Includes all reservation details
- Contains confirmation number

### 4. Welcome Email
- Sent after email verification
- Welcomes customer to the platform

## Monitoring & Troubleshooting

### Check SendGrid Dashboard
- Monitor email delivery status
- View bounces and blocks
- Check spam reports

### Common Issues

1. **Emails not sending**
   - Verify API key is correct
   - Check sender email is verified
   - Ensure environment variables are loaded

2. **Emails going to spam**
   - Complete domain authentication
   - Use a professional from address
   - Avoid spam trigger words

3. **Rate limiting**
   - Free tier: 100 emails/day
   - Monitor usage in SendGrid dashboard
   - Upgrade plan if needed

## Production Checklist

- [ ] SendGrid account created and verified
- [ ] API key generated and secured
- [ ] Sender identity verified
- [ ] Domain authentication completed (optional)
- [ ] Environment variables configured
- [ ] Test emails working
- [ ] Monitoring set up

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys periodically
- Monitor for unusual activity

## Support

- SendGrid Documentation: https://docs.sendgrid.com
- SendGrid Status: https://status.sendgrid.com
- Support: https://support.sendgrid.com 