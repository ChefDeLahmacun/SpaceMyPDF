import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { BonusActivityService } from '@/lib/db/queries/bonus-activities';

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

    // Get user's bonus activities
    const activities = await BonusActivityService.getUserBonusActivities(user.id);
    
    // Get total bonus months
    const totalBonusMonths = await BonusActivityService.getTotalBonusMonths(user.id);

    return NextResponse.json({
      success: true,
      activities,
      totalBonusMonths,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Get bonus activities error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
