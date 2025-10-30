import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/config';
import { Database } from '@/lib/db/connection';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.error(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (!userId) {
      console.error('No userId in checkout session metadata');
      return;
    }

    // Get subscription details
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      console.error('No subscription ID in checkout session');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update or create subscription in database
    await Database.query(`
      INSERT INTO subscriptions (
        user_id,
        stripe_subscription_id,
        stripe_customer_id,
        status,
        plan_type,
        current_period_start,
        current_period_end,
        cancel_at_period_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (stripe_subscription_id) 
      DO UPDATE SET
        status = $4,
        current_period_start = $6,
        current_period_end = $7,
        cancel_at_period_end = $8,
        updated_at = NOW()
    `, [
      userId,
      subscription.id,
      subscription.customer,
      subscription.status,
      plan || 'monthly',
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.cancel_at_period_end
    ]);

    // Update user status
    await Database.query(`
      UPDATE users 
      SET subscription_status = 'active', updated_at = NOW()
      WHERE id = $1
    `, [userId]);

  } catch (error) {
    console.error('Error handling checkout complete:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Update subscription in database
    await Database.query(`
      UPDATE subscriptions 
      SET 
        status = $1,
        current_period_start = $2,
        current_period_end = $3,
        cancel_at_period_end = $4,
        updated_at = NOW()
      WHERE stripe_subscription_id = $5
    `, [
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.cancel_at_period_end,
      subscription.id
    ]);

    // Update user status based on subscription status
    const subscriptionRecord = await Database.queryOne(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscription.id]
    );

    if (subscriptionRecord) {
      let userStatus = 'trial';
      if (subscription.status === 'active') {
        userStatus = 'active';
      } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
        userStatus = 'expired';
      }

      await Database.query(`
        UPDATE users 
        SET subscription_status = $1, updated_at = NOW()
        WHERE id = $2
      `, [userStatus, subscriptionRecord.user_id]);
    }

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Mark subscription as cancelled
    await Database.query(`
      UPDATE subscriptions 
      SET 
        status = 'cancelled',
        updated_at = NOW()
      WHERE stripe_subscription_id = $1
    `, [subscription.id]);

    // Get user and check trial status
    const subscriptionRecord = await Database.queryOne(`
      SELECT s.user_id, u.trial_ends_at, u.created_at
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.stripe_subscription_id = $1
    `, [subscription.id]);

    if (subscriptionRecord) {
      const now = new Date();
      const trialEnd = new Date(subscriptionRecord.trial_ends_at || subscriptionRecord.created_at);
      trialEnd.setDate(trialEnd.getDate() + 30);

      const newStatus = trialEnd > now ? 'trial' : 'expired';

      await Database.query(`
        UPDATE users 
        SET subscription_status = $1, updated_at = NOW()
        WHERE id = $2
      `, [newStatus, subscriptionRecord.user_id]);
    }

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    // Update subscription status
    await Database.query(`
      UPDATE subscriptions 
      SET status = 'active', updated_at = NOW()
      WHERE stripe_subscription_id = $1
    `, [subscriptionId]);

    // Update user status
    const subscriptionRecord = await Database.queryOne(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscriptionId]
    );

    if (subscriptionRecord) {
      await Database.query(`
        UPDATE users 
        SET subscription_status = 'active', updated_at = NOW()
        WHERE id = $1
      `, [subscriptionRecord.user_id]);
    }

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    // Mark subscription as past_due
    await Database.query(`
      UPDATE subscriptions 
      SET status = 'past_due', updated_at = NOW()
      WHERE stripe_subscription_id = $1
    `, [subscriptionId]);

    // Optionally: Send notification email to user about failed payment
    // This can be implemented later with your email service

  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

