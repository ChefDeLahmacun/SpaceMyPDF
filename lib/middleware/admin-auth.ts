import { NextRequest } from 'next/server';

export interface AdminAuthResult {
  isAdmin: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}

export async function authenticateAdmin(request: NextRequest): Promise<AdminAuthResult> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false, error: 'No authorization token provided' };
    }

    const token = authHeader.substring(7);
    
    // Verify the token
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return { isAdmin: false, error: 'Invalid or expired token' };
    }

    const data = await response.json();
    const user = data.user;

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = adminEmails.includes(user.email);

    if (!isAdmin) {
      return { isAdmin: false, error: 'Access denied. Admin privileges required.' };
    }

    return {
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };

  } catch (error) {
    console.error('Admin authentication error:', error);
    return { isAdmin: false, error: 'Authentication failed' };
  }
}


