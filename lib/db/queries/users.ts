import { Database } from '../connection';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  phone_verified: boolean;
  referral_code: string;
  referred_by?: string;
  trial_ends_at?: Date;
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  stripe_customer_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  referred_by?: string;
}

export class UserQueries {
  // Create a new user
  static async createUser(userData: CreateUserData): Promise<User> {
    const { name, email, password_hash, phone, referred_by } = userData;
    
    // Generate unique referral code
    const referralCode = await this.generateUniqueReferralCode();
    
    const query = `
      INSERT INTO users (name, email, password_hash, phone, referred_by, referral_code, trial_ends_at, subscription_status)
      VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '1 month', 'trial')
      RETURNING *
    `;
    
    const result = await Database.queryOne(query, [name, email, password_hash, phone, referred_by, referralCode]);
    return result;
  }

  // Generate a unique referral code
  static async generateUniqueReferralCode(): Promise<string> {
    let code: string;
    let exists = true;
    
    while (exists) {
      // Generate a random 8-character code
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Check if code already exists
      const existing = await Database.queryOne('SELECT id FROM users WHERE referral_code = $1', [code]);
      exists = !!existing;
    }
    
    return code!;
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    return await Database.queryOne(query, [email]);
  }

  // Get user by phone number
  static async getUserByPhone(phone: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE phone = $1';
    return await Database.queryOne(query, [phone]);
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    return await Database.queryOne(query, [id]);
  }

  // Get user by referral code
  static async getUserByReferralCode(referralCode: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE referral_code = $1';
    return await Database.queryOne(query, [referralCode]);
  }

  // Update user
  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`);
    const values = Object.values(updates);
    
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    return await Database.queryOne(query, [id, ...values]);
  }

  // Update user subscription status
  static async updateSubscriptionStatus(id: string, status: User['subscription_status']): Promise<User> {
    const query = `
      UPDATE users 
      SET subscription_status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    return await Database.queryOne(query, [id, status]);
  }

  // Update user trial end date
  static async updateTrialEnd(id: string, trialEnd: Date): Promise<User> {
    const query = `
      UPDATE users 
      SET trial_ends_at = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    return await Database.queryOne(query, [id, trialEnd]);
  }

  // Verify phone number
  static async verifyPhone(id: string): Promise<User> {
    const query = `
      UPDATE users 
      SET phone_verified = true, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    return await Database.queryOne(query, [id]);
  }

  // Get users referred by a specific user
  static async getUsersReferredBy(userId: string): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE referred_by = $1 ORDER BY created_at DESC';
    return await Database.queryMany(query, [userId]);
  }

  // Check if user has active subscription
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count 
      FROM users 
      WHERE id = $1 
      AND (subscription_status = 'active' 
           OR (subscription_status = 'trial' AND trial_ends_at > NOW()))
    `;
    
    const result = await Database.queryOne(query, [userId]);
    return parseInt(result.count) > 0;
  }

  // Get user analytics
  static async getUserAnalytics(userId: string) {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.subscription_status,
        u.trial_ends_at,
        u.created_at,
        COALESCE(ua.pdfs_processed, 0) as pdfs_processed,
        ua.last_activity,
        COUNT(r.id) as referrals_count
      FROM users u
      LEFT JOIN user_analytics ua ON u.id = ua.user_id
      LEFT JOIN referrals r ON u.id = r.referrer_id
      WHERE u.id = $1
      GROUP BY u.id, ua.pdfs_processed, ua.last_activity
    `;
    
    return await Database.queryOne(query, [userId]);
  }

  // Delete user (soft delete by setting status to cancelled)
  static async deleteUser(id: string): Promise<User> {
    const query = `
      UPDATE users 
      SET subscription_status = 'cancelled', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    return await Database.queryOne(query, [id]);
  }
}
