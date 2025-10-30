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

    // Get user analytics
    const analyticsQuery = `
      SELECT 
        COALESCE(pdfs_processed, 0) as pdfs_processed,
        last_activity
      FROM user_analytics 
      WHERE user_id = $1
    `;
    
    const analytics = await Database.queryOne(analyticsQuery, [user.id]);

    // If no analytics record exists, create one
    if (!analytics) {
      await Database.query(`
        INSERT INTO user_analytics (user_id, pdfs_processed, last_activity)
        VALUES ($1, 0, NOW())
      `, [user.id]);
    }

    return NextResponse.json({
      success: true,
      pdfsProcessed: analytics?.pdfs_processed || 0,
      lastActivity: analytics?.last_activity || null
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { action } = body;

    if (action === 'increment_pdf_processed') {
      // Increment PDF processed count
      const result = await Database.query(`
        INSERT INTO user_analytics (user_id, pdfs_processed, last_activity)
        VALUES ($1, 1, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          pdfs_processed = user_analytics.pdfs_processed + 1,
          last_activity = NOW(),
          updated_at = NOW()
        RETURNING pdfs_processed
      `, [user.id]        );

      return NextResponse.json({
        success: true,
        message: 'PDF processing recorded',
        pdfsProcessed: result.rows[0].pdfs_processed
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Analytics] Update user analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
