'use client';

import { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PDFViewerProps {
  file: File;
  noteSpaceWidth: number;
  scale?: number;
}

export default function PDFViewer({ file, noteSpaceWidth, scale = 1.0 }: PDFViewerProps) {
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const generatePreview = async () => {
      try {
        setIsProcessing(true);
        
        // Read the file
        const fileBuffer = await file.arrayBuffer();
        const originalPdfDoc = await PDFDocument.load(fileBuffer);
        const totalPageCount = originalPdfDoc.getPageCount();
        setTotalPages(totalPageCount);

        // Create preview document (max 3 pages)
        const previewDoc = await PDFDocument.create();
        const pagesToPreview = Math.min(totalPageCount, 3);

        // Copy pages to preview document
        for (let i = 0; i < pagesToPreview; i++) {
          const [page] = await previewDoc.copyPages(originalPdfDoc, [i]);
          
          // If noteSpaceWidth is provided, extend the page
          if (noteSpaceWidth > 0) {
            const { width, height } = page.getSize();
            
            // Calculate actual note space width in points based on percentage
            const actualNoteSpaceWidth = width * noteSpaceWidth / 100;
            
            page.setSize(width + actualNoteSpaceWidth, height);
          }
          
          previewDoc.addPage(page);
        }

        // Save and create URL for preview
        const pdfBytes = await previewDoc.save();
        
        // Clean up old preview URL
        if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);

        // Create new preview URL
        const previewUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
        setPdfPreviewUrl(previewUrl);
      } catch (error) {
        console.error('Error generating preview:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    if (file) {
      generatePreview();
    }

    // Cleanup function
    return () => {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    };
  }, [file, noteSpaceWidth]);

  if (isProcessing) {
    return (
      <div style={{ 
        width: '100%', 
        height: '300px', 
        backgroundColor: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p>Processing PDF...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '300px', backgroundColor: 'white' }}>
      {pdfPreviewUrl ? (
        <iframe 
          src={pdfPreviewUrl} 
          style={{ 
            width: '100%', 
            height: '100%',
            transform: `scale(${scale})`, 
            transformOrigin: 'top left' 
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
  );
} 