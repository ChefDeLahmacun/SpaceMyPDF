import Stripe from 'stripe';

// Initialize Stripe with secret key and proper error handling
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover' as any,
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 10000,
  // SSL configuration for Node.js v23+
  httpAgent: new (require('https').Agent)({
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  })
});

// Stripe configuration
export const STRIPE_CONFIG = {
  // Currency settings
  currencies: {
    GBP: { symbol: '£', name: 'British Pound' },
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' }
  },
  
  // Stripe Price IDs (replace with your actual price IDs from Stripe Dashboard)
  priceIds: {
    monthly: {
      GBP: process.env.STRIPE_MONTHLY_PRICE_ID_GBP || 'price_monthly_gbp_placeholder',
      USD: process.env.STRIPE_MONTHLY_PRICE_ID_USD || 'price_monthly_usd_placeholder', 
      EUR: process.env.STRIPE_MONTHLY_PRICE_ID_EUR || 'price_monthly_eur_placeholder'
    },
    yearly: {
      GBP: process.env.STRIPE_YEARLY_PRICE_ID_GBP || 'price_yearly_gbp_placeholder',
      USD: process.env.STRIPE_YEARLY_PRICE_ID_USD || 'price_yearly_usd_placeholder',
      EUR: process.env.STRIPE_YEARLY_PRICE_ID_EUR || 'price_yearly_eur_placeholder'
    }
  },
  
  // Webhook endpoints
  webhookEndpoints: {
    subscription: '/api/stripe/webhook',
    payment: '/api/stripe/payment-webhook'
  }
};

// Helper function to get price ID based on currency and plan
export function getPriceId(currency: string, plan: 'monthly' | 'yearly'): string {
  const currencyUpper = currency.toUpperCase() as keyof typeof STRIPE_CONFIG.currencies;
  return STRIPE_CONFIG.priceIds[plan][currencyUpper] || STRIPE_CONFIG.priceIds.monthly.GBP;
}

// Helper function to get currency symbol
export function getCurrencySymbol(currency: string): string {
  const currencyUpper = currency.toUpperCase() as keyof typeof STRIPE_CONFIG.currencies;
  return STRIPE_CONFIG.currencies[currencyUpper]?.symbol || '£';
}

// Helper function to get currency from country code
export function getCurrencyFromCountry(countryCode: string): string {
  const countryCurrencyMap: { [key: string]: string } = {
    'GB': 'GBP',
    'US': 'USD',
    'CA': 'USD',
    'AU': 'USD',
    'DE': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'NL': 'EUR',
    'BE': 'EUR',
    'AT': 'EUR',
    'IE': 'EUR',
    'PT': 'EUR',
    'FI': 'EUR',
    'LU': 'EUR',
    'MT': 'EUR',
    'CY': 'EUR',
    'SK': 'EUR',
    'SI': 'EUR',
    'EE': 'EUR',
    'LV': 'EUR',
    'LT': 'EUR'
  };
  
  return countryCurrencyMap[countryCode] || 'GBP'; // Default to GBP
}
