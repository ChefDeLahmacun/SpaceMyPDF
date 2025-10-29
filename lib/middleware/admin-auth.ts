import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from './auth';
import { Database } from '@/lib/db/connection';

export async function authenticateAdmin(request: NextRequest) {
  // First, authenticate the user
  const authResult = await authenticateRequest(request);
  
  if (!authResult.isAuthenticated) {
    return {
      isAdmin: false,
      error: authResult.error
    };
  }

  const user = authResult.user!;
  
  // Check if user has admin privileges in database
  try {
    const adminCheck = await Database.queryOne(
      'SELECT is_admin FROM users WHERE id = $1',
      [user.id]
    );
    
    const isAdmin = adminCheck?.is_admin === true;
    
    if (!isAdmin) {
      return {
        isAdmin: false,
        error: 'Admin access required'
      };
    }

    return {
      isAdmin: true,
      user: {
        ...user,
        isAdmin: true
      }
    };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return {
      isAdmin: false,
      error: 'Failed to verify admin status'
    };
  }
}
