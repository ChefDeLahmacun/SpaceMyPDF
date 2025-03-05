import { NextResponse } from 'next/server';

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
        // For security, we're just logging the file size and type in development
        // In production, you would use a secure service to handle file uploads
        console.log(`Attachment ${i+1}: ${file.size} bytes, type: ${file.type}`);
        
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
    
    // Log the feedback for development purposes
    console.log('Received feedback:', feedback);
    console.log('Number of attachments:', attachments.length);
    console.log('Total feedback items stored:', feedbackStore.length);
    
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