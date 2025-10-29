import { Database } from '@/lib/db/connection';

export interface NotificationPreferences {
  emailNotifications: boolean;
  trialReminders: boolean;
  referralUpdates: boolean;
}

export class NotificationService {
  /**
   * Check if a user has a specific notification type enabled
   */
  static async canSendNotification(
    userId: string,
    notificationType: 'email' | 'trial' | 'referral'
  ): Promise<boolean> {
    try {
      const preferences = await Database.queryOne(
        'SELECT * FROM notification_preferences WHERE user_id = $1',
        [userId]
      );

      // If no preferences exist, default to true (allow notifications)
      if (!preferences) {
        return true;
      }

      // Map notification type to preference field
      switch (notificationType) {
        case 'email':
          return preferences.email_notifications;
        case 'trial':
          return preferences.trial_reminders;
        case 'referral':
          return preferences.referral_updates;
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      // On error, default to true to ensure important notifications are not missed
      return true;
    }
  }

  /**
   * Get all notification preferences for a user
   */
  static async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const preferences = await Database.queryOne(
        'SELECT * FROM notification_preferences WHERE user_id = $1',
        [userId]
      );

      if (!preferences) {
        // Return default preferences
        return {
          emailNotifications: true,
          trialReminders: true,
          referralUpdates: true
        };
      }

      return {
        emailNotifications: preferences.email_notifications,
        trialReminders: preferences.trial_reminders,
        referralUpdates: preferences.referral_updates
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      // Return default preferences on error
      return {
        emailNotifications: true,
        trialReminders: true,
        referralUpdates: true
      };
    }
  }

  /**
   * Create default notification preferences for a new user
   */
  static async createDefaultPreferences(userId: string): Promise<void> {
    try {
      await Database.queryOne(
        `INSERT INTO notification_preferences (user_id, email_notifications, trial_reminders, referral_updates)
         VALUES ($1, true, true, true)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );
    } catch (error) {
      console.error('Error creating default notification preferences:', error);
    }
  }
}

