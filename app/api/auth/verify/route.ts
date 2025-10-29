import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { Database } from '@/lib/db/connection';

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
    
    // Check if user is admin and get premium fields
    try {
      const userDetails = await Database.queryOne(
        'SELECT is_admin, admin_granted_premium, admin_premium_expires_at FROM users WHERE id = $1',
        [user.id]
      );
      
      return NextResponse.json({
        success: true,
        user: {
          ...user,
          isAdmin: userDetails?.is_admin === true,
          adminGrantedPremium: userDetails?.admin_granted_premium || false,
          adminPremiumExpiresAt: userDetails?.admin_premium_expires_at || null
        },
        message: 'User authenticated successfully'
      });
    } catch (dbError) {
      // If database query fails, return user without admin flag
      console.error('Error checking admin status:', dbError);
      return NextResponse.json({
        success: true,
        user: {
          ...user,
          isAdmin: false,
          adminGrantedPremium: false,
          adminPremiumExpiresAt: null
        },
        message: 'User authenticated successfully'
      });
    }

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
