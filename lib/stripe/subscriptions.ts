import { stripe, STRIPE_CONFIG, getPriceId } from './config';
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

  // Get subscription pricing from Stripe
  // Finds the correct price ID for the requested currency
  static async getSubscriptionPricing(currency: string = 'GBP') {
    try {
      const currencyUpper = currency.toUpperCase();
      
      // Fetch all active prices from Stripe
      const prices = await stripe.prices.list({ 
        active: true, 
        limit: 100 
      });
      
      let monthlyPrice: any = null;
      let yearlyPrice: any = null;
      
      // First pass: try to find prices that match the requested currency directly
      for (const price of prices.data) {
        if (price.currency.toUpperCase() !== currencyUpper) continue;
        
        const lookupKey = price.lookup_key?.toLowerCase() || '';
        const nickname = price.nickname?.toLowerCase() || '';
        const combined = `${lookupKey} ${nickname}`;
        
        if ((combined.includes('monthly') || combined.includes('spacemypdf_monthly')) && !monthlyPrice) {
          monthlyPrice = price;
        } else if ((combined.includes('yearly') || combined.includes('annual') || combined.includes('spacemypdf_yearly')) && !yearlyPrice) {
          yearlyPrice = price;
        }
      }
      
      // Second pass: if no direct currency match, use GBP prices and extract from currency_options
      if (!monthlyPrice || !yearlyPrice) {
        console.log(`No direct ${currencyUpper} prices found, checking GBP prices with currency_options...`);
        
        let gbpMonthlyId: string | null = null;
        let gbpYearlyId: string | null = null;
        
        for (const price of prices.data) {
          if (price.currency.toUpperCase() !== 'GBP') continue;
          const lookupKey = price.lookup_key?.toLowerCase() || '';
          const nickname = price.nickname?.toLowerCase() || '';
          const combined = `${lookupKey} ${nickname}`;
          
          if (combined.includes('monthly') && !gbpMonthlyId) gbpMonthlyId = price.id;
          if ((combined.includes('yearly') || combined.includes('annual')) && !gbpYearlyId) gbpYearlyId = price.id;
        }
        
        if (gbpMonthlyId && gbpYearlyId) {
          // Retrieve prices with currency_options
          const [gbpMonthly, gbpYearly] = await Promise.all([
            stripe.prices.retrieve(gbpMonthlyId, { expand: ['currency_options'] }),
            stripe.prices.retrieve(gbpYearlyId, { expand: ['currency_options'] })
          ]);
          
          // Extract amounts from currency_options
          const getAmount = (price: any, curr: string): number | null => {
            if (price.currency.toUpperCase() === curr) {
              return price.unit_amount ? price.unit_amount / 100 : null;
            }
            const opt = price.currency_options?.[curr] || price.currency_options?.[curr.toLowerCase()];
            return opt?.unit_amount ? opt.unit_amount / 100 : null;
          };
          
          const monthlyAmount = getAmount(gbpMonthly, currencyUpper);
          const yearlyAmount = getAmount(gbpYearly, currencyUpper);
          
          if (monthlyAmount !== null && yearlyAmount !== null) {
            return {
              monthly: {
                price: monthlyAmount,
                name: 'Monthly Plan',
                currency: currencyUpper,
                priceId: gbpMonthly.id
              },
              yearly: {
                price: yearlyAmount,
                name: 'Yearly Plan',
                currency: currencyUpper,
                priceId: gbpYearly.id
              }
            };
          }
        }
        
        throw new Error(`Could not find pricing for currency ${currencyUpper}`);
      }
      
      // Found direct currency prices
      return {
        monthly: {
          price: monthlyPrice.unit_amount ? monthlyPrice.unit_amount / 100 : 0,
          name: 'Monthly Plan',
          currency: currencyUpper,
          priceId: monthlyPrice.id
        },
        yearly: {
          price: yearlyPrice.unit_amount ? yearlyPrice.unit_amount / 100 : 0,
          name: 'Yearly Plan',
          currency: currencyUpper,
          priceId: yearlyPrice.id
        }
      };
    } catch (error) {
      console.error('Error fetching pricing from Stripe:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}
