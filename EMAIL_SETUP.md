# Email Service Setup Guide

This guide will help you set up email delivery for KitchenSync. We support **Resend** (recommended) and **SendGrid** (legacy).

## Quick Start: Resend (Recommended) ⭐

Resend is our recommended email service provider for modern applications.

### Why Resend?
- ✅ **Better Developer Experience** - Clean, modern API
- ✅ **Free Tier** - 3,000 emails/month free
- ✅ **TypeScript Support** - Built-in TypeScript types
- ✅ **Simple Setup** - No complex configuration needed
- ✅ **Great Documentation** - Easy to understand and use

### Step 1: Create Resend Account

1. Go to [https://resend.com](https://resend.com) and sign up
2. Complete email verification
3. Navigate to **API Keys** in the dashboard

### Step 2: Generate API Key

1. Click **Create API Key**
2. Give it a name like "KitchenSync Production"
3. Select permissions (default is fine)
4. Copy the API key (starts with `re_`)

### Step 3: Verify Domain (Production)

For production, you'll need to verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records provided by Resend to your domain provider
5. Wait for verification (usually a few minutes)

**Quick Testing**: For immediate testing, you can use Resend's test domain:
- `onboarding@resend.dev` (no verification needed)

### Step 4: Configure Environment Variables

Add these to your `.env.local` (development) or `.env` (production):

```bash
# Resend Configuration (Recommended)
RESEND_API_KEY=re_your-api-key-here

# Email Configuration
FROM_EMAIL=noreply@yourdomain.com
# Or for testing:
# FROM_EMAIL=onboarding@resend.dev

# Optional: Reply-to address
REPLY_TO_EMAIL=support@yourdomain.com

# Frontend URL (for email links)
FRONTEND_URL=https://yourapp.com
```

### Step 5: Test Email Delivery

Run the test script:

```bash
# Build the backend first
cd backend
npm run build

# Run email tests
npm run test:email:local
```

Or manually:
```bash
node scripts/test-email-service.js
```

---

## Alternative: SendGrid (Legacy Support)

If you prefer SendGrid or already have it configured, it's still supported as a fallback.

### Step 1: Create SendGrid Account

1. Go to [https://sendgrid.com](https://sendgrid.com) and sign up
2. Complete account verification
3. Navigate to Settings > API Keys

### Step 2: Generate API Key

1. Click "Create API Key"
2. Give it a name like "KitchenSync Production"
3. Select "Full Access" permissions
4. Copy the API key (starts with `SG.`)

### Step 3: Verify Sender Identity

**Option A: Single Sender Verification (Quick Setup)**
1. Go to Settings > Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your restaurant details
4. Check your email and click the verification link

**Option B: Domain Authentication (Recommended for Production)**
1. Go to Settings > Sender Authentication
2. Click "Authenticate Your Domain"
3. Follow the DNS setup instructions
4. Add DNS records to your domain provider
5. Verify the domain

### Step 4: Configure Environment Variables

```bash
# SendGrid Configuration (Legacy)
SENDGRID_API_KEY=SG.your-api-key-here
FROM_EMAIL=noreply@yourrestaurant.com

# Frontend URL
FRONTEND_URL=https://yourapp.com
```

**Note**: If both `RESEND_API_KEY` and `SENDGRID_API_KEY` are set, Resend will be used (priority).

---

## Email Templates

The system automatically sends these emails:

### 1. Email Verification
- **Sent when**: New customer registers
- **Contains**: Verification link
- **Expires**: 24 hours

### 2. Password Reset
- **Sent when**: Customer requests password reset
- **Contains**: Reset link
- **Expires**: 2 hours

### 3. Reservation Confirmation
- **Sent when**: Reservation is created
- **Contains**: Reservation details, confirmation number
- **Includes**: Date, time, party size, special requests

### 4. Welcome Email
- **Sent when**: Email is verified
- **Contains**: Welcome message and platform features

### 5. Restaurant Verification (Platform)
- **Sent when**: Restaurant signs up
- **Contains**: Verification link for trial activation

### 6. Restaurant Welcome (Platform)
- **Sent when**: Restaurant email is verified
- **Contains**: Welcome message and setup instructions

---

## Monitoring & Troubleshooting

### Resend Dashboard
- **URL**: https://resend.com/emails
- Monitor email delivery status
- View email logs and analytics
- Check for bounces or blocks

### SendGrid Dashboard
- **URL**: https://app.sendgrid.com
- Monitor email delivery status
- View bounces and blocks
- Check spam reports

### Common Issues

#### 1. Emails not sending
- ✅ Verify API key is correct
- ✅ Check sender email is verified
- ✅ Ensure environment variables are loaded
- ✅ Check console logs for error messages

#### 2. Emails going to spam
- ✅ Complete domain authentication
- ✅ Use a professional from address
- ✅ Avoid spam trigger words
- ✅ Set up SPF/DKIM records (Resend does this automatically)

#### 3. Rate limiting
- **Resend Free**: 3,000 emails/month
- **SendGrid Free**: 100 emails/day
- Monitor usage in respective dashboards
   - Upgrade plan if needed

#### 4. Development vs Production
- In development, emails are logged to console
- Set `NODE_ENV=production` for actual sending
- Use test email addresses during development

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | Yes* | Resend API key | `re_1234567890abcdef` |
| `SENDGRID_API_KEY` | Yes* | SendGrid API key (fallback) | `SG.1234567890abcdef` |
| `FROM_EMAIL` | Yes | Sender email address | `noreply@yourdomain.com` |
| `REPLY_TO_EMAIL` | No | Reply-to address | `support@yourdomain.com` |
| `EMAIL_FROM` | No | Alias for FROM_EMAIL | `noreply@yourdomain.com` |
| `EMAIL_REPLY_TO` | No | Alias for REPLY_TO_EMAIL | `support@yourdomain.com` |
| `FRONTEND_URL` | Yes | Frontend URL for email links | `https://yourapp.com` |
| `TEST_EMAIL` | No | Test email for scripts | `test@example.com` |

*At least one email provider API key is required

---

## Production Checklist

- [ ] Email provider account created (Resend recommended)
- [ ] API key generated and secured
- [ ] Domain verified (for production)
- [ ] Environment variables configured
- [ ] Test emails working
- [ ] Monitoring set up
- [ ] SPF/DKIM records configured (automatic with Resend)

---

## Security Notes

- ✅ Never commit API keys to version control
- ✅ Use environment variables for all sensitive data
- ✅ Rotate API keys periodically
- ✅ Monitor for unusual activity
- ✅ Use different keys for development and production

---

## Support & Resources

### Resend
- **Documentation**: https://resend.com/docs
- **Dashboard**: https://resend.com/emails
- **Status**: https://status.resend.com
- **Support**: support@resend.com

### SendGrid
- **Documentation**: https://docs.sendgrid.com
- **Dashboard**: https://app.sendgrid.com
- **Status**: https://status.sendgrid.com
- **Support**: https://support.sendgrid.com

---

## Migration from SendGrid to Resend

If you're currently using SendGrid and want to switch to Resend:

1. **Create Resend account** and get API key
2. **Add `RESEND_API_KEY`** to your environment variables
3. **Remove or comment out `SENDGRID_API_KEY`** (optional - Resend takes priority)
4. **Test email delivery** using the test script
5. **Verify domain** in Resend dashboard (for production)
6. **Update `FROM_EMAIL`** if needed
7. **Monitor** email delivery in Resend dashboard

The code automatically uses Resend if `RESEND_API_KEY` is set, so no code changes are needed!
