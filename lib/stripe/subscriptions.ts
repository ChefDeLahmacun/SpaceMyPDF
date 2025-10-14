import { stripe, STRIPE_CONFIG } from './config';
import { StripeCustomerService } from './customers';
import { Database } from '@/lib/db/connection';

export class StripeSubscriptionService {
  // Create a subscription
  static async createSubscription(
    customerId: string,
    priceId: string,
    trialDays?: number
  ) {
    try {
      const subscriptionData: any = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      };

      // Add trial period if specified
      if (trialDays && trialDays > 0) {
        subscriptionData.trial_period_days = trialDays;
      }

      const subscription = await stripe.subscriptions.create(subscriptionData);
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Get subscription by ID
  static async getSubscription(subscriptionId: string) {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw new Error('Failed to retrieve subscription');
    }
  }

  // Update subscription
  static async updateSubscription(
    subscriptionId: string,
    updates: {
      priceId?: string;
      quantity?: number;
      trial_end?: number | 'now';
    }
  ) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (updates.priceId) {
        // Update subscription item
        await stripe.subscriptionItems.update(subscription.items.data[0].id, {
          price: updates.priceId
        });
      }

      if (updates.quantity !== undefined) {
        await stripe.subscriptionItems.update(subscription.items.data[0].id, {
          quantity: updates.quantity
        });
      }

      if (updates.trial_end !== undefined) {
        await stripe.subscriptions.update(subscriptionId, {
          trial_end: updates.trial_end
        });
      }

      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, immediately: boolean = false) {
    try {
      if (immediately) {
        return await stripe.subscriptions.cancel(subscriptionId);
      } else {
        return await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Reactivate subscription
  static async reactivateSubscription(subscriptionId: string) {
    try {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error('Failed to reactivate subscription');
    }
  }

  // Get user's subscription
  static async getUserSubscription(userId: string) {
    try {
      const query = `
        SELECT s.*, u.email, u.subscription_status
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        WHERE u.id = $1 AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
      `;
      
      return await Database.queryOne(query, [userId]);
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw new Error('Failed to get user subscription');
    }
  }

  // Create subscription with trial
  static async createSubscriptionWithTrial(
    userId: string,
    priceId: string,
    currency: string = 'GBP'
  ) {
    try {
      // Get or create customer
      const customerId = await StripeCustomerService.getOrCreateCustomer(userId);
      
      // Create subscription with trial
      const subscription = await this.createSubscription(customerId, priceId, 30); // 30-day trial
      
      // Save subscription to database
      await Database.query(`
        INSERT INTO subscriptions (
          user_id, stripe_subscription_id, stripe_customer_id, 
          status, current_period_start, current_period_end
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userId,
        subscription.id,
        customerId,
        subscription.status,
        new Date((subscription as any).current_period_start * 1000),
        new Date((subscription as any).current_period_end * 1000)
      ]);

      return subscription;
    } catch (error) {
      console.error('Error creating subscription with trial:', error);
      throw error;
    }
  }

  // Handle subscription status updates
  static async handleSubscriptionUpdate(subscription: any) {
    try {
      const subscriptionId = subscription.id;
      const status = subscription.status;
      
      // Update subscription in database
      await Database.query(`
        UPDATE subscriptions 
        SET status = $2, updated_at = NOW()
        WHERE stripe_subscription_id = $1
      `, [subscriptionId, status]);

      // Update user subscription status
      const userQuery = await Database.queryOne(`
        SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1
      `, [subscriptionId]);

      if (userQuery) {
        let userStatus = 'expired';
        if (status === 'active') {
          userStatus = 'active';
        } else if (status === 'trialing') {
          userStatus = 'trial';
        }

        await Database.query(`
          UPDATE users 
          SET subscription_status = $2, updated_at = NOW()
          WHERE id = $1
        `, [userQuery.user_id, userStatus]);
      }

      return { success: true };
    } catch (error) {
      console.error('Error handling subscription update:', error);
      throw error;
    }
  }

  // Get subscription pricing
  static getSubscriptionPricing(currency: string) {
    const currencyUpper = currency.toUpperCase() as keyof typeof STRIPE_CONFIG.currencies;
    
    return {
      monthly: {
        price: STRIPE_CONFIG.plans.monthly[currencyUpper]?.price || STRIPE_CONFIG.plans.monthly.GBP.price,
        name: STRIPE_CONFIG.plans.monthly[currencyUpper]?.name || 'Monthly Plan',
        currency: currencyUpper
      },
      yearly: {
        price: STRIPE_CONFIG.plans.yearly[currencyUpper]?.price || STRIPE_CONFIG.plans.yearly.GBP.price,
        name: STRIPE_CONFIG.plans.yearly[currencyUpper]?.name || 'Yearly Plan',
        currency: currencyUpper
      }
    };
  }
}
