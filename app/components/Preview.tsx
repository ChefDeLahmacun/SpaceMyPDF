'use client';

import React from 'react';
import './Spinner.css';

interface PreviewProps {
  file: File | null;
  isProcessing: boolean;
  pdfPreviewUrl: string | { original: string, modified: string };
}

const Preview: React.FC<PreviewProps> = ({ file, isProcessing, pdfPreviewUrl }) => {
  return (
    <div style={{
      flex: 3,
      padding: '20px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible'
    }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '600',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '12px',
        marginTop: '0',
        letterSpacing: '0.5px'
      }}>
        Preview
      </h2>
      
      {/* How-to-use instructions */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: '12px 15px',
        borderRadius: '8px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <p style={{ fontSize: '14px', margin: '0', lineHeight: '1.5', color: '#34495e' }}>
          <strong>How to use:</strong> Upload your PDF, adjust the note space to fit your needs, 
          and download. Open the downloaded PDF in your preferred note-taking application to start writing notes in the added space.
        </p>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '8px', 
            marginTop: '0',
            color: '#2c3e50'
          }}>
            Original Document
          </h3>
          
          <div style={{ 
            height: '300px',
            border: '1px solid #ddd',
            backgroundColor: 'white'
          }}>
            {file ? (
              <div style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: 'white', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  position: 'relative'
                }}>
                  {isProcessing ? (
                    <div 
                      key={`processing-${Date.now()}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f9f9f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: '15px',
                        zIndex: 5
                      }}
                    >
                      <div className="spinner"></div>
                      <p className="processing-text">Processing PDF...</p>
                    </div>
                  ) : null}
                  
                  {pdfPreviewUrl ? (
                    <iframe 
                      src={`${typeof pdfPreviewUrl === 'object' ? pdfPreviewUrl.original : pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        border: 'none'
                      }} 
                      title="PDF Preview"
                    />
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%' 
                    }}>
                      <p>PDF preview not available</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.5)',
                border: '1px dashed #999'
              }}>
                <p>Upload a PDF to see original</p>
              </div>
            )}
          </div>
          
          {/* Note about PDF text extraction message */}
          {file && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '8px 12px',
              borderRadius: '4px',
              marginTop: '10px',
              marginBottom: '2px',
              border: '1px solid #e9ecef',
              fontSize: '13px',
              color: '#495057'
            }}>
              <p style={{ margin: '0', lineHeight: '1.4' }}>
                <strong>Note:</strong> You might see a message saying "Extracting text from PDF..." briefly. 
                This is normal behavior from the PDF viewer and doesn't affect your document.
              </p>
            </div>
          )}
        </div>
        
        <div style={{ height: '1px', backgroundColor: 'black', margin: '2px 0' }}></div>
        
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', marginTop: '0' }}>Preview with Notes</h3>
          <div style={{ 
            height: '300px',
            border: '1px solid #ddd',
            backgroundColor: 'white'
          }}>
            {file ? (
              <div style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: 'white', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  position: 'relative'
                }}>
                  {isProcessing ? (
                    <div 
                      key={`processing-${Date.now()}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f9f9f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: '15px',
                        zIndex: 5
                      }}
                    >
                      <div className="spinner"></div>
                      <p className="processing-text">Processing PDF...</p>
                    </div>
                  ) : null}
                  
                  {pdfPreviewUrl ? (
                    <iframe 
                      src={`${typeof pdfPreviewUrl === 'object' ? pdfPreviewUrl.modified : pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        border: 'none'
                      }} 
                      title="PDF Preview with Notes"
                    />
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%' 
                    }}>
                      <p>PDF preview not available</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.5)',
                border: '1px dashed #999'
              }}>
                <p>Upload a PDF to see preview</p>
              </div>
            )}
          </div>
          {file && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '12px', margin: '0' }}>Note: Only the first 3 pages will be shown in the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;