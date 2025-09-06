import React from 'react';

interface DownloadOptionsProps {
  baseFileName: string;
  handleBaseFileNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetBaseFileName: () => void;
  includeWithNotes: boolean;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  outputFileName: string;
  handleDownload: () => void;
  downloadIsProcessing: boolean;
  file: File | null;
  totalPages: number;
}

const DownloadOptions = ({
  baseFileName,
  handleBaseFileNameChange,
  resetBaseFileName,
  includeWithNotes,
  handleCheckboxChange,
  outputFileName,
  handleDownload,
  downloadIsProcessing,
  file,
  totalPages
}: DownloadOptionsProps) => {
  return (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '15px' }}>Download Options</h3>
      
      {/* File name settings */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Output File Name</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <input
            id="downloadBaseFileName"
            type="text"
            value={baseFileName}
            onChange={handleBaseFileNameChange}
            style={{ padding: '8px', width: '250px' }}
            placeholder="Enter file name"
          />
          <button
            onClick={resetBaseFileName}
            style={{
              padding: '5px 10px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            id="includeWithNotesCheckbox"
            type="checkbox"
            checked={includeWithNotes}
            onChange={handleCheckboxChange}
          />
          Add "_with_notes" to filename
        </label>
        <p style={{ marginTop: '5px', fontSize: '14px' }}>
          Output file will be saved as: <strong>{outputFileName}</strong>
        </p>
      </div>
      
      {/* Download button */}
      <div>
        <button
          onClick={handleDownload}
          disabled={!file || downloadIsProcessing}
          style={{
            padding: '10px 20px',
            backgroundColor: !file ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !file ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {downloadIsProcessing ? (
            <>
              Processing...
            </>
          ) : (
            <>
              <span style={{ fontSize: '18px' }}>↓</span>
              Download PDF with Note Space
            </>
          )}
        </button>
        {file && (
          <p style={{ marginTop: '5px', fontSize: '14px' }}>
            Total pages: {totalPages}
          </p>
        )}
      </div>
    </div>
  );
};

export default DownloadOptions; 