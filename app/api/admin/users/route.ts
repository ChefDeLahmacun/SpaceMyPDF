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

    // Get all users with their referral counts
    const usersQuery = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.subscription_status,
        u.trial_ends_at,
        u.created_at,
        u.referral_code,
        COUNT(r.id) as total_referrals
      FROM users u
      LEFT JOIN referrals r ON u.id = r.referrer_id
      GROUP BY u.id, u.email, u.name, u.subscription_status, u.trial_ends_at, u.created_at, u.referral_code
      ORDER BY u.created_at DESC
    `;
    
    const users = await Database.queryMany(usersQuery);

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


