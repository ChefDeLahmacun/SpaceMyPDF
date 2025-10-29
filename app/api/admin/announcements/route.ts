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
        COALESCE(content, message) as content,
        message,
        announcement_type as type,
        is_active,
        created_at,
        published_at,
        expires_at
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
    const { title, content, type, expires_at } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create announcement (store in both content and message for backwards compatibility)
    const createQuery = `
      INSERT INTO announcements (
        title, 
        content, 
        message, 
        announcement_type, 
        is_active, 
        created_at, 
        published_at,
        expires_at
      )
      VALUES ($1, $2, $2, $3, true, NOW(), NOW(), $4)
      RETURNING *
    `;
    
    const announcement = await Database.queryOne(createQuery, [title, content, type, expires_at || null]);

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
    const { id, is_active, title, content, type, expires_at } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing announcement id' },
        { status: 400 }
      );
    }

    // If only toggling active status
    if (typeof is_active === 'boolean' && !title && !content) {
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
    }

    // Full update (edit)
    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Missing required fields for update' },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE announcements 
      SET 
        title = $1,
        content = $2,
        message = $2,
        announcement_type = $3,
        expires_at = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    
    const announcement = await Database.queryOne(updateQuery, [
      title,
      content,
      type,
      expires_at || null,
      id
    ]);

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

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing announcement id' },
        { status: 400 }
      );
    }

    // Delete announcement
    const deleteQuery = `
      DELETE FROM announcements 
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await Database.queryOne(deleteQuery, [id]);

    if (!result) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
