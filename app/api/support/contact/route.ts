import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { Database } from '@/lib/db/connection';
import { EmailService } from '@/lib/email/service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(255, 'Subject is too long'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000, 'Message is too long'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
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
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { subject, message, priority } = validationResult.data;

    // Store support ticket in database
    const ticketQuery = `
      INSERT INTO support_tickets (user_id, subject, message, priority, status, created_at)
      VALUES ($1, $2, $3, $4, 'open', NOW())
      RETURNING id, created_at
    `;
    
    const ticket = await Database.queryOne(ticketQuery, [
      user.id,
      subject,
      message,
      priority
    ]);

    // Send email notification to support team
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@spacemypdf.com';
    const emailSubject = `[${priority.toUpperCase()}] Support Ticket #${ticket.id}: ${subject}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #0c4a6e; margin: 0 0 10px 0;">New Support Ticket</h2>
          <p style="margin: 0; color: #0c4a6e;">
            <strong>Ticket ID:</strong> #${ticket.id}<br>
            <strong>Priority:</strong> ${priority.toUpperCase()}<br>
            <strong>User:</strong> ${user.email}<br>
            <strong>Created:</strong> ${new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0;">Subject</h3>
          <p style="color: #4b5563; margin: 0;">${subject}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0;">Message</h3>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">
            <p style="color: #4b5563; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-top: 20px;">
          <h4 style="color: #92400e; margin: 0 0 10px 0;">💡 Quick Actions</h4>
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            • Reply directly to this email to respond to the user<br>
            • Update ticket status in the admin panel<br>
            • Assign to appropriate team member if needed
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This email was sent from SpaceMyPDF Support System.
          </p>
        </div>
      </div>
    `;

    try {
      await EmailService.sendEmail(supportEmail, emailSubject, emailHtml);
    } catch (emailError) {
      console.error('Failed to send support email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Support ticket created successfully',
      ticketId: ticket.id,
      createdAt: ticket.created_at
    });

  } catch (error) {
    console.error('Create support ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
