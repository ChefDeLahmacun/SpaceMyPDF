import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db/connection';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, newPassword } = validationResult.data;

    // Hash the token to compare with database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const resetRecord = await Database.queryOne(`
      SELECT prt.user_id, prt.expires_at, u.email, u.name
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token_hash = $1 AND prt.expires_at > NOW()
    `, [tokenHash]);

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await Database.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, resetRecord.user_id]
    );

    // Delete used reset token
    await Database.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1',
      [resetRecord.user_id]
    );

    console.log(`Password reset successfully for user: ${resetRecord.email}`);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

