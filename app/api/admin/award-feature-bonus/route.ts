import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/admin-auth';
import { Database } from '@/lib/db/connection';
import { BonusActivityService } from '@/lib/db/queries/bonus-activities';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { featureId, userId } = body;

    if (!featureId || !userId) {
      return NextResponse.json(
        { error: 'Missing featureId or userId' },
        { status: 400 }
      );
    }

    // Check if bonus has already been awarded for this feature
    const checkQuery = `
      SELECT bonus_awarded FROM feature_requests 
      WHERE id = $1
    `;
    const feature = await Database.queryOne(checkQuery, [featureId]);

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    if (feature.bonus_awarded) {
      return NextResponse.json(
        { error: 'Bonus has already been awarded for this feature request' },
        { status: 400 }
      );
    }

    // Get user's current trial end date and feature request details
    const userQuery = `
      SELECT u.trial_ends_at, u.subscription_status, fr.title as feature_title
      FROM users u
      JOIN feature_requests fr ON fr.user_id = u.id
      WHERE u.id = $1 AND fr.id = $2
    `;
    const user = await Database.queryOne(userQuery, [userId, featureId]);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate new trial end date (add 1 month)
    let newTrialEndDate;
    if (user.subscription_status === 'trial' && user.trial_ends_at) {
      const currentEndDate = new Date(user.trial_ends_at);
      newTrialEndDate = new Date(currentEndDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // Add 30 days
    } else if (user.subscription_status === 'trial') {
      // If no trial end date, set it to 30 days from now
      newTrialEndDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
    }
    // For paying members, we don't update trial_ends_at but still record the bonus

    // Start a transaction
    await Database.query('BEGIN');

    try {
      // Update user's trial end date (only for trial users)
      if (user.subscription_status === 'trial' && newTrialEndDate) {
        const updateUserQuery = `
          UPDATE users 
          SET trial_ends_at = $1, updated_at = NOW()
          WHERE id = $2
        `;
        await Database.query(updateUserQuery, [newTrialEndDate.toISOString(), userId]);
      }

      // Mark feature request as bonus awarded
      const updateFeatureQuery = `
        UPDATE feature_requests 
        SET bonus_awarded = TRUE, updated_at = NOW()
        WHERE id = $1
      `;
      await Database.query(updateFeatureQuery, [featureId]);

      // Record bonus activity
      await BonusActivityService.recordFeatureRequestBonus(
        userId,
        user.feature_title,
        featureId
      );

      // Commit transaction
      await Database.query('COMMIT');

      // Send feature request approval email (don't wait for it)
      try {
        const { emailService } = await import('@/lib/email/service');
        const userInfo = await Database.queryOne(
          'SELECT email, name FROM users WHERE id = $1',
          [userId]
        );
        
        if (userInfo) {
          emailService.sendFeatureRequestConfirmation(
            userInfo.email,
            userInfo.name || userInfo.email.split('@')[0],
            user.feature_title
          ).catch(error => {
            console.error('Error sending feature request confirmation email:', error);
          });
        }
      } catch (error) {
        console.error('Error preparing feature request email:', error);
        // Don't fail the bonus award if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Bonus month awarded successfully',
        newTrialEndDate: newTrialEndDate?.toISOString() || null
      });

    } catch (error) {
      // Rollback transaction
      await Database.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Award feature bonus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


