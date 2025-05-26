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
}

export const emailService = new EmailService(); 