import { stripe } from './config';

export class StripeCheckoutService {
  // Create a Stripe Checkout session for subscription
  static async createCheckoutSession(
    userId: string,
    userEmail: string,
    plan: 'monthly' | 'yearly',
    currency: string = 'GBP'
  ) {
    try {
      // Get the correct pricing for the selected currency from Stripe
      const { StripeSubscriptionService } = await import('./subscriptions');
      const pricing = await StripeSubscriptionService.getSubscriptionPricing(currency);
      const selectedPlan = pricing[plan];
      const currencyUpper = currency.toUpperCase();
      
      // Get the product ID from the price
      const basePrice = await stripe.prices.retrieve(selectedPlan.priceId);
      const productId = typeof basePrice.product === 'string' ? basePrice.product : basePrice.product.id;
      
      // Build checkout session config using price_data to explicitly set currency
      // This allows us to use the exact currency and amount the user selected,
      // rather than relying on Stripe's automatic currency detection
      const sessionConfig: any = {
        mode: 'subscription',
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: currencyUpper.toLowerCase(),
              product: productId,
              recurring: {
                interval: plan === 'monthly' ? 'month' : 'year'
              },
              unit_amount: Math.round(selectedPlan.price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        payment_method_types: ['card'],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?cancelled=true`,
        metadata: {
          userId: userId,
          plan: plan,
          currency: currencyUpper
        },
        subscription_data: {
          metadata: {
            userId: userId,
            plan: plan,
            currency: currencyUpper
          }
        }
      };
      
      // IMPORTANT: Stripe's currency_options are for ADAPTIVE pricing (auto-detection only).
      // To let users explicitly choose USD/EUR, you must create SEPARATE price IDs in Stripe:
      //   1. Go to Stripe → Products → SpaceMyPDF Membership  
      //   2. Create prices: $4 USD monthly, €3.50 EUR monthly, etc.
      //   3. Set lookup keys: spacemypdf_monthly_usd, spacemypdf_monthly_eur
      // Then this code will find and use those price IDs for explicit currency selection.
      
      const session = await stripe.checkout.sessions.create(sessionConfig);

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      if (error && typeof error === 'object' && 'type' in error) {
        console.error('Stripe error type:', (error as any).type);
        console.error('Stripe error code:', (error as any).code);
        console.error('Stripe error message:', (error as any).message);
      }
      throw error instanceof Error ? error : new Error('Failed to create checkout session');
    }
  }

  // Retrieve a checkout session
  static async getCheckoutSession(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      throw new Error('Failed to retrieve checkout session');
    }
  }

  // Create a customer portal session
  static async createCustomerPortalSession(customerId: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      });

      return session;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw new Error('Failed to create customer portal session');
    }
  }
}
