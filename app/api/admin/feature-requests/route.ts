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

    // Get all feature requests with user information
    const featuresQuery = `
      SELECT
        fr.id,
        fr.title,
        fr.description,
        fr.status,
        fr.priority,
        fr.created_at,
        fr.bonus_awarded,
        u.email as user_email,
        u.name as user_name,
        u.id as user_id
      FROM feature_requests fr
      JOIN users u ON fr.user_id = u.id
      ORDER BY fr.created_at DESC
    `;
    
    const features = await Database.queryMany(featuresQuery);

    return NextResponse.json({
      success: true,
      features
    });

  } catch (error) {
    console.error('Admin feature requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { featureId, status } = body;

    if (!featureId || !status) {
      return NextResponse.json(
        { error: 'Missing featureId or status' },
        { status: 400 }
      );
    }

    // Update feature status
    const updateQuery = `
      UPDATE feature_requests 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const updatedFeature = await Database.queryOne(updateQuery, [status, featureId]);

    if (!updatedFeature) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      feature: updatedFeature
    });

  } catch (error) {
    console.error('Update feature request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
