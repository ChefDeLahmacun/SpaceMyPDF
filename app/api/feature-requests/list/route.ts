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
          fr.priority,
          fr.bonus_awarded,
          fr.created_at,
          fr.created_at as reviewed_at
        FROM feature_requests fr
        WHERE fr.user_id = $1
        ORDER BY fr.created_at DESC
      `;
    
    const featureRequests = await Database.queryMany(query, [user.id]);
    
    // Map the bonus_awarded field to bonus_months and map status values for frontend compatibility
    const requestsWithBonus = featureRequests.map(request => ({
      ...request,
      bonus_months: request.bonus_awarded ? 1 : 0,
      status: request.status === 'completed' ? 'implemented' : 
              request.status === 'in_progress' ? 'approved' : 
              request.status
    }));

    return NextResponse.json({
      success: true,
      requests: requestsWithBonus,
      featureRequests: requestsWithBonus, // Keep both for compatibility
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
