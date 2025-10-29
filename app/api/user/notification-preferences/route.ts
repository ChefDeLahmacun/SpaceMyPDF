import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db/connection';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

// GET notification preferences
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get or create notification preferences
    let preferences = await Database.queryOne(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [decoded.userId]
    );

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await Database.queryOne(
        `INSERT INTO notification_preferences (user_id, email_notifications, trial_reminders, referral_updates)
         VALUES ($1, true, true, true)
         RETURNING *`,
        [decoded.userId]
      );
    }

    return NextResponse.json({
      success: true,
      preferences: {
        emailNotifications: preferences.email_notifications,
        trialReminders: preferences.trial_reminders,
        referralUpdates: preferences.referral_updates
      }
    });

  } catch (error) {
    console.error('Get notification preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { emailNotifications, trialReminders, referralUpdates } = body;

    // Update or create preferences
    const preferences = await Database.queryOne(
      `INSERT INTO notification_preferences (user_id, email_notifications, trial_reminders, referral_updates, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         email_notifications = $2,
         trial_reminders = $3,
         referral_updates = $4,
         updated_at = NOW()
       RETURNING *`,
      [decoded.userId, emailNotifications, trialReminders, referralUpdates]
    );

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated',
      preferences: {
        emailNotifications: preferences.email_notifications,
        trialReminders: preferences.trial_reminders,
        referralUpdates: preferences.referral_updates
      }
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

