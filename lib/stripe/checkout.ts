import { stripe } from './config';
import { getPriceId } from './config';

export class StripeCheckoutService {
  // Create a Stripe Checkout session for subscription
  static async createCheckoutSession(
    userId: string,
    userEmail: string,
    plan: 'monthly' | 'yearly',
    currency: string = 'GBP'
  ) {
    try {
      const priceId = getPriceId(currency, plan);
      
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: userEmail,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?cancelled=true`,
        metadata: {
          userId: userId,
          plan: plan,
          currency: currency
        },
        subscription_data: {
          metadata: {
            userId: userId,
            plan: plan,
            currency: currency
          }
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
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
