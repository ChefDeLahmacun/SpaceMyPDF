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

    // Get all announcements
    const announcementsQuery = `
      SELECT 
        id,
        title,
        message,
        announcement_type as type,
        is_active,
        created_at
      FROM announcements
      ORDER BY created_at DESC
    `;
    
    const announcements = await Database.queryMany(announcementsQuery);

    return NextResponse.json({
      success: true,
      announcements
    });

  } catch (error) {
    console.error('Admin announcements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { title, message, type } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create announcement
    const createQuery = `
      INSERT INTO announcements (title, message, announcement_type, is_active, created_at)
      VALUES ($1, $2, $3, true, NOW())
      RETURNING *
    `;
    
    const announcement = await Database.queryOne(createQuery, [title, message, type]);

    return NextResponse.json({
      success: true,
      announcement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
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
    const { id, is_active } = body;

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing id or is_active' },
        { status: 400 }
      );
    }

    // Update announcement status
    const updateQuery = `
      UPDATE announcements 
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const announcement = await Database.queryOne(updateQuery, [is_active, id]);

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      announcement
    });

  } catch (error) {
    console.error('Update announcement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
