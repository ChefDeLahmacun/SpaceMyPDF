import { NextRequest, NextResponse } from 'next/server';
import { StripeSubscriptionService } from '@/lib/stripe/subscriptions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'GBP';

    // Get pricing for the currency from Stripe
    const pricing = await StripeSubscriptionService.getSubscriptionPricing(currency);

    return NextResponse.json({
      success: true,
      pricing,
      currency
    });

  } catch (error) {
    console.error('Get pricing error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
