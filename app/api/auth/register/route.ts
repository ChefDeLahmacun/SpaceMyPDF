import { NextRequest, NextResponse } from 'next/server';
import { registerSchema, validateEmail } from '@/lib/auth/validation';
import { PasswordUtils } from '@/lib/auth/password';
import { UserQueries } from '@/lib/db/queries/users';
import { JWTUtils } from '@/lib/auth/jwt';
import { emailService } from '@/lib/email/service';
import { AntiFraudService } from '@/lib/security/anti-fraud';
import { NotificationService } from '@/lib/services/notification-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Registration request body:', body);
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation errors:', validationResult.error.issues);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { name, email, password, phone, referralCode } = validationResult.data;
    
    // Anti-fraud analysis
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    
    const fraudAnalysis = AntiFraudService.analyzeUser({
      email,
      ip: clientIP,
      userAgent,
      referralCode,
      timestamp: new Date()
    });

    console.log('Fraud analysis:', {
      score: fraudAnalysis.score,
      isFraud: fraudAnalysis.isFraud,
      reasons: fraudAnalysis.reasons
    });

    // Handle high-risk registrations
    if (fraudAnalysis.isFraud) {
      console.log('Blocking high-risk registration:', fraudAnalysis.reasons);
      return NextResponse.json(
        { 
          error: 'Registration blocked due to suspicious activity',
          details: 'Please contact support if you believe this is an error'
        },
        { status: 403 }
      );
    }
    
    // Clean phone number (remove spaces)
    const cleanedPhone = phone ? phone.replace(/\s/g, '') : phone;

    // Validate email format and check for temporary emails
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserQueries.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check phone number for duplicate (allow registration, but may skip trial)
    const phoneCheck = await AntiFraudService.checkPhoneForTrial(cleanedPhone);
    console.log('Phone number check:', phoneCheck);

    // Validate referral code if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await UserQueries.getUserByReferralCode(referralCode);
      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        );
      }
      referredBy = referrer.id;
    }

    // Hash password
    const passwordHash = await PasswordUtils.hashPassword(password);

    // Determine trial eligibility
    // If phone number is duplicate, skip trial (set to expired immediately)
    const skipTrial = phoneCheck.isDuplicate;

    // Create user
    const userData = {
      name,
      email,
      password_hash: passwordHash,
      phone: cleanedPhone,
      referred_by: referredBy || undefined
    };

    const newUser = await UserQueries.createUser(userData);

    // If duplicate phone, update to skip trial
    if (skipTrial) {
      const { Database } = await import('@/lib/db/connection');
      await Database.query(
        `UPDATE users 
         SET subscription_status = 'expired', 
             trial_ends_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [newUser.id]
      );
      newUser.subscription_status = 'expired';
      newUser.trial_ends_at = new Date().toISOString();
      console.log('Trial skipped for duplicate phone number');
    }

    // Create default notification preferences
    try {
      await NotificationService.createDefaultPreferences(newUser.id);
      console.log('Default notification preferences created for user:', newUser.id);
    } catch (error) {
      console.error('Error creating notification preferences:', error);
      // Don't fail registration if this fails
    }

    // Process referral if provided
    if (referredBy) {
      try {
        // Import ReferralQueries here to avoid circular dependency
        const { ReferralQueries } = await import('@/lib/db/queries/referrals');
        
        // Apply referral bonus
        await ReferralQueries.applyReferralBonus(referredBy, newUser.id);
        console.log('Referral bonus applied successfully');
        
        // Get updated user data after referral bonus
        const updatedUser = await UserQueries.getUserById(newUser.id);
        if (updatedUser) {
          newUser.trial_ends_at = updatedUser.trial_ends_at;
        }
      } catch (error) {
        console.error('Error applying referral bonus:', error);
        // Don't fail registration if referral bonus fails
      }
    }

    // Generate JWT token
    const token = JWTUtils.generateToken({
      userId: newUser.id,
      email: newUser.email,
      subscriptionStatus: newUser.subscription_status
    });

    // Send welcome email (don't wait for it to complete)
    emailService.sendWelcomeEmail(newUser.email, newUser.name, newUser.referral_code)
      .then(success => {
        if (success) {
          console.log('Welcome email sent successfully to:', newUser.email);
        } else {
          console.log('Failed to send welcome email to:', newUser.email);
        }
      })
      .catch(error => {
        console.error('Error sending welcome email:', error);
      });

    // Return user data (without password hash)
    const { password_hash, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'User registered successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
