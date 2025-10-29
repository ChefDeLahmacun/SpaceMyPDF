// Client-safe currency utilities (doesn't import Stripe)
export function getCurrencySymbol(currency: string): string {
  const currencyUpper = currency.toUpperCase();
  const symbols: { [key: string]: string } = {
    'GBP': '£',
    'USD': '$',
    'EUR': '€',
    'TRY': '₺'
  };
  return symbols[currencyUpper] || '£';
}

export const CURRENCIES = {
  GBP: { symbol: '£', name: 'British Pound' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  TRY: { symbol: '₺', name: 'Turkish Lira' }
};


