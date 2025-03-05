'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface DownloadButtonProps {
  file: File;
  noteSpaceWidth: number;
  outputFileName?: string;
}

export default function DownloadButton({ file, noteSpaceWidth, outputFileName }: DownloadButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownload = async () => {
    try {
      setIsProcessing(true);

      // Read the file
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();

      // Modify each page
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.setSize(width + noteSpaceWidth, height);
      });

      // Save the PDF
      const modifiedPdfBytes = await pdfDoc.save();
      
      // Create download link
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = outputFileName || file.name.replace('.pdf', '_with_notes.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again with a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isProcessing}
      style={{
        width: '100%',
        padding: '8px 16px',
        backgroundColor: 'white',
        border: '1px solid black',
        borderRadius: '3px',
        cursor: isProcessing ? 'default' : 'pointer',
        opacity: isProcessing ? 0.7 : 1
      }}
    >
      {isProcessing ? 'Processing...' : 'Download PDF'}
    </button>
  );
} 