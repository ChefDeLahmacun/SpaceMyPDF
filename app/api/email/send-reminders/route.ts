import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db/connection';
import { emailService } from '@/lib/email/service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job or scheduled task
    // Check for authorization (Vercel Cron or manual with secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow requests from Vercel Cron (no auth header) or with valid secret
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron');
    const hasValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;
    
    if (!isVercelCron && !hasValidSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get users whose trials are ending soon
    const usersWithTrialsEnding = await Database.queryMany(`
      SELECT u.id, u.email, u.trial_end
      FROM users u
      WHERE u.subscription_status = 'trial'
        AND u.trial_end IS NOT NULL
        AND u.trial_end > NOW()
        AND u.trial_end <= NOW() + INTERVAL '7 days'
    `);

    const results = [];

    for (const user of usersWithTrialsEnding) {
      try {
        const trialEnd = new Date(user.trial_end);
        const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft === 7) {
          // Send 7-day reminder
          await emailService.sendTrialEndingReminder(
            user.email,
            user.email.split('@')[0],
            daysLeft,
            trialEnd
          );
          results.push({ user: user.email, type: '7-day-reminder', success: true });
        } else if (daysLeft === 3) {
          // Send 3-day reminder
          await emailService.sendTrialEndingReminder(
            user.email,
            user.email.split('@')[0],
            daysLeft,
            trialEnd
          );
          results.push({ user: user.email, type: '3-day-reminder', success: true });
        } else if (daysLeft === 1) {
          // Send 1-day reminder
          await emailService.sendTrialEndingReminder(
            user.email,
            user.email.split('@')[0],
            daysLeft,
            trialEnd
          );
          results.push({ user: user.email, type: '1-day-reminder', success: true });
        }
      } catch (error) {
        console.error(`Error sending reminder to ${user.email}:`, error);
        results.push({ user: user.email, type: 'reminder', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // Get users whose trials have ended
    const expiredTrials = await Database.queryMany(`
      SELECT u.id, u.email, u.trial_end
      FROM users u
      WHERE u.subscription_status = 'trial'
        AND u.trial_end IS NOT NULL
        AND u.trial_end <= NOW()
    `);

    for (const user of expiredTrials) {
      try {
        // Send payment required email
        await emailService.sendPaymentRequiredEmail(
          user.email,
          user.email.split('@')[0]
        );

        // Update user status to expired
        await Database.query(`
          UPDATE users 
          SET subscription_status = 'expired', updated_at = NOW()
          WHERE id = $1
        `, [user.id]);

        results.push({ user: user.email, type: 'payment-required', success: true });
      } catch (error) {
        console.error(`Error sending payment required email to ${user.email}:`, error);
        results.push({ user: user.email, type: 'payment-required', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email reminders processed',
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Email reminders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
