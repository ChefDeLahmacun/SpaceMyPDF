import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { StripeSubscriptionService } from '@/lib/stripe/subscriptions';
import { Database } from '@/lib/db/connection';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const reactivateSubscriptionSchema = z.object({
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
    const validationResult = reactivateSubscriptionSchema.safeParse(body);
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

    console.log('Reactivation request:', { userId: user.id, subscriptionId });

    // Verify the subscription belongs to the user
    const subscriptionQuery = `
      SELECT s.*, u.id as user_id
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

    // Reactivate the subscription in Stripe
    await StripeSubscriptionService.reactivateSubscription(subscriptionId);

    // Update subscription status in database
    await Database.query(`
      UPDATE subscriptions 
      SET status = 'active', updated_at = NOW()
      WHERE stripe_subscription_id = $1
    `, [subscriptionId]);

    // Update user subscription status
    await Database.query(`
      UPDATE users 
      SET subscription_status = 'active', updated_at = NOW()
      WHERE id = $1
    `, [user.id]);

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully!',
      subscription: {
        id: subscriptionId,
        status: 'active',
        current_period_end: subscription.current_period_end
      }
    });

  } catch (error) {
    console.error('Reactivate subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
