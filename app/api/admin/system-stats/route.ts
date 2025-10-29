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
        COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active_users
      FROM users
    `;
    const userStats = await Database.queryOne(userStatsQuery);

    // Get support ticket statistics
    const supportStatsQuery = `
      SELECT COUNT(*) as total_support_tickets
      FROM support_tickets
    `;
    const supportStats = await Database.queryOne(supportStatsQuery);

    // Get feature request statistics
    const featureStatsQuery = `
      SELECT COUNT(*) as pending_feature_requests
      FROM feature_requests
      WHERE status = 'pending'
    `;
    const featureStats = await Database.queryOne(featureStatsQuery);

    const stats = {
      totalUsers: parseInt(userStats.total_users) || 0,
      activeUsers: parseInt(userStats.active_users) || 0,
      totalSupportTickets: parseInt(supportStats.total_support_tickets) || 0,
      pendingFeatureRequests: parseInt(featureStats.pending_feature_requests) || 0,
      databaseSize: 'N/A', // This would need to be calculated separately
      lastBackup: 'N/A' // This would need to be tracked separately
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Admin system stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


