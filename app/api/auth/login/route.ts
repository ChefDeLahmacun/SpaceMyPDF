import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/auth/validation';
import { PasswordUtils } from '@/lib/auth/password';
import { UserQueries } from '@/lib/db/queries/users';
import { JWTUtils } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Get user by email
    const user = await UserQueries.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user account is active
    if (user.subscription_status === 'cancelled') {
      return NextResponse.json(
        { error: 'Account has been cancelled' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = JWTUtils.generateToken({
      userId: user.id,
      email: user.email,
      subscriptionStatus: user.subscription_status
    });

    // Update last activity
    await UserQueries.updateUser(user.id, { updated_at: new Date() });

    // Return user data (without password hash)
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
