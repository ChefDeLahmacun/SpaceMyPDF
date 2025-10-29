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
        COUNT(CASE 
          WHEN subscription_status = 'active' 
            OR (subscription_status = 'trial' AND trial_ends_at > NOW())
            OR (admin_granted_premium = TRUE AND admin_premium_expires_at > NOW())
          THEN 1 
        END) as active_users,
        COUNT(CASE WHEN subscription_status = 'trial' AND trial_ends_at > NOW() THEN 1 END) as trial_users,
        COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as paid_users
      FROM users
    `;
    const userStats = await Database.queryOne(userStatsQuery);

    // Get referral statistics
    const referralStatsQuery = `
      SELECT COUNT(*) as total_referrals
      FROM referrals
    `;
    const referralStats = await Database.queryOne(referralStatsQuery);

    // Get support ticket statistics (with error handling)
    let supportStats = { pending_support_tickets: 0 };
    try {
      const supportStatsQuery = `
        SELECT COUNT(*) as pending_support_tickets
        FROM support_tickets
        WHERE status = 'open'
      `;
      supportStats = await Database.queryOne(supportStatsQuery) || supportStats;
    } catch (error) {
      console.warn('Error fetching support stats:', error);
    }

    // Get feature request statistics (with error handling)
    let featureStats = { total_feature_requests: 0 };
    try {
      const featureStatsQuery = `
        SELECT COUNT(*) as total_feature_requests
        FROM feature_requests
      `;
      featureStats = await Database.queryOne(featureStatsQuery) || featureStats;
    } catch (error) {
      console.warn('Error fetching feature stats:', error);
    }

    // Get recent activity (with error handling)
    let recentActivity: any[] = [];
    try {
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
      recentActivity = await Database.queryMany(recentActivityQuery) || [];
    } catch (error) {
      console.warn('Error fetching recent activity:', error);
    }

    // Get PDFs processed statistics
    let pdfStats = { total_pdfs_processed: 0 };
    try {
      const pdfStatsQuery = `
        SELECT COALESCE(SUM(pdfs_processed), 0) as total_pdfs_processed
        FROM user_analytics
      `;
      pdfStats = await Database.queryOne(pdfStatsQuery) || pdfStats;
    } catch (error) {
      console.warn('Error fetching PDF stats:', error);
    }

    const stats = {
      totalUsers: parseInt(userStats.total_users) || 0,
      activeUsers: parseInt(userStats.active_users) || 0,
      trialUsers: parseInt(userStats.trial_users) || 0,
      paidUsers: parseInt(userStats.paid_users) || 0,
      totalReferrals: parseInt(referralStats.total_referrals) || 0,
      pendingSupportTickets: parseInt(supportStats.pending_support_tickets) || 0,
      pendingFeatureRequests: parseInt(featureStats.total_feature_requests) || 0,
      totalPDFsProcessed: parseInt(pdfStats.total_pdfs_processed) || 0
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
