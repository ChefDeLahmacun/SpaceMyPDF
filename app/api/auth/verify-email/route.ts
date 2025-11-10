import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db/connection';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this verification token
    const user = await Database.queryOne(`
      SELECT id, email, email_verified, email_verification_token_expires
      FROM users
      WHERE email_verification_token = $1
    `, [tokenHash]);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        alreadyVerified: true
      });
    }

    // Check if token has expired
    if (new Date() > new Date(user.email_verification_token_expires)) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify the email
    await Database.query(`
      UPDATE users
      SET email_verified = TRUE,
          email_verification_token = NULL,
          email_verification_token_expires = NULL,
          updated_at = NOW()
      WHERE id = $1
    `, [user.id]);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now use all features.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

