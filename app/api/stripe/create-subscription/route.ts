import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { StripeCheckoutService } from '@/lib/stripe/checkout';
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

    // Create Stripe Checkout session
    const checkoutSession = await StripeCheckoutService.createCheckoutSession(
      user.id,
      user.email,
      plan,
      currency
    );

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      message: 'Checkout session created successfully'
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
