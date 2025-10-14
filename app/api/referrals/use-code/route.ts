import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { ReferralQueries } from '@/lib/db/queries/referrals';
import { UserQueries } from '@/lib/db/queries/users';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const useReferralCodeSchema = z.object({
  referralCode: z.string()
    .min(6, 'Referral code must be at least 6 characters')
    .max(10, 'Referral code must be at most 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Referral code must contain only uppercase letters and numbers')
});

export async function POST(request: NextRequest) {
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
    const validationResult = useReferralCodeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { referralCode } = validationResult.data;

    // Check if user has already used a referral code
    const alreadyReferred = await ReferralQueries.isUserReferred(user.id);
    if (alreadyReferred) {
      return NextResponse.json(
        { error: 'You have already used a referral code' },
        { status: 400 }
      );
    }

    // Validate referral code
    const validation = await ReferralQueries.validateReferralCode(referralCode, user.id);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Apply referral bonus
    const bonusResult = await ReferralQueries.applyReferralBonus(
      validation.referrer!.id,
      user.id
    );

    // Get updated user data
    const updatedUser = await UserQueries.getUserById(user.id);

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully',
      bonus: {
        referrerBonus: bonusResult.referrerBonus,
        refereeBonus: bonusResult.refereeBonus
      },
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        trial_ends_at: updatedUser!.trial_ends_at,
        subscription_status: updatedUser!.subscription_status
      }
    });

  } catch (error) {
    console.error('Use referral code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
