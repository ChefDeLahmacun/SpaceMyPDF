import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db/connection';
import { EmailService } from '@/lib/email/service';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const emailService = new EmailService();

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Check if user exists
    const user = await Database.queryOne(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    // Always return success even if user doesn't exist (security best practice)
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in database
    await Database.query(`
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        token_hash = $2,
        expires_at = $3,
        created_at = NOW()
    `, [user.id, resetTokenHash, expiresAt]);

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send password reset email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Reset Your Password</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Hi <strong>${user.name}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            We received a request to reset your password for your SpaceMyPDF account. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Reset Password
            </a>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⏰ This link expires in 1 hour</strong><br>
              For your security, this password reset link will expire at <strong>${expiresAt.toLocaleString()}</strong>
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #3b82f6; font-size: 12px; word-break: break-all; background: #eff6ff; padding: 10px; border-radius: 4px; margin: 10px 0 20px 0;">
            ${resetLink}
          </p>
          
          <div style="background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #991b1b; margin: 0; font-size: 14px;">
              <strong>🚨 Didn't request this?</strong><br>
              If you didn't ask to reset your password, you can safely ignore this email. Your password won't change.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Questions? Contact us at <a href="mailto:spacemypdf@gmail.com" style="color: #3b82f6; text-decoration: none;">spacemypdf@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      await emailService.sendEmail({
        to: user.email,
        subject: 'Reset Your Password - SpaceMyPDF',
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails - still return success for security
    }


    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
      // Remove this in production - only for development
      devResetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

