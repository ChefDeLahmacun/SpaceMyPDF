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

      // Get user's feature requests
      const query = `
        SELECT 
          fr.id,
          fr.title,
          fr.description,
          fr.status,
          fr.created_at,
          fr.updated_at,
          fr.bonus_months_awarded
        FROM feature_requests fr
        WHERE fr.user_id = $1
        ORDER BY fr.created_at DESC
      `;
    
    const featureRequests = await Database.queryMany(query, [user.id]);
    
    // Map the bonus_months_awarded field to bonus_months for frontend compatibility
    const requestsWithBonus = featureRequests.map(request => ({
      ...request,
      bonus_months: request.bonus_months_awarded || 0
    }));

    return NextResponse.json({
      success: true,
      featureRequests: requestsWithBonus,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Get feature requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
