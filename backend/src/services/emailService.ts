interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Placeholder email service - in production, integrate with SendGrid, AWS SES, etc.
export class EmailService {
  private async sendEmail(options: EmailOptions): Promise<void> {
    // In development, just log the email
    console.log('📧 Email Service - Sending email:');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content: ${options.text || 'See HTML content'}`);
    
    // TODO: Integrate with actual email service
    // Example with SendGrid:
    // const msg = {
    //   to: options.to,
    //   from: process.env.FROM_EMAIL,
    //   subject: options.subject,
    //   text: options.text,
    //   html: options.html,
    // };
    // await sgMail.send(msg);
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
          <p><strong>Date:</strong> ${reservationDetails.date}</p>
          <p><strong>Time:</strong> ${reservationDetails.time}</p>
          <p><strong>Party Size:</strong> ${reservationDetails.partySize} guests</p>
          ${reservationDetails.specialRequests ? `<p><strong>Special Requests:</strong> ${reservationDetails.specialRequests}</p>` : ''}
        </div>
        <p>We look forward to seeing you!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Seabreeze Kitchen<br>
          123 Ocean Drive, Beach City<br>
          Phone: (555) 123-4567
        </p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
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
          Phone: (555) 123-4567
        </p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}

export const emailService = new EmailService(); 