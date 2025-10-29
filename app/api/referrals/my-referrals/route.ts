import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { ReferralQueries } from '@/lib/db/queries/referrals';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const user = authResult.user!;

    // Get user's referrals
    const referrals = await ReferralQueries.getReferralsByUser(user.id);

    // Get referral statistics
    const stats = await ReferralQueries.getReferralStats(user.id);

    return NextResponse.json({
      success: true,
      totalReferrals: stats.total_referrals,
      totalBonusMonths: stats.total_bonus_months,
      recentReferrals: referrals,
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referralCode
      }
    });

  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
