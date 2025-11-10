import nodemailer from 'nodemailer';
import { NotificationService } from '@/lib/services/notification-service';
import { Database } from '@/lib/db/connection';

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
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.GMAIL_USER || 'spacemypdf@gmail.com',
        pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD
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

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Get user ID from email
  private async getUserIdByEmail(email: string): Promise<string | null> {
    try {
      const user = await Database.queryOne(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      return user?.id || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  // Send email verification email
  async sendVerificationEmail(userEmail: string, userName: string, verificationLink: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✉️ Verify Your Email</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Hi <strong>${userName}</strong>! 👋
          </p>
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Welcome to SpaceMyPDF! Please verify your email address to start using all features.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${verificationLink}" style="color: #4f46e5; word-break: break-all;">${verificationLink}</a>
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} SpaceMyPDF. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '✉️ Verify Your Email - SpaceMyPDF',
      html
    });
  }

  // Send welcome email to new users
  async sendWelcomeEmail(userEmail: string, userName: string, referralCode: string): Promise<boolean> {
    // Check email notification preference
    const userId = await this.getUserIdByEmail(userEmail);
    if (userId) {
      const canSend = await NotificationService.canSendNotification(userId, 'email');
      if (!canSend) {
        return false;
      }
    }
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
    // Check trial reminder preference
    const userId = await this.getUserIdByEmail(userEmail);
    if (userId) {
      const canSend = await NotificationService.canSendNotification(userId, 'trial');
      if (!canSend) {
        return false;
      }
    }
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
    // Check referral updates preference
    const userId = await this.getUserIdByEmail(userEmail);
    if (userId) {
      const canSend = await NotificationService.canSendNotification(userId, 'referral');
      if (!canSend) {
        return false;
      }
    }
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
    // Check email notification preference
    const userId = await this.getUserIdByEmail(userEmail);
    if (userId) {
      const canSend = await NotificationService.canSendNotification(userId, 'email');
      if (!canSend) {
        return false;
      }
    }
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

  // Send trial ending reminder email
  async sendTrialEndingReminder(
    userEmail: string,
    userName: string,
    daysLeft: number,
    trialEndDate: Date
  ): Promise<boolean> {
    // Check trial reminder preference
    const userId = await this.getUserIdByEmail(userEmail);
    if (userId) {
      const canSend = await NotificationService.canSendNotification(userId, 'trial');
      if (!canSend) {
        return false;
      }
    }
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Trial Ending Soon</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your SpaceMyPDF free trial will end in <strong style="color: #e74c3c;">${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong> 
            (${trialEndDate.toLocaleDateString()}).
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Don't lose access to your PDF processing tools! Subscribe now to continue using SpaceMyPDF.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Continue Your Subscription
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Questions? Reply to this email and we'll help you out!
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `Your SpaceMyPDF trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
      html
    });
  }

  // Send payment required email
  async sendPaymentRequiredEmail(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    // Check trial reminder preference (payment required is related to trial ending)
    const userId = await this.getUserIdByEmail(userEmail);
    if (userId) {
      const canSend = await NotificationService.canSendNotification(userId, 'trial');
      if (!canSend) {
        return false;
      }
    }
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Trial Expired</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your SpaceMyPDF free trial has ended. To continue using our PDF processing tools, 
            please subscribe to one of our plans.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Subscribe Now
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Questions? Reply to this email and we'll help you out!
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: 'Your SpaceMyPDF trial has ended - Subscribe to continue',
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