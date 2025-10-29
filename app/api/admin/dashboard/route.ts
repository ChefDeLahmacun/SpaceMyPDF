import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/admin-auth';
import { Database } from '@/lib/db/connection';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Get user statistics
    const userStatsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN subscription_status = 'trial' THEN 1 END) as trial_users,
        COUNT(CASE WHEN subscription_status = 'active' AND trial_ends_at IS NULL THEN 1 END) as paid_users
      FROM users
    `;
    const userStats = await Database.queryOne(userStatsQuery);

    // Get referral statistics
    const referralStatsQuery = `
      SELECT COUNT(*) as total_referrals
      FROM referrals
    `;
    const referralStats = await Database.queryOne(referralStatsQuery);

    // Get support ticket statistics
    const supportStatsQuery = `
      SELECT COUNT(*) as pending_support_tickets
      FROM support_tickets
      WHERE status = 'open'
    `;
    const supportStats = await Database.queryOne(supportStatsQuery);

    // Get feature request statistics
    const featureStatsQuery = `
      SELECT COUNT(*) as pending_feature_requests
      FROM feature_requests
      WHERE status = 'pending'
    `;
    const featureStats = await Database.queryOne(featureStatsQuery);

    // Get recent activity
    const recentActivityQuery = `
      SELECT 
        'user_registration' as type,
        CONCAT('New user registered: ', email) as description,
        u.created_at as timestamp,
        email as user_email,
        u.id
      FROM users u
      WHERE u.created_at >= NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'support_ticket' as type,
        CONCAT('Support ticket: ', subject) as description,
        st.created_at as timestamp,
        u.email as user_email,
        st.id
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      WHERE st.created_at >= NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'feature_request' as type,
        CONCAT('Feature request: ', title) as description,
        fr.created_at as timestamp,
        u.email as user_email,
        fr.id
      FROM feature_requests fr
      JOIN users u ON fr.user_id = u.id
      WHERE fr.created_at >= NOW() - INTERVAL '7 days'
      
      ORDER BY timestamp DESC
      LIMIT 20
    `;
    const recentActivity = await Database.queryMany(recentActivityQuery);

    const stats = {
      totalUsers: parseInt(userStats.total_users) || 0,
      activeUsers: parseInt(userStats.active_users) || 0,
      trialUsers: parseInt(userStats.trial_users) || 0,
      paidUsers: parseInt(userStats.paid_users) || 0,
      totalReferrals: parseInt(referralStats.total_referrals) || 0,
      pendingSupportTickets: parseInt(supportStats.pending_support_tickets) || 0,
      pendingFeatureRequests: parseInt(featureStats.pending_feature_requests) || 0,
      totalPDFsProcessed: 0 // This would need to be tracked separately
    };

    return NextResponse.json({
      success: true,
      stats,
      recentActivity
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
