'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface PDFUploadProps {
  onFileUpload: (file: File) => void;
}

export default function PDFUpload({ onFileUpload }: PDFUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        alert('Please upload a PDF file');
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  return (
    <div
      {...getRootProps()}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <input {...getInputProps()} />
      <button style={{
        padding: '8px 16px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        marginBottom: '8px',
        cursor: 'pointer',
        borderRadius: '3px'
      }}>
        CHOOSE FILES
      </button>
      <p>or drop PDF files here</p>
      <p style={{ fontSize: '14px', marginTop: '8px' }}>Max size: 50MB PDF files only</p>
    </div>
  );
} 