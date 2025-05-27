import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Placeholder email service - in production, integrate with SendGrid, AWS SES, etc.
export class EmailService {
  constructor() {
    // Initialize SendGrid with API key if available
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      console.log('✅ SendGrid initialized for email delivery');
    } else {
      console.warn('⚠️ SENDGRID_API_KEY not set - emails will be logged only');
    }
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    const fromEmail = process.env.FROM_EMAIL || 'noreply@seabreezekitchen.com';
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Always log in development
    if (isDevelopment) {
      console.log('📧 Email Service - Sending email:');
      console.log(`To: ${options.to}`);
      console.log(`From: ${fromEmail}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content: ${options.text || 'See HTML content'}`);
    }
    
    // Send actual email if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        const msg = {
          to: options.to,
          from: fromEmail,
          subject: options.subject,
          text: options.text,
          html: options.html,
        };
        
        await sgMail.send(msg);
        console.log(`✅ Email sent successfully to ${options.to}`);
      } catch (error) {
        console.error('❌ SendGrid error:', error);
        // Don't throw in production to avoid breaking the flow
        if (isDevelopment) {
          throw error;
        }
      }
    }
  }

  async sendVerificationEmail(email: string, name: string, verificationUrl: string): Promise<void> {
    const subject = 'Verify your email - Seabreeze Kitchen';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Seabreeze Kitchen, ${name}!</h2>
        <p>Thank you for creating an account. Please verify your email address by clicking the link below:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account with Seabreeze Kitchen, please ignore this email.
        </p>
      </div>
    `;
    
    const text = `
Welcome to Seabreeze Kitchen, ${name}!

Please verify your email address by clicking this link:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with Seabreeze Kitchen, please ignore this email.
    `.trim();

    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<void> {
    const subject = 'Reset your password - Seabreeze Kitchen';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below to create a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 2 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          If you didn't request a password reset, please ignore this email. Your password won't be changed.
        </p>
      </div>
    `;
    
    const text = `
Password Reset Request

Hi ${name},

We received a request to reset your password. Click this link to create a new password:
${resetUrl}

This link will expire in 2 hours.

If you didn't request a password reset, please ignore this email. Your password won't be changed.
    `.trim();

    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendReservationConfirmation(
    email: string, 
    name: string, 
    reservationDetails: {
      date: string;
      time: string;
      partySize: number;
      specialRequests?: string;
      confirmationNumber?: string;
    }
  ): Promise<void> {
    const subject = 'Reservation Confirmed - Seabreeze Kitchen';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reservation Confirmed!</h2>
        <p>Dear ${name},</p>
        <p>Your reservation at Seabreeze Kitchen has been confirmed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Reservation Details</h3>
          ${reservationDetails.confirmationNumber ? `<p><strong>Confirmation #:</strong> ${reservationDetails.confirmationNumber}</p>` : ''}
          <p><strong>Date:</strong> ${reservationDetails.date}</p>
          <p><strong>Time:</strong> ${reservationDetails.time}</p>
          <p><strong>Party Size:</strong> ${reservationDetails.partySize} guests</p>
          ${reservationDetails.specialRequests ? `<p><strong>Special Requests:</strong> ${reservationDetails.specialRequests}</p>` : ''}
        </div>
        <p>We look forward to seeing you!</p>
        <p>If you need to modify or cancel your reservation, please call us at (555) 123-4567.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Seabreeze Kitchen<br>
          123 Ocean Drive, Beach City<br>
          Phone: (555) 123-4567<br>
          <a href="https://seabreezekitchen.com">www.seabreezekitchen.com</a>
        </p>
      </div>
    `;

    const text = `
Reservation Confirmed!

Dear ${name},

Your reservation at Seabreeze Kitchen has been confirmed.

Reservation Details:
${reservationDetails.confirmationNumber ? `Confirmation #: ${reservationDetails.confirmationNumber}` : ''}
Date: ${reservationDetails.date}
Time: ${reservationDetails.time}
Party Size: ${reservationDetails.partySize} guests
${reservationDetails.specialRequests ? `Special Requests: ${reservationDetails.specialRequests}` : ''}

We look forward to seeing you!

If you need to modify or cancel your reservation, please call us at (555) 123-4567.

Seabreeze Kitchen
123 Ocean Drive, Beach City
Phone: (555) 123-4567
www.seabreezekitchen.com
    `.trim();

    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Seabreeze Kitchen!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Seabreeze Kitchen!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for creating an account with us. We're excited to have you as part of our community!</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Make and manage reservations online</li>
          <li>View your dining history</li>
          <li>Save your preferences</li>
          <li>Receive exclusive offers and updates</li>
        </ul>
        <p>We look forward to serving you soon!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Seabreeze Kitchen<br>
          123 Ocean Drive, Beach City<br>
          Phone: (555) 123-4567<br>
          <a href="https://seabreezekitchen.com">www.seabreezekitchen.com</a>
        </p>
      </div>
    `;

    const text = `
Welcome to Seabreeze Kitchen!

Hi ${name},

Thank you for creating an account with us. We're excited to have you as part of our community!

With your account, you can:
- Make and manage reservations online
- View your dining history
- Save your preferences
- Receive exclusive offers and updates

We look forward to serving you soon!

Seabreeze Kitchen
123 Ocean Drive, Beach City
Phone: (555) 123-4567
www.seabreezekitchen.com
    `.trim();

    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendRestaurantVerificationEmail(email: string, name: string, restaurantName: string, verificationUrl: string): Promise<void> {
    const subject = 'Verify your KitchenSync account';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #1976d2; margin: 0;">KitchenSync</h1>
          <p style="color: #666; margin: 5px 0;">Restaurant Management Platform</p>
        </div>
        
        <h2>Welcome to KitchenSync, ${name}!</h2>
        <p>Thank you for registering <strong>${restaurantName}</strong> with KitchenSync.</p>
        <p>Please verify your email address to activate your account and start your 14-day free trial:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${verificationUrl}" 
             style="background-color: #1976d2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
            Verify Email & Start Trial
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
        
        <p><strong>This link will expire in 24 hours.</strong></p>
        
        <div style="background-color: #f0f7ff; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1976d2;">What happens next?</h3>
          <ol>
            <li>Click the verification link above</li>
            <li>You'll be taken to your welcome dashboard</li>
            <li>We'll set up sample data to help you explore</li>
            <li>Start using all KitchenSync features immediately</li>
          </ol>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px; text-align: center;">
          If you didn't create an account with KitchenSync, please ignore this email.<br>
          Need help? Contact us at support@kitchensync.app
        </p>
      </div>
    `;
    
    const text = `
Welcome to KitchenSync, ${name}!

Thank you for registering ${restaurantName} with KitchenSync.

Please verify your email address to activate your account and start your 14-day free trial:

${verificationUrl}

This link will expire in 24 hours.

What happens next?
1. Click the verification link above
2. You'll be taken to your welcome dashboard
3. We'll set up sample data to help you explore
4. Start using all KitchenSync features immediately

If you didn't create an account with KitchenSync, please ignore this email.
Need help? Contact us at support@kitchensync.app
    `.trim();

    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendRestaurantWelcomeEmail(email: string, name: string, restaurantName: string, loginUrl: string): Promise<void> {
    const subject = `Welcome to KitchenSync - ${restaurantName} is ready!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #1976d2; margin: 0;">KitchenSync</h1>
          <p style="color: #666; margin: 5px 0;">Restaurant Management Platform</p>
        </div>
        
        <h2>Your restaurant is all set up! 🎉</h2>
        <p>Hi ${name},</p>
        <p><strong>${restaurantName}</strong> is now active on KitchenSync. Your 14-day free trial has officially started!</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${loginUrl}" 
             style="background-color: #4caf50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
            Go to Your Dashboard
          </a>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0;">We've set up your restaurant with:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Sample recipes</strong> to explore CookBook</li>
            <li><strong>A starter menu</strong> in MenuBuilder</li>
            <li><strong>Example reservations</strong> to test TableFarm</li>
            <li><strong>Prep board columns</strong> for AgileChef</li>
            <li><strong>Basic settings</strong> ready to customize</li>
          </ul>
        </div>
        
        <h3>Your next steps:</h3>
        <ol>
          <li><strong>Explore the dashboard</strong> - Get familiar with the interface</li>
          <li><strong>Customize settings</strong> - Add your logo and brand colors</li>
          <li><strong>Import your recipes</strong> - Build your recipe database</li>
          <li><strong>Create your menus</strong> - Design beautiful menus</li>
          <li><strong>Invite your team</strong> - Add staff members</li>
        </ol>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0;"><strong>Pro tip:</strong> Start with the Settings page to personalize your restaurant's profile and branding.</p>
        </div>
        
        <h3>Need help getting started?</h3>
        <ul>
          <li>📚 Check our <a href="https://docs.kitchensync.app">documentation</a></li>
          <li>🎥 Watch <a href="https://kitchensync.app/tutorials">tutorial videos</a></li>
          <li>💬 Chat with support at support@kitchensync.app</li>
          <li>📅 Book a <a href="https://calendly.com/kitchensync/onboarding">free onboarding call</a></li>
        </ul>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="text-align: center; color: #666;">
          <strong>Your trial ends on: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong><br>
          No credit card required during trial • Cancel anytime
        </p>
        
        <p style="color: #666; font-size: 14px; text-align: center;">
          © KitchenSync - Restaurant Management Made Simple<br>
          <a href="https://kitchensync.app" style="color: #1976d2;">kitchensync.app</a> | support@kitchensync.app
        </p>
      </div>
    `;

    const text = `
Your restaurant is all set up! 🎉

Hi ${name},

${restaurantName} is now active on KitchenSync. Your 14-day free trial has officially started!

Go to Your Dashboard: ${loginUrl}

We've set up your restaurant with:
- Sample recipes to explore CookBook
- A starter menu in MenuBuilder
- Example reservations to test TableFarm
- Prep board columns for AgileChef
- Basic settings ready to customize

Your next steps:
1. Explore the dashboard - Get familiar with the interface
2. Customize settings - Add your logo and brand colors
3. Import your recipes - Build your recipe database
4. Create your menus - Design beautiful menus
5. Invite your team - Add staff members

Pro tip: Start with the Settings page to personalize your restaurant's profile and branding.

Need help getting started?
- Check our documentation: https://docs.kitchensync.app
- Watch tutorial videos: https://kitchensync.app/tutorials
- Chat with support at support@kitchensync.app
- Book a free onboarding call: https://calendly.com/kitchensync/onboarding

Your trial ends on: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
No credit card required during trial • Cancel anytime

© KitchenSync - Restaurant Management Made Simple
kitchensync.app | support@kitchensync.app
    `.trim();

    await this.sendEmail({ to: email, subject, html, text });
  }
}

export const emailService = new EmailService(); 