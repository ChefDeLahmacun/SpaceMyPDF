import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/admin-auth';
import { Database } from '@/lib/db/connection';
import { BonusActivityService } from '@/lib/db/queries/bonus-activities';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const grantPremiumSchema = z.object({
  userId: z.string().uuid().optional(),
  referralCode: z.string().optional(),
  duration: z.enum(['1month', '3months', '6months', '1year', 'lifetime']).default('1year')
}).refine(data => data.userId || data.referralCode, {
  message: 'Either userId or referralCode must be provided'
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = grantPremiumSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { userId, referralCode, duration } = validationResult.data;

    // Find the user
    let targetUser;
    if (userId) {
      targetUser = await Database.queryOne(
        'SELECT id, email, name, subscription_status FROM users WHERE id = $1',
        [userId]
      );
    } else if (referralCode) {
      targetUser = await Database.queryOne(
        'SELECT id, email, name, subscription_status FROM users WHERE referral_code = $1',
        [referralCode]
      );
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate expiry date based on duration
    let expiryDate;
    switch (duration) {
      case '1month':
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        break;
      case '3months':
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        break;
      case '6months':
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6);
        break;
      case '1year':
        expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        break;
      case 'lifetime':
        expiryDate = new Date('2099-12-31'); // Far future date
        break;
    }

    // Update user to have premium access
    await Database.query(`
      UPDATE users 
      SET 
        subscription_status = 'active',
        trial_ends_at = $1,
        admin_granted_premium = TRUE,
        admin_premium_expires_at = $2,
        updated_at = NOW()
      WHERE id = $3
    `, [expiryDate, expiryDate, targetUser.id]);

    // Log the admin action
    await Database.query(`
      INSERT INTO admin_actions (
        admin_id,
        action_type,
        target_user_id,
        details,
        created_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [
      authResult.user!.id,
      'grant_premium',
      targetUser.id,
      JSON.stringify({ duration, expiryDate })
    ]);

    // Create a user-visible activity record
    // Using recordBonusActivity directly for custom message (not using recordAdminBonus since it's not bonus months)
    await BonusActivityService.recordBonusActivity(
      targetUser.id,
      'admin_award',
      'admin_grant',
      0, // Not bonus months - it's direct premium access
      `Admin granted premium access (${duration}) - expires ${expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
      authResult.user!.id
    );

    return NextResponse.json({
      success: true,
      message: `Premium membership (${duration}) granted to ${targetUser.email}`,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        expiresAt: expiryDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Grant premium error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Revoke admin-granted premium
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user info
    const user = await Database.queryOne(
      'SELECT id, email, admin_granted_premium FROM users WHERE id = $1',
      [userId]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.admin_granted_premium) {
      return NextResponse.json(
        { error: 'User does not have admin-granted premium' },
        { status: 400 }
      );
    }

    // Get the user's original trial end date (created_at + 30 days)
    const userData = await Database.queryOne(
      'SELECT created_at FROM users WHERE id = $1',
      [userId]
    );

    const originalTrialEnd = new Date(userData.created_at);
    originalTrialEnd.setDate(originalTrialEnd.getDate() + 30);

    // Revoke premium - restore original trial or set to expired
    const result = await Database.query(`
      UPDATE users 
      SET 
        subscription_status = CASE 
          WHEN $2 > NOW() THEN 'trial'
          ELSE 'expired'
        END,
        trial_ends_at = $2,
        admin_granted_premium = FALSE,
        admin_premium_expires_at = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING subscription_status
    `, [userId, originalTrialEnd]);

    // Log the action
    await Database.query(`
      INSERT INTO admin_actions (
        admin_id,
        action_type,
        target_user_id,
        details,
        created_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [
      authResult.user!.id,
      'revoke_premium',
      userId,
      JSON.stringify({ previousStatus: 'active' })
    ]);

    return NextResponse.json({
      success: true,
      message: `Premium membership revoked from ${user.email}`,
      newStatus: result.rows[0].subscription_status
    });

  } catch (error) {
    console.error('Revoke premium error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

