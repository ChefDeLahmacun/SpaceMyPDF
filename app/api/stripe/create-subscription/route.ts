import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { StripeSubscriptionService } from '@/lib/stripe/subscriptions';
import { StripeCustomerService } from '@/lib/stripe/customers';
import { Database } from '@/lib/db/connection';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createSubscriptionSchema = z.object({
  plan: z.enum(['monthly', 'yearly']),
  currency: z.string().min(3).max(3).default('GBP')
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
    const validationResult = createSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { plan, currency } = validationResult.data;

    // Check if user already has an active subscription
    const existingSubscription = await StripeSubscriptionService.getUserSubscription(user.id);
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    // Get pricing for the selected plan and currency
    const pricing = StripeSubscriptionService.getSubscriptionPricing(currency);
    const selectedPricing = pricing[plan];

    // For development, we'll create a mock subscription
    // In production, you would create actual Stripe prices and use them
    if (process.env.NODE_ENV === 'development') {
      // Mock subscription for development
      const mockSubscription = {
        id: `sub_mock_${Date.now()}`,
        status: 'active', // Use 'active' instead of 'trialing' to match database constraint
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
        trial_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days trial
      };

      // Store mock subscription in database
      await Database.query(`
        INSERT INTO subscriptions (
          user_id, stripe_subscription_id, stripe_customer_id, 
          status, current_period_start, current_period_end
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        user.id,
        mockSubscription.id,
        'cus_mock_' + user.id,
        mockSubscription.status,
        new Date(mockSubscription.current_period_start * 1000),
        new Date(mockSubscription.current_period_end * 1000)
      ]);

      return NextResponse.json({
        success: true,
        subscription: {
          id: mockSubscription.id,
          status: mockSubscription.status,
          current_period_start: mockSubscription.current_period_start,
          current_period_end: mockSubscription.current_period_end,
          trial_end: mockSubscription.trial_end
        },
        customer: {
          id: 'cus_mock_' + user.id
        },
        pricing: selectedPricing,
        message: 'Mock subscription created for development'
      });
    }

    // Production code would go here
    const priceId = `price_${plan}_${currency.toLowerCase()}`;
    const customerId = await StripeCustomerService.getOrCreateCustomer(user.id);
    const subscription = await StripeSubscriptionService.createSubscriptionWithTrial(
      user.id,
      priceId,
      currency
    );

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: (subscription as any).current_period_start,
        current_period_end: (subscription as any).current_period_end,
        trial_end: (subscription as any).trial_end
      },
      customer: {
        id: customerId
      },
      pricing: selectedPricing,
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
