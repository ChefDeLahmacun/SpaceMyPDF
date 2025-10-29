import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { UserQueries } from '@/lib/db/queries/users';
import { validateEmail } from '@/lib/auth/validation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().optional()
});

export async function PUT(request: NextRequest) {
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

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { email, phone } = validationResult.data;

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }


    // Check if email is already in use by another user
    if (email !== user.email) {
      const existingUser = await UserQueries.getUserByEmail(email);
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 409 }
        );
      }
    }

    // Check if phone is already in use by another user
    if (phone && phone !== user.phone) {
      const existingPhone = await UserQueries.getUserByPhone(phone);
      if (existingPhone && existingPhone.id !== user.id) {
        return NextResponse.json(
          { error: 'Phone number is already in use' },
          { status: 409 }
        );
      }
    }

    // Update user profile
    const updatedUser = await UserQueries.updateUser(user.id, {
      email,
      phone: phone || undefined
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        phoneVerified: updatedUser.phone_verified,
        subscriptionStatus: updatedUser.subscription_status,
        referralCode: updatedUser.referral_code
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
