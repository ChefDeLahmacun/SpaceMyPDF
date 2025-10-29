import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { StripeSubscriptionService } from '@/lib/stripe/subscriptions';
import { Database } from '@/lib/db/connection';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required')
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const user = authResult.user!;
    const body = await request.json();

    // Validate input
    const validationResult = cancelSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { subscriptionId } = validationResult.data;

    console.log('Cancellation request:', { userId: user.id, subscriptionId });

    // Verify the subscription belongs to the user
    const subscriptionQuery = `
      SELECT s.*, u.id as user_id, u.trial_ends_at, u.created_at
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.stripe_subscription_id = $1 AND u.id = $2
    `;
    
    const subscription = await Database.queryOne(subscriptionQuery, [subscriptionId, user.id]);
    
    console.log('Found subscription:', subscription);
    
    if (!subscription) {
      // Let's also check what subscriptions exist for this user
      const userSubscriptions = await Database.queryMany(
        'SELECT stripe_subscription_id, status FROM subscriptions WHERE user_id = $1',
        [user.id]
      );
      console.log('User subscriptions:', userSubscriptions);
      
      return NextResponse.json(
        { error: 'Subscription not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Cancel the subscription in Stripe (at period end)
    const cancelledSubscription = await StripeSubscriptionService.cancelSubscription(subscriptionId, false);

    // Update subscription status in database - mark as cancelled
    await Database.query(`
      UPDATE subscriptions 
      SET status = 'cancelled', updated_at = NOW()
      WHERE stripe_subscription_id = $1
    `, [subscriptionId]);

    // Revert user to trial status so they can still use trial features
    // Check if user has trial days left
    const userTrialEnd = new Date(subscription.trial_ends_at || subscription.created_at);
    const now = new Date();
    
    if (userTrialEnd > now) {
      // User still has trial days left, revert to trial
      await Database.query(`
        UPDATE users 
        SET subscription_status = 'trial', updated_at = NOW()
        WHERE id = $1
      `, [user.id]);
    } else {
      // No trial days left, set to expired
      await Database.query(`
        UPDATE users 
        SET subscription_status = 'expired', updated_at = NOW()
        WHERE id = $1
      `, [user.id]);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully. You will retain trial access until your trial period ends.',
      subscription: {
        id: subscriptionId,
        status: 'cancelled',
        current_period_end: subscription.current_period_end
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
