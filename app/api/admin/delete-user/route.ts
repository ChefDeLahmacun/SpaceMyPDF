import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db/connection';
import { authenticateRequest } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate and verify admin
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user!;

    // Check if user is admin
    const adminCheck = await Database.queryOne(
      'SELECT is_admin FROM users WHERE id = $1',
      [user.id]
    );

    if (!adminCheck?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get user ID to delete from query params
    const { searchParams } = new URL(request.url);
    const userIdToDelete = searchParams.get('userId');

    if (!userIdToDelete) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userIdToDelete === user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToDelete = await Database.queryOne(
      'SELECT id, email, name, is_admin FROM users WHERE id = $1',
      [userIdToDelete]
    );

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting other admins (optional safety check)
    if (userToDelete.is_admin) {
      return NextResponse.json(
        { error: 'Cannot delete another admin account' },
        { status: 403 }
      );
    }

    // Delete user (CASCADE will handle related records)
    await Database.query(
      'DELETE FROM users WHERE id = $1',
      [userIdToDelete]
    );

    return NextResponse.json({
      success: true,
      message: `User ${userToDelete.email} has been deleted successfully`,
      deletedUser: {
        id: userToDelete.id,
        email: userToDelete.email,
        name: userToDelete.name
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

