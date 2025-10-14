import { stripe } from './config';
import { UserQueries } from '@/lib/db/queries/users';

export class StripeCustomerService {
  // Create a new Stripe customer
  static async createCustomer(userId: string, email: string, name?: string): Promise<string> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
          source: 'spacemypdf'
        }
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Get customer by ID
  static async getCustomer(customerId: string) {
    try {
      return await stripe.customers.retrieve(customerId);
    } catch (error) {
      console.error('Error retrieving Stripe customer:', error);
      throw new Error('Failed to retrieve customer');
    }
  }

  // Update customer
  static async updateCustomer(customerId: string, updates: {
    email?: string;
    name?: string;
    metadata?: { [key: string]: string };
  }) {
    try {
      return await stripe.customers.update(customerId, updates);
    } catch (error) {
      console.error('Error updating Stripe customer:', error);
      throw new Error('Failed to update customer');
    }
  }

  // Get or create customer for user
  static async getOrCreateCustomer(userId: string): Promise<string> {
    try {
      // First, check if user already has a Stripe customer ID
      const user = await UserQueries.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already has a Stripe customer ID stored
      if (user.stripe_customer_id) {
        return user.stripe_customer_id;
      }

      // Create new customer
      const customerId = await this.createCustomer(userId, user.email, user.name || user.email.split('@')[0]);
      
      // Store customer ID in database
      await UserQueries.updateUser(userId, { stripe_customer_id: customerId });
      
      return customerId;
    } catch (error) {
      console.error('Error getting or creating customer:', error);
      throw error;
    }
  }

  // Get customer's payment methods
  static async getPaymentMethods(customerId: string) {
    try {
      return await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  // Set default payment method
  static async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      return await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  }

  // Get customer's invoices
  static async getInvoices(customerId: string, limit: number = 10) {
    try {
      return await stripe.invoices.list({
        customer: customerId,
        limit
      });
    } catch (error) {
      console.error('Error retrieving invoices:', error);
      throw new Error('Failed to retrieve invoices');
    }
  }

  // Get customer's upcoming invoice
  static async getUpcomingInvoice(customerId: string) {
    try {
      return await (stripe.invoices as any).retrieveUpcoming({
        customer: customerId
      });
    } catch (error) {
      console.error('Error retrieving upcoming invoice:', error);
      throw new Error('Failed to retrieve upcoming invoice');
    }
  }
}
