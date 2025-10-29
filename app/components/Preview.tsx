'use client';

import React, { useContext, useEffect } from 'react';
import './Spinner.css';
import './Preview.css';
import { GreenContentRefContext } from './Layout';
import Head from 'next/head';

interface PreviewProps {
  file: File | null;
  isProcessing: boolean;
  pdfPreviewUrl: string | { original: string, modified: string };
}

const Preview: React.FC<PreviewProps> = ({ file, isProcessing, pdfPreviewUrl }) => {
  const greenContentRef = useContext(GreenContentRefContext);
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div style={{
        padding: '2% 5%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        height: '100%',
        margin: 0,
        border: 'none',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(18px, 3vw, 24px)',
          fontWeight: '600',
          color: '#2c3e50',
          textAlign: 'center',
          marginBottom: '1.5vh',
          marginTop: '0',
          letterSpacing: '0.5px'
        }}>
          Preview
        </h2>
        
        {/* How-to-use instructions */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.7)',
          padding: '1.5vh 2%',
          borderRadius: '8px',
          marginBottom: '1.5vh',
          border: '1px solid #ddd',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          width: '100%'
        }}>
          <p style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', margin: '0', lineHeight: '1.5', color: '#34495e' }}>
            <strong>How to use:</strong> Upload your PDF, adjust the note space to fit your needs, 
            and download. Open the downloaded PDF in your preferred note-taking application to start writing notes in the added space.
          </p>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ marginBottom: '2vh', width: '100%' }}>
            <h3 style={{ 
              fontSize: 'clamp(16px, 2vw, 18px)',
              fontWeight: '600', 
              marginBottom: '1vh',
              marginTop: '0',
              color: '#2c3e50'
            }}>
              Original Document
            </h3>
            
            <div style={{ 
              height: '60vh',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '4px',
              width: '100%'
            }}>
              {file ? (
                <div style={{ height: '100%', overflow: 'auto', position: 'relative', width: '100%' }}>
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: 'white', 
                    display: 'flex', 
                    justifyContent: 'flex-start', 
                    alignItems: 'flex-start',
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
                          gap: '3%',
                          zIndex: 5
                        }}
                      >
                        <div className="spinner"></div>
                        <p className="processing-text">Processing PDF...</p>
                      </div>
                    ) : null}
                    
                    {pdfPreviewUrl ? (
                      <div className="pdf-preview-container">
                        <iframe 
                          src={`${typeof pdfPreviewUrl === 'object' ? pdfPreviewUrl.original : pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                          className="pdf-iframe"
                          title="PDF Preview"
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        width: '100%'
                      }}>
                        <p>Upload a PDF to see original</p>
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
                  border: '1px dashed #999',
                  width: '100%'
                }}>
                  <p>Upload a PDF to see original</p>
                </div>
              )}
            </div>
            
            {/* Note message about text extraction */}
            {file && (
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '5px',
                marginTop: '10px',
                maxHeight: '6rem',
                overflow: 'auto',
                lineHeight: '1.5',
              }}>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  <strong>Note:</strong> If you see "Extracting text from PDF..." briefly, this is normal behavior from the PDF viewer.
                </p>
              </div>
            )}
          </div>
          
          <div style={{ height: '1px', backgroundColor: 'black', margin: '0.2vh 0', width: '100%' }}></div>
          
          <div style={{ width: '100%' }}>
            <h3 style={{ 
              fontSize: 'clamp(16px, 2vw, 18px)',
              fontWeight: '600', 
              marginBottom: '1vh',
              marginTop: '0',
              color: '#2c3e50'
            }}>
              Preview with Notes
            </h3>
            <div style={{ 
              height: '60vh',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '4px',
              width: '100%'
            }}>
              {file ? (
                <div style={{ height: '100%', overflow: 'auto', position: 'relative', width: '100%' }}>
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: 'white', 
                    display: 'flex', 
                    justifyContent: 'flex-start', 
                    alignItems: 'flex-start',
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
                          gap: '3%',
                          zIndex: 5
                        }}
                      >
                        <div className="spinner"></div>
                        <p className="processing-text">Processing PDF...</p>
                      </div>
                    ) : null}
                    
                    {pdfPreviewUrl ? (
                      <div className="pdf-preview-container">
                        <iframe 
                          src={`${typeof pdfPreviewUrl === 'object' ? pdfPreviewUrl.modified : pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                          className="pdf-iframe"
                          title="PDF Preview with Notes"
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        width: '100%'
                      }}>
                        <p>Upload a PDF to see preview</p>
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
                  border: '1px dashed #999',
                  width: '100%'
                }}>
                  <p>Upload a PDF to see preview</p>
                </div>
              )}
            </div>
            
            {/* Preview limitation message */}
            {file && (
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '5px',
                marginTop: '10px',
                maxHeight: '6rem',
                overflow: 'auto',
                lineHeight: '1.5',
              }}>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  <strong>Preview Note:</strong> Only the first few pages are shown here. All pages will be processed.
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
                  Preview doesn't work sometimes for some reason. Please try a different browser. This will hopefully be fixed at a later patch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Preview;