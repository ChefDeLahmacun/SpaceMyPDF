import Stripe from 'stripe';

// Initialize Stripe with secret key and proper error handling
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 10000,
});

// Stripe configuration
export const STRIPE_CONFIG = {
  // Currency settings
  currencies: {
    GBP: { symbol: '£', name: 'British Pound' },
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' }
  },
  
  // Pricing plans
  plans: {
    monthly: {
      GBP: { price: 300, name: 'Monthly Plan' }, // £3.00 in pence
      USD: { price: 400, name: 'Monthly Plan' }, // $4.00 in cents
      EUR: { price: 350, name: 'Monthly Plan' }   // €3.50 in cents
    },
    yearly: {
      GBP: { price: 3000, name: 'Yearly Plan' }, // £30.00 in pence
      USD: { price: 4000, name: 'Yearly Plan' }, // $40.00 in cents
      EUR: { price: 3500, name: 'Yearly Plan' }  // €35.00 in cents
    }
  },
  
  // Webhook endpoints
  webhookEndpoints: {
    subscription: '/api/stripe/webhook',
    payment: '/api/stripe/payment-webhook'
  }
};

// Helper function to get price based on currency and plan
export function getPrice(currency: string, plan: 'monthly' | 'yearly'): number {
  const currencyUpper = currency.toUpperCase() as keyof typeof STRIPE_CONFIG.currencies;
  return STRIPE_CONFIG.plans[plan][currencyUpper]?.price || STRIPE_CONFIG.plans.monthly.GBP.price;
}

// Helper function to format price for display
export function formatPrice(price: number, currency: string): string {
  const currencyUpper = currency.toUpperCase() as keyof typeof STRIPE_CONFIG.currencies;
  const symbol = STRIPE_CONFIG.currencies[currencyUpper]?.symbol || '£';
  const amount = price / 100; // Convert from cents/pence to main unit
  return `${symbol}${amount.toFixed(2)}`;
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
