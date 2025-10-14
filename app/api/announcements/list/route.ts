import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db/connection';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get active announcements
    const query = `
      SELECT 
        id,
        title,
        content,
        published_at,
        expires_at,
        is_active
      FROM announcements
      WHERE is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY published_at DESC
    `;
    
    const announcements = await Database.queryMany(query);

    return NextResponse.json({
      success: true,
      announcements,
      count: announcements.length
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
