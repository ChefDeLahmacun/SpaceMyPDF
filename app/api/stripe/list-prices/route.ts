import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active prices from Stripe
    const prices = await stripe.prices.list({ 
      active: true, 
      limit: 100 
    });
    
    // Organize prices by plan type (monthly/yearly) and currency
    const organizedPrices: { [key: string]: { [key: string]: any } } = {
      monthly: {},
      yearly: {}
    };
    
    // Filter and organize prices based on lookup_key or nickname patterns
    prices.data.forEach(price => {
      const currency = price.currency.toUpperCase();
      const lookupKey = price.lookup_key?.toLowerCase() || '';
      const nickname = price.nickname?.toLowerCase() || '';
      
      // Check if it's monthly or yearly based on lookup_key, nickname, or amount
      let planType: 'monthly' | 'yearly' | null = null;
      
      if (lookupKey.includes('monthly') || nickname.includes('monthly')) {
        planType = 'monthly';
      } else if (lookupKey.includes('yearly') || nickname.includes('yearly') || lookupKey.includes('annual') || nickname.includes('annual')) {
        planType = 'yearly';
      } else {
        // If we can't determine from lookup_key/nickname, guess based on amount
        // Monthly should be smaller, yearly should be larger
        // This is a fallback - ideally lookup_key should be set
        if (!organizedPrices.monthly[currency]) {
          planType = 'monthly';
        } else if (!organizedPrices.yearly[currency]) {
          planType = 'yearly';
        }
      }
      
      if (planType && (currency === 'GBP' || currency === 'USD' || currency === 'EUR')) {
        organizedPrices[planType][currency] = {
          id: price.id,
          currency: price.currency.toUpperCase(),
          unitAmount: price.unit_amount,
          amount: price.unit_amount ? price.unit_amount / 100 : 0,
          lookupKey: price.lookup_key,
          nickname: price.nickname
        };
      }
    });
    
    return NextResponse.json({
      success: true,
      prices: organizedPrices,
      allPrices: prices.data.map(p => ({
        id: p.id,
        currency: p.currency,
        unitAmount: p.unit_amount,
        lookupKey: p.lookup_key,
        nickname: p.nickname,
        active: p.active
      }))
    });

  } catch (error) {
    console.error('Error fetching Stripe prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices', details: (error as Error).message },
      { status: 500 }
    );
  }
}

