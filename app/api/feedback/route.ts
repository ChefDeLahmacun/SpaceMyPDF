import { NextResponse } from 'next/server';
import { emailService } from '@/lib/email/service';

// Store feedback in memory for development purposes
// In production, you would use a database or external service
const feedbackStore: {
  id: string;
  feedback: string;
  timestamp: string;
  attachments: { name: string; size: number; type: string }[];
}[] = [];

export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();
    const feedback = formData.get('feedback')?.toString() || '';
    
    if (!feedback.trim()) {
      return NextResponse.json(
        { success: false, error: 'Feedback message is required' },
        { status: 400 }
      );
    }
    
    // Get all image files
    const attachments = [];
    const files = formData.getAll('attachment');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file instanceof Blob) {
        // Store file information for the response
        attachments.push({
          name: `image-${i + 1}.png`,
          size: file.size,
          type: file.type
        });
      }
    }
    
    // Generate a unique ID for this feedback
    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Store the feedback in memory (for development)
    feedbackStore.push({
      id: feedbackId,
      feedback,
      timestamp: new Date().toISOString(),
      attachments
    });
    
    // Send email notification to spacemypdf@gmail.com
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Feedback Received</h2>
        <p>A new feedback submission has been received on SpaceMyPDF.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Feedback Details:</h3>
          <p><strong>ID:</strong> ${feedbackId}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Attachments:</strong> ${attachments.length} file(s)</p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap;">${feedback}</p>
        </div>

        ${attachments.length > 0 ? `
          <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #d97706; margin-top: 0;">Attachments:</h4>
            <ul>
              ${attachments.map(att => `<li>${att.name} (${Math.round(att.size / 1024)}KB, ${att.type})</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <p style="color: #6b7280; font-size: 14px;">
          This feedback was submitted through the SpaceMyPDF website feedback form.
        </p>
      </div>
    `;

    // Send email notification (don't wait for it to complete)
    emailService.sendEmail({
      to: 'spacemypdf@gmail.com',
      subject: `New Feedback - ${feedbackId}`,
      html: emailHtml
    }).catch(error => {
      console.error('Error sending feedback notification email:', error);
    });
    
    // Simulate a slight delay to ensure the UI shows the processing state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Feedback received successfully',
      feedbackId,
      details: {
        timestamp: new Date().toISOString(),
        feedbackLength: feedback.length,
        attachments: attachments.length
      }
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

// Add a GET endpoint to retrieve all feedback (for development purposes)
export async function GET() {
  return NextResponse.json({ 
    success: true,
    count: feedbackStore.length,
    feedback: feedbackStore
  });
} 