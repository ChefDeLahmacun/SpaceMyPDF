import { useRef } from 'react';

interface FileUploadProps {
  file: File | null;
  handleFileUpload: (file: File) => void;
  clearFile: () => void;
  isProcessing: boolean;
}

const FileUpload = ({ file, handleFileUpload, clearFile, isProcessing }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Upload PDF</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          ref={fileInputRef}
          style={{ maxWidth: '300px' }}
          disabled={isProcessing}
        />
        {file && (
          <button
            onClick={clearFile}
            style={{
              padding: '5px 10px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
            disabled={isProcessing}
          >
            Clear
          </button>
        )}
      </div>
      {file && (
        <p style={{ marginTop: '5px', fontSize: '14px' }}>
          Selected file: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  );
};

export default FileUpload; 