import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { Database } from '@/lib/db/connection';
import { emailService } from '@/lib/email/service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const featureRequestSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters')
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
    const validationResult = featureRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { title, description } = validationResult.data;

    // Create feature request
    const query = `
      INSERT INTO feature_requests (user_id, title, description, status, priority, bonus_awarded)
      VALUES ($1, $2, $3, 'pending', 'medium', FALSE)
      RETURNING id, title, description, status, priority, bonus_awarded, created_at
    `;
    
    const featureRequest = await Database.queryOne(query, [user.id, title, description]);

    // Send confirmation email (don't wait for it to complete)
    emailService.sendFeatureRequestConfirmation(user.email, user.name, title)
      .catch(error => {
        console.error('Error sending feature request confirmation email:', error);
      });

    return NextResponse.json({
      success: true,
      featureRequest: {
        id: featureRequest.id,
        title: featureRequest.title,
        description: featureRequest.description,
        status: featureRequest.status,
        priority: featureRequest.priority,
        bonus_awarded: featureRequest.bonus_awarded,
        created_at: featureRequest.created_at
      },
      message: 'Feature request submitted successfully'
    });

  } catch (error) {
    console.error('Submit feature request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
