import { Database } from '../connection';

export interface BonusActivity {
  id: string;
  user_id: string;
  activity_type: 'referral' | 'feature_request' | 'admin_award';
  activity_source: string;
  bonus_months: number;
  description: string;
  reference_id?: string;
  created_at: Date;
}

export class BonusActivityService {
  // Record a bonus activity
  static async recordBonusActivity(
    userId: string,
    activityType: 'referral' | 'feature_request' | 'admin_award',
    activitySource: string,
    bonusMonths: number,
    description: string,
    referenceId?: string
  ): Promise<BonusActivity> {
    const query = `
      INSERT INTO bonus_activities (
        user_id, activity_type, activity_source, bonus_months, description, reference_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    return await Database.queryOne(query, [
      userId, activityType, activitySource, bonusMonths, description, referenceId
    ]);
  }

  // Get all bonus activities for a user
  static async getUserBonusActivities(userId: string): Promise<BonusActivity[]> {
    const query = `
      SELECT *
      FROM bonus_activities
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    return await Database.queryMany(query, [userId]);
  }

  // Get total bonus months earned by a user
  static async getTotalBonusMonths(userId: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(bonus_months), 0) as total
      FROM bonus_activities
      WHERE user_id = $1
    `;
    
    const result = await Database.queryOne(query, [userId]);
    return parseInt(result.total) || 0;
  }

  // Record referral bonus
  static async recordReferralBonus(
    userId: string,
    bonusMonths: number,
    referredUserEmail: string,
    referralId: string
  ): Promise<BonusActivity> {
    return await this.recordBonusActivity(
      userId,
      'referral',
      'referred_user',
      bonusMonths,
      `Earned ${bonusMonths} month${bonusMonths > 1 ? 's' : ''} for referring ${referredUserEmail}`,
      referralId
    );
  }

  // Record feature request bonus
  static async recordFeatureRequestBonus(
    userId: string,
    featureRequestTitle: string,
    featureRequestId: string
  ): Promise<BonusActivity> {
    return await this.recordBonusActivity(
      userId,
      'feature_request',
      'feature_approved',
      1,
      `Earned 1 month for approved feature request: "${featureRequestTitle}"`,
      featureRequestId
    );
  }

  // Record admin-awarded bonus
  static async recordAdminBonus(
    userId: string,
    bonusMonths: number,
    reason: string,
    adminId: string
  ): Promise<BonusActivity> {
    return await this.recordBonusActivity(
      userId,
      'admin_award',
      'admin_grant',
      bonusMonths,
      `Admin awarded ${bonusMonths} month${bonusMonths > 1 ? 's' : ''}: ${reason}`,
      adminId
    );
  }
}
