import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { StripeCheckoutService } from '@/lib/stripe/checkout';
import { Database } from '@/lib/db/connection';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await StripeCheckoutService.getCheckoutSession(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get the subscription from the session
    const subscriptionId = session.subscription as string;
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found in session' },
        { status: 400 }
      );
    }

    // Check if user already has a subscription
    const existingSubscription = await Database.queryOne(
      'SELECT id FROM subscriptions WHERE user_id = $1',
      [user.id]
    );

    if (existingSubscription) {
      // Update existing subscription
      await Database.query(`
        UPDATE subscriptions SET
          stripe_subscription_id = $2,
          stripe_customer_id = $3,
          status = $4,
          current_period_start = $5,
          current_period_end = $6,
          updated_at = NOW()
        WHERE user_id = $1
      `, [
        user.id,
        subscriptionId,
        session.customer as string,
        'active',
        new Date(session.created * 1000),
        new Date(session.created * 1000 + (30 * 24 * 60 * 60 * 1000)) // 30 days from now
      ]);
    } else {
      // Insert new subscription
      await Database.query(`
        INSERT INTO subscriptions (
          user_id, stripe_subscription_id, stripe_customer_id,
          status, current_period_start, current_period_end
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        user.id,
        subscriptionId,
        session.customer as string,
        'active',
        new Date(session.created * 1000),
        new Date(session.created * 1000 + (30 * 24 * 60 * 60 * 1000)) // 30 days from now
      ]);
    }

    // Update user subscription status
    await Database.query(`
      UPDATE users 
      SET subscription_status = 'active', updated_at = NOW()
      WHERE id = $1
    `, [user.id]);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscriptionId,
        status: 'active',
        customer: session.customer
      },
      message: 'Subscription verified and activated successfully'
    });

  } catch (error) {
    console.error('Verify checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
