import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db/connection';
import { authenticateRequest } from '@/lib/middleware/auth';
import { EmailService } from '@/lib/email/service';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const emailService = new EmailService();

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user!;

    // Check if already verified
    const dbUser = await Database.queryOne(
      'SELECT email_verified FROM users WHERE id = $1',
      [user.id]
    );

    if (dbUser.email_verified) {
      return NextResponse.json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token
    await Database.query(`
      UPDATE users
      SET email_verification_token = $1,
          email_verification_token_expires = $2,
          updated_at = NOW()
      WHERE id = $3
    `, [tokenHash, expiresAt, user.id]);

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    await emailService.sendVerificationEmail(user.email, user.name, verificationLink);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to resend verification email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

