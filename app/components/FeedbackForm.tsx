import React, { useRef, useEffect, useState } from 'react';
import { FaComment, FaPaperclip, FaTrash, FaPaperPlane } from 'react-icons/fa';

interface FeedbackFormProps {
  feedback: string;
  setFeedback: (feedback: string) => void;
  feedbackImages: File[];
  feedbackImagePreviews: string[];
  handleFeedbackImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearAllFeedbackImages: () => void;
  removeFeedbackImage: (index: number) => void;
  submitFeedback: () => void;
  feedbackSectionNeedsExtraHeight: boolean;
  feedbackSubmitted: boolean;
}

const FeedbackForm = ({
  feedback,
  setFeedback,
  feedbackImages,
  feedbackImagePreviews,
  handleFeedbackImageUpload,
  clearAllFeedbackImages,
  removeFeedbackImage,
  submitFeedback,
  feedbackSectionNeedsExtraHeight,
  feedbackSubmitted
}: FeedbackFormProps) => {
  const feedbackImageRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenFormRef = useRef<HTMLFormElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingTime, setProcessingTime] = useState(3);
  const [showProcessing, setShowProcessing] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Set current URL on client side
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);
  
  // Reset state when feedbackSubmitted changes to false (new form)
  useEffect(() => {
    if (!feedbackSubmitted) {
      setIsSubmitting(false);
      setShowProcessing(false);
      setSubmissionStatus('idle');
      setErrorMessage('');
    }
  }, [feedbackSubmitted]);
  
  // Countdown timer for processing state
  useEffect(() => {
    if (showProcessing && processingTime > 0) {
      const timer = setTimeout(() => {
        setProcessingTime(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (showProcessing && processingTime === 0 && submissionStatus === 'success') {
      setShowProcessing(false);
      // Call the submitFeedback function to update UI
      submitFeedback();
    } else if (showProcessing && processingTime === 0 && submissionStatus === 'error') {
      setShowProcessing(false);
      setIsSubmitting(false);
    }
  }, [showProcessing, processingTime, submitFeedback, submissionStatus]);
  
  // Create a hidden iframe for form submission
  useEffect(() => {
    // Create iframe if it doesn't exist
    if (!document.getElementById('hidden_feedback_iframe')) {
      const iframe = document.createElement('iframe');
      iframe.id = 'hidden_feedback_iframe';
      iframe.name = 'hidden_feedback_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    
    // Cleanup on unmount
    return () => {
      const iframe = document.getElementById('hidden_feedback_iframe');
      if (iframe) {
        document.body.removeChild(iframe);
      }
    };
  }, []);
  
  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      alert('Please enter some feedback before submitting.');
      return;
    }
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionStatus('sending');
    setShowProcessing(true);
    setErrorMessage('');
    
    // Set the processing time based on the number of images (more images = longer wait)
    const baseTime = 3; // Base time in seconds
    const additionalTimePerImage = 1; // Additional time per image in seconds
    const totalProcessingTime = baseTime + (feedbackImages.length * additionalTimePerImage);
    setProcessingTime(totalProcessingTime);
    
    try {
      // First, log the feedback to our API for storage
      const apiFormData = new FormData();
      apiFormData.append('feedback', feedback);
      feedbackImages.forEach((file) => {
        apiFormData.append('attachment', file);
      });
      
      // Send to our API
      const apiResponse = await fetch('/api/feedback', {
        method: 'POST',
        body: apiFormData,
      });
      
      const apiResult = await apiResponse.json();
      
      if (!apiResult.success) {
        throw new Error('Failed to store feedback');
      }
      
      // Now, submit to FormSubmit.co using a hidden form
      const hiddenForm = hiddenFormRef.current;
      if (!hiddenForm) {
        throw new Error('Form reference not available');
      }
      
      // Clear any existing inputs
      while (hiddenForm.firstChild) {
        hiddenForm.removeChild(hiddenForm.firstChild);
      }
      
      // Set form attributes
      hiddenForm.action = 'https://formsubmit.co/code.canogullari@gmail.com';
      hiddenForm.method = 'POST';
      hiddenForm.enctype = 'multipart/form-data';
      hiddenForm.target = 'hidden_feedback_iframe';
      
      // Add message field
      const messageInput = document.createElement('input');
      messageInput.type = 'hidden';
      messageInput.name = 'message';
      messageInput.value = feedback;
      hiddenForm.appendChild(messageInput);
      
      // Add subject field
      const subjectInput = document.createElement('input');
      subjectInput.type = 'hidden';
      subjectInput.name = '_subject';
      subjectInput.value = `PDFextend Feedback - ${new Date().toLocaleString()}`;
      hiddenForm.appendChild(subjectInput);
      
      // Disable captcha
      const captchaInput = document.createElement('input');
      captchaInput.type = 'hidden';
      captchaInput.name = '_captcha';
      captchaInput.value = 'false';
      hiddenForm.appendChild(captchaInput);
      
      // Use table template
      const templateInput = document.createElement('input');
      templateInput.type = 'hidden';
      templateInput.name = '_template';
      templateInput.value = 'table';
      hiddenForm.appendChild(templateInput);
      
      // Add all images
      feedbackImages.forEach((file, index) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = `attachment${index + 1}`;
        fileInput.style.display = 'none';
        
        // Create a DataTransfer to set the file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        hiddenForm.appendChild(fileInput);
      });
      
      // Submit the form
      hiddenForm.submit();
      
      // Set success status
      setSubmissionStatus('success');
      
      console.log('Feedback submitted successfully!');
      
      // If the submission completes before the countdown, we'll still wait
      // for the countdown to finish before showing success
      if (processingTime <= 0) {
        setShowProcessing(false);
        submitFeedback();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmissionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'There was an error submitting your feedback. Please try again.');
      
      // If the countdown is already finished, hide the processing screen
      if (processingTime <= 0) {
        setShowProcessing(false);
        setIsSubmitting(false);
      }
    }
  };

  // Reset the form and error state
  const handleRetry = () => {
    setSubmissionStatus('idle');
    setErrorMessage('');
    setIsSubmitting(false);
    setShowProcessing(false);
  };

  return (
    <div style={{ width: '100%', marginBottom: 0 }}>
      {/* Hidden form for FormSubmit.co submission */}
      <form 
        ref={hiddenFormRef}
        style={{ display: 'none' }}
      ></form>
      
      <div className="feedback-section" style={{
        width: '100%',
        minHeight: feedbackSubmitted ? '50vh' : (feedbackSectionNeedsExtraHeight ? '50vh' : '40vh'),
        padding: '2vh 2% 4vh 2%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2,
        overflow: 'visible',
        borderRadius: '0 0 25px 25px'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          width: '100%',
          flex: 1,
          position: 'relative',
          zIndex: 3,
          paddingTop: '0.5vh',
          paddingBottom: 0
        }}>
          <h2 style={{ 
            fontSize: 'clamp(18px, 2.2vw, 22px)',
            fontWeight: '600', 
            marginBottom: '1.5vh',
            color: '#2c3e50',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            {!feedbackSubmitted && !showProcessing ? (
              <>
                <FaComment style={{ color: '#4a6741' }} />
                Tell Us What You Think
              </>
            ) : showProcessing ? (
              <>
                <div style={{ width: '24px', height: '24px', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '3px solid rgba(74, 103, 65, 0.3)',
                    borderTop: '3px solid #4a6741',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <style jsx>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
                Processing Your Feedback
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#4a6741' }}>
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" 
                    fill="currentColor"/>
                </svg>
                Thank You For Your Feedback
              </>
            )}
          </h2>
          
          <p style={{ 
            fontSize: 'clamp(12px, 1.4vw, 14px)',
            textAlign: 'center', 
            maxWidth: '700px',
            margin: '0 auto 2vh auto',
            color: '#34495e',
            lineHeight: '1.4',
            width: '100%'
          }}>
            {!feedbackSubmitted && !showProcessing ? 
              "Please share your feedback and include screenshots of any issues you encounter." :
              showProcessing ?
              "Please wait while we process your feedback. This ensures all your data is properly sent." :
              "We appreciate you taking the time to help us improve PDFextend."
            }
          </p>
          
          <div style={{
            width: '90%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5vh',
            position: 'relative',
            height: feedbackSubmitted || showProcessing ? '30vh' : 'auto'
          }}>
            {!feedbackSubmitted && !showProcessing ? (
              <form 
                ref={formRef}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5vh'
                }}
                onSubmit={handleFormSubmit}
              >
                <textarea
                  name="message"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  style={{
                    width: '100%',
                    height: '15vh',
                    padding: '1.2vh 1.2%',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    marginBottom: '0.5vh',
                    resize: 'none',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    fontSize: 'clamp(12px, 1.4vw, 14px)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    color: '#2c3e50',
                    overflowY: 'auto',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Share your thoughts, ideas, or any issues you've found. Screenshots of problems are very helpful!"
                />
                
                <div style={{
                  width: '100%',
                  marginBottom: '5px',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '5px'
                  }}>
                    <p style={{ 
                      margin: '0', 
                      fontSize: '15px', 
                      fontWeight: '600',
                      color: '#2c3e50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaPaperclip style={{ color: '#4a6741' }} />
                      Attach Screenshots
                    </p>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => feedbackImageRef.current?.click()}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#4a6741',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <FaPaperclip size={12} />
                        Add Image
                      </button>
                      
                      {feedbackImages.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllFeedbackImages}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <FaTrash size={12} />
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Hidden file input for UI interaction */}
                  <input
                    ref={feedbackImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFeedbackImageUpload}
                    multiple
                    style={{ 
                      display: 'none'
                    }}
                  />
                  
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666', 
                    margin: '0 0 5px 0',
                    fontStyle: 'italic'
                  }}>
                    Maximum file size: 5MB per image
                  </p>
                  
                  {feedbackImagePreviews.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginTop: '10px'
                    }}>
                      {feedbackImagePreviews.map((preview, index) => (
                        <div 
                          key={index} 
                          style={{
                            position: 'relative',
                            width: '80px',
                            height: '80px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}
                        >
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeFeedbackImage(index)}
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(231, 76, 60, 0.8)',
                              color: 'white',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '12px',
                              padding: '0'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {feedbackImages.length > 0 && (
                    <p style={{
                      fontSize: '12px',
                      color: '#e67e22',
                      margin: '10px 0 0 0',
                      fontStyle: 'italic'
                    }}>
                      Note: Your feedback will be sent to our team via email. Thank you for helping us improve!
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: isSubmitting ? '#8ba980' : '#4a6741',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSubmitting ? 'default' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '200px',
                    margin: '2vh auto 4vh auto'
                  }}
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <FaPaperPlane size={12} />
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            ) : showProcessing ? (
              <div style={{ 
                padding: '25px 30px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: submissionStatus === 'error' ? '1px solid #f8d7da' : '1px solid #c3e6cb',
                borderRadius: '8px',
                color: submissionStatus === 'error' ? '#721c24' : '#155724',
                fontSize: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '350px',
                margin: '0 auto',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: submissionStatus === 'error' ? '#e74c3c' : '#4a6741',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '5px',
                  position: 'relative'
                }}>
                  {submissionStatus === 'error' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" 
                        fill="white"/>
                    </svg>
                  ) : (
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '3px solid white',
                      animation: 'spin 1s linear infinite'
                    }} />
                  )}
                </div>
                <div>
                  <h3 style={{ 
                    margin: '0 0 5px 0', 
                    color: '#2c3e50', 
                    fontSize: '18px', 
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    {submissionStatus === 'error' 
                      ? 'Error' 
                      : submissionStatus === 'sending' 
                        ? 'Sending Feedback...' 
                        : 'Processing...'}
                  </h3>
                  <p style={{ 
                    margin: '0 0 10px 0', 
                    color: '#34495e', 
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    {submissionStatus === 'error'
                      ? errorMessage || 'There was an error submitting your feedback.'
                      : submissionStatus === 'sending' 
                        ? 'Your feedback is being sent to our team.' 
                        : 'Please wait while we process your feedback.'}
                  </p>
                  {submissionStatus !== 'error' && (
                    <p style={{
                      margin: '0',
                      color: '#4a6741',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {processingTime} seconds remaining
                    </p>
                  )}
                  {submissionStatus === 'error' ? (
                    <button
                      onClick={handleRetry}
                      style={{
                        marginTop: '15px',
                        padding: '8px 16px',
                        backgroundColor: '#4a6741',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Try Again
                    </button>
                  ) : (
                    <p style={{
                      margin: '10px 0 0 0',
                      color: '#e74c3c',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Please wait until the process completes.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ 
                padding: '25px 30px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #c3e6cb',
                borderRadius: '8px',
                color: '#155724',
                fontSize: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '350px',
                margin: '0 auto',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#4a6741',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '5px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" 
                      fill="white"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{ 
                    margin: '0 0 5px 0', 
                    color: '#2c3e50', 
                    fontSize: '18px', 
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    Thank You!
                  </h3>
                  <p style={{ 
                    margin: '0', 
                    color: '#34495e', 
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    Your feedback has been submitted successfully.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;