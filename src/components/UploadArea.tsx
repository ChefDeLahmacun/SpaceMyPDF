'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
}

export default function UploadArea({ onFileSelect }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div
      {...getRootProps()}
      className={`
        relative p-8 rounded-2xl border-2 border-dashed transition-all duration-300
        ${isDragActive 
          ? 'border-navy-400 bg-navy-50' 
          : 'border-gray-200 bg-white hover:border-navy-200 hover:bg-gray-50'
        }
      `}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={() => setIsDragging(false)}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`
          p-4 rounded-full bg-navy-50 text-navy-600
          transition-transform duration-300
          ${isDragging ? 'scale-110' : 'scale-100'}
        `}>
          <FiUploadCloud className="w-8 h-8" />
        </div>

        {selectedFile ? (
          <div className="flex items-center gap-3 p-3 pr-4 bg-navy-50 rounded-lg animate-fade-in">
            <div className="p-2 bg-white rounded-md">
              <FiFile className="w-5 h-5 text-navy-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-navy-700 truncate max-w-[200px]">
                {selectedFile.name}
              </span>
              <span className="text-xs text-navy-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-white rounded-full transition-colors ml-2"
              aria-label="Remove file"
            >
              <FiX className="w-4 h-4 text-navy-500" />
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-base font-medium text-gray-700">
                Drop your PDF here, or{' '}
                <span className="text-navy-600 hover:text-navy-700 cursor-pointer">
                  browse
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                PDF files up to 10MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 