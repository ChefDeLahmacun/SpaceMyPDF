import { Database } from '../connection';
import { BonusActivityService } from './bonus-activities';

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  bonus_months: number;
  created_at: Date;
}

export interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  total_bonus_months: number;
  pending_referrals: number;
}

export class ReferralQueries {
  // Create a new referral
  static async createReferral(referrerId: string, refereeId: string, bonusMonths: number = 1): Promise<Referral> {
    const query = `
      INSERT INTO referrals (referrer_id, referee_id, bonus_months)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    return await Database.queryOne(query, [referrerId, refereeId, bonusMonths]);
  }

  // Get all referrals for a user
  static async getReferralsByUser(userId: string): Promise<Referral[]> {
    const query = `
      SELECT r.*, u.email as referee_email, u.created_at as referee_joined_at
      FROM referrals r
      JOIN users u ON r.referee_id = u.id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC
    `;
    
    return await Database.queryMany(query, [userId]);
  }

  // Get referral statistics for a user
  static async getReferralStats(userId: string): Promise<ReferralStats> {
    const query = `
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN u.subscription_status IN ('active', 'trial') THEN 1 END) as successful_referrals,
        COALESCE(SUM(r.bonus_months), 0) as total_bonus_months,
        COUNT(CASE WHEN u.subscription_status = 'trial' THEN 1 END) as pending_referrals
      FROM referrals r
      JOIN users u ON r.referee_id = u.id
      WHERE r.referrer_id = $1
    `;
    
    const result = await Database.queryOne(query, [userId]);
    
    return {
      total_referrals: parseInt(result.total_referrals) || 0,
      successful_referrals: parseInt(result.successful_referrals) || 0,
      total_bonus_months: parseInt(result.total_bonus_months) || 0,
      pending_referrals: parseInt(result.pending_referrals) || 0
    };
  }

  // Check if a user has already been referred
  static async isUserReferred(userId: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM users WHERE id = $1 AND referred_by IS NOT NULL';
    const result = await Database.queryOne(query, [userId]);
    return parseInt(result.count) > 0;
  }

  // Get the referrer of a user
  static async getReferrer(userId: string): Promise<{ id: string; email: string; referral_code: string } | null> {
    const query = `
      SELECT u.id, u.email, u.referral_code
      FROM users u
      JOIN users referee ON referee.referred_by = u.id
      WHERE referee.id = $1
    `;
    
    return await Database.queryOne(query, [userId]);
  }

  // Check if a referral code is valid and not self-referral
  static async validateReferralCode(referralCode: string, userId: string): Promise<{
    isValid: boolean;
    referrer?: { id: string; email: string };
    error?: string;
  }> {
    // Get the referrer by referral code
    const referrer = await Database.queryOne(
      'SELECT id, email FROM users WHERE referral_code = $1',
      [referralCode]
    );

    if (!referrer) {
      return { isValid: false, error: 'Invalid referral code' };
    }

    // Check if user is trying to refer themselves
    if (referrer.id === userId) {
      return { isValid: false, error: 'Cannot use your own referral code' };
    }

    // Check if user has already been referred
    const alreadyReferred = await this.isUserReferred(userId);
    if (alreadyReferred) {
      return { isValid: false, error: 'You have already used a referral code' };
    }

    return {
      isValid: true,
      referrer: {
        id: referrer.id,
        email: referrer.email
      }
    };
  }

  // Apply referral bonus to both users
  static async applyReferralBonus(referrerId: string, refereeId: string): Promise<{
    referrerBonus: number;
    refereeBonus: number;
  }> {
    try {
      // Check if referral should be allowed (phone number fraud check)
      const { AntiFraudService } = await import('@/lib/security/anti-fraud');
      const phoneCheck = await AntiFraudService.canGiveReferralBonus(referrerId, refereeId);
      
      if (!phoneCheck.allowed) {
        console.log('Referral bonus blocked:', phoneCheck.reason);
        // Create referral record but with 0 bonus months
        await this.createReferral(referrerId, refereeId, 0);
        return {
          referrerBonus: 0,
          refereeBonus: 0
        };
      }

      // Create referral record
      const referral = await this.createReferral(referrerId, refereeId, 1);

      // Get current trial end dates and subscription status
      const referrer = await Database.queryOne(
        'SELECT trial_ends_at, subscription_status FROM users WHERE id = $1',
        [referrerId]
      );
      
      const referee = await Database.queryOne(
        'SELECT trial_ends_at, subscription_status FROM users WHERE id = $1',
        [refereeId]
      );

      // Check how many people the referrer has already referred
      const existingReferrals = await Database.queryOne(
        'SELECT COUNT(*) as count FROM referrals WHERE referrer_id = $1',
        [referrerId]
      );
      
      const currentReferralCount = existingReferrals.count;
      
      // Apply bonus months based on subscription status
      const referrerBonus = currentReferralCount <= 3 ? 1 : 0;
      const refereeBonus = 1;

      // For trial users, extend trial_ends_at
      // For paying members, we'll store bonus months separately for future use
      if (referrer.subscription_status === 'trial' && referrerBonus > 0) {
        const referrerNewEnd = new Date(referrer.trial_ends_at);
        referrerNewEnd.setMonth(referrerNewEnd.getMonth() + referrerBonus);
        await Database.query(
          'UPDATE users SET trial_ends_at = $2, updated_at = NOW() WHERE id = $1',
          [referrerId, referrerNewEnd]
        );
      }

      if (referee.subscription_status === 'trial') {
        const refereeNewEnd = new Date(referee.trial_ends_at);
        refereeNewEnd.setMonth(refereeNewEnd.getMonth() + refereeBonus);
        await Database.query(
          'UPDATE users SET trial_ends_at = $2, updated_at = NOW() WHERE id = $1',
          [refereeId, refereeNewEnd]
        );
      }

      // Record bonus activities and send emails
      if (referrerBonus > 0) {
        // Get referee email for activity description
        const refereeEmail = await Database.queryOne(
          'SELECT email FROM users WHERE id = $1',
          [refereeId]
        );
        
        await BonusActivityService.recordReferralBonus(
          referrerId,
          referrerBonus,
          refereeEmail.email,
          referral.id
        );

        // Send referral bonus email to referrer
        try {
          const { emailService } = await import('@/lib/email/service');
          const referrerUser = await Database.queryOne(
            'SELECT email, name FROM users WHERE id = $1',
            [referrerId]
          );
          
          await emailService.sendReferralBonusEmail(
            referrerUser.email,
            referrerUser.name || referrerUser.email.split('@')[0],
            referrerBonus
          );
        } catch (error) {
          console.error('Error sending referral bonus email to referrer:', error);
          // Don't fail the referral process if email fails
        }
      }

      // Record referee bonus activity
      const referrerEmail = await Database.queryOne(
        'SELECT email FROM users WHERE id = $1',
        [referrerId]
      );
      
      await BonusActivityService.recordReferralBonus(
        refereeId,
        refereeBonus,
        referrerEmail.email,
        referral.id
      );

      // Send referral bonus email to referee
      try {
        const { emailService } = await import('@/lib/email/service');
        const refereeUser = await Database.queryOne(
          'SELECT email, name FROM users WHERE id = $1',
          [refereeId]
        );
        
        await emailService.sendReferralBonusEmail(
          refereeUser.email,
          refereeUser.name || refereeUser.email.split('@')[0],
          refereeBonus
        );
      } catch (error) {
        console.error('Error sending referral bonus email to referee:', error);
        // Don't fail the referral process if email fails
      }

      return {
        referrerBonus,
        refereeBonus
      };

    } catch (error) {
      console.error('Error applying referral bonus:', error);
      throw error;
    }
  }

  // Get top referrers (for admin dashboard)
  static async getTopReferrers(limit: number = 10): Promise<Array<{
    user_id: string;
    email: string;
    referral_count: number;
    total_bonus_months: number;
  }>> {
    const query = `
      SELECT 
        u.id as user_id,
        u.email,
        COUNT(r.id) as referral_count,
        COALESCE(SUM(r.bonus_months), 0) as total_bonus_months
      FROM users u
      LEFT JOIN referrals r ON u.id = r.referrer_id
      GROUP BY u.id, u.email
      HAVING COUNT(r.id) > 0
      ORDER BY referral_count DESC, total_bonus_months DESC
      LIMIT $1
    `;
    
    return await Database.queryMany(query, [limit]);
  }

  // Get referral performance over time
  static async getReferralPerformance(userId: string, days: number = 30): Promise<Array<{
    date: string;
    referrals_count: number;
  }>> {
    const query = `
      SELECT 
        DATE(r.created_at) as date,
        COUNT(*) as referrals_count
      FROM referrals r
      WHERE r.referrer_id = $1
        AND r.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(r.created_at)
      ORDER BY date DESC
    `;
    
    return await Database.queryMany(query, [userId]);
  }
}
