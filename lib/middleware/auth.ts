import { NextRequest, NextResponse } from 'next/server';
import { JWTUtils } from '@/lib/auth/jwt';
import { UserQueries } from '@/lib/db/queries/users';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    subscriptionStatus: string;
  };
}

// Middleware to authenticate requests
export async function authenticateRequest(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user?: any;
  error?: string;
}> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    console.log('Auth middleware - token extracted:', !!token);

    if (!token) {
      return {
        isAuthenticated: false,
        error: 'No authentication token provided'
      };
    }

    // Verify token
    const payload = JWTUtils.verifyToken(token);
    console.log('Auth middleware - token verified:', !!payload);
    
    if (!payload) {
      return {
        isAuthenticated: false,
        error: 'Invalid or expired token'
      };
    }

    // Get user from database to ensure they still exist and are active
    const user = await UserQueries.getUserById(payload.userId);
    if (!user) {
      return {
        isAuthenticated: false,
        error: 'User not found'
      };
    }

    // Note: We don't log out users with cancelled subscriptions
    // They should still be able to access their account, just not premium features

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionStatus: user.subscription_status,
        phone: user.phone,
        phoneVerified: user.phone_verified,
        referralCode: user.referral_code,
        trialEnd: user.trial_ends_at,
        created_at: user.created_at
      }
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication failed'
    };
  }
}

// Middleware to check if user has active subscription
export async function requireActiveSubscription(request: NextRequest): Promise<{
  hasAccess: boolean;
  user?: any;
  error?: string;
}> {
  const authResult = await authenticateRequest(request);
  
  if (!authResult.isAuthenticated) {
    return {
      hasAccess: false,
      error: authResult.error
    };
  }

  const user = authResult.user!;
  
  // Check if user has active subscription or is in trial
  const hasActiveSubscription = await UserQueries.hasActiveSubscription(user.id);
  
  if (!hasActiveSubscription) {
    return {
      hasAccess: false,
      user,
      error: 'Active subscription required'
    };
  }

  return {
    hasAccess: true,
    user
  };
}

// Helper function to create authenticated response
export function createAuthenticatedResponse(user: any, data?: any) {
  return NextResponse.json({
    success: true,
    user,
    ...data
  });
}

// Helper function to create error response
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: message
  }, { status });
}
