import React from 'react';
import './Preview.css';

interface PDFPreviewProps {
  pdfPreviewUrl: string | { original: string; modified: string };
  isProcessing: boolean;
}

const PDFPreview = ({ pdfPreviewUrl, isProcessing }: PDFPreviewProps) => {
  return (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '15px' }}>Preview</h3>
      
      {isProcessing ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh', 
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9'
        }}>
          <div className="spinner" style={{ 
            marginRight: '10px',
            border: '3px solid rgba(0, 0, 0, 0.1)',
            borderTopColor: '#4CAF50'
          }}></div>
          <p style={{ fontWeight: '500' }}>Processing PDF...</p>
        </div>
      ) : pdfPreviewUrl ? (
        <div>
          {typeof pdfPreviewUrl === 'string' ? (
            <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
              <iframe
                src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="pdf-preview-single"
                title="PDF Preview"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Original PDF:</p>
                <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                  <iframe
                    src={`${pdfPreviewUrl.original}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="pdf-preview-original"
                    title="Original PDF Preview"
                  />
                </div>
              </div>
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Modified PDF with Note Space:</p>
                <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                  <iframe
                    src={`${pdfPreviewUrl.modified}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="pdf-preview-modified"
                    title="Modified PDF Preview"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="pdf-viewer-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9'
        }}>
          <p>Upload a PDF to see the preview</p>
        </div>
      )}
    </div>
  );
};

export default PDFPreview; 