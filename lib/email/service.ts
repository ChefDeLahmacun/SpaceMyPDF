import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create Gmail SMTP transporter with SSL fix
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'spacemypdf@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD // You'll need to generate an App Password
      },
      // Fix SSL certificate issues in development
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"SpaceMyPDF" <${process.env.GMAIL_USER || 'spacemypdf@gmail.com'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(userEmail: string, userName: string, referralCode: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to SpaceMyPDF!</h2>
        <p>Hi ${userName},</p>
        <p>Welcome to SpaceMyPDF! Your account has been successfully created.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Your Account Details:</h3>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Referral Code:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${referralCode}</code></p>
          <p><strong>Free Trial:</strong> 30 days of full access</p>
        </div>

        <h3 style="color: #1f2937;">What's Next?</h3>
        <ul>
          <li>Start adding note space to your PDFs</li>
          <li>Share your referral code to earn bonus months</li>
          <li>Explore all premium features during your trial</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          If you have any questions, feel free to reach out to us at spacemypdf@gmail.com
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: 'Welcome to SpaceMyPDF - Your 30-Day Free Trial Starts Now!',
      html
    });
  }

  // Send trial reminder email
  async sendTrialReminderEmail(userEmail: string, userName: string, daysRemaining: number): Promise<boolean> {
    const urgency = daysRemaining <= 3 ? 'urgent' : daysRemaining <= 7 ? 'warning' : 'info';
    const color = urgency === 'urgent' ? '#dc2626' : urgency === 'warning' ? '#d97706' : '#2563eb';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">${daysRemaining <= 3 ? '⚠️' : '⏰'} Trial Reminder</h2>
        <p>Hi ${userName},</p>
        
        ${daysRemaining === 0 ? `
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Your free trial has ended</h3>
            <p>To continue using SpaceMyPDF, please upgrade to a paid plan.</p>
          </div>
        ` : daysRemaining === 1 ? `
          <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #d97706; margin-top: 0;">Your trial ends tomorrow!</h3>
            <p>Don't lose access to your PDFs. Upgrade now to continue.</p>
          </div>
        ` : `
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">${daysRemaining} days left in your trial</h3>
            <p>Make the most of your remaining trial time!</p>
          </div>
        `}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
             style="background-color: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            ${daysRemaining === 0 ? 'Upgrade Now' : 'Continue to Dashboard'}
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          Questions? Contact us at spacemypdf@gmail.com
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `${daysRemaining === 0 ? 'Trial Ended' : daysRemaining === 1 ? 'Trial Ends Tomorrow' : `${daysRemaining} Days Left`} - SpaceMyPDF`,
      html
    });
  }

  // Send referral bonus email
  async sendReferralBonusEmail(userEmail: string, userName: string, bonusMonths: number): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🎉 Referral Bonus Earned!</h2>
        <p>Hi ${userName},</p>
        <p>Great news! Someone signed up using your referral code.</p>
        
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #059669; margin-top: 0;">You've earned ${bonusMonths} bonus month${bonusMonths > 1 ? 's' : ''}!</h3>
          <p>Your bonus has been added to your account. Keep sharing your referral code to earn more!</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/referrals" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Referral Stats
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          Questions? Contact us at spacemypdf@gmail.com
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `🎉 You earned ${bonusMonths} bonus month${bonusMonths > 1 ? 's' : ''} from referrals!`,
      html
    });
  }

  // Send feature request confirmation
  async sendFeatureRequestConfirmation(userEmail: string, userName: string, requestTitle: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Feature Request Received</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for your feature request! We've received your submission.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Your Request:</h3>
          <p><strong>Title:</strong> ${requestTitle}</p>
          <p><strong>Status:</strong> Under Review</p>
          <p><strong>Bonus Months:</strong> 1 month will be added if approved</p>
        </div>

        <p>We'll review your request and get back to you soon. If approved, you'll receive bonus months added to your account!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/features" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View My Requests
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          Questions? Contact us at spacemypdf@gmail.com
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: 'Feature Request Received - SpaceMyPDF',
      html
    });
  }

  // Helper method to strip HTML tags for text version
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();