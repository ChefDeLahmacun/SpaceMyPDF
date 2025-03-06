'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';

interface ControlsProps {
  file: File | null;
  noteSpaceWidth: number;
  setNoteSpaceWidth: (width: number) => void;
  noteSpacePosition: string;
  setNoteSpacePosition: (position: string) => void;
  colorOption: string;
  setColorOption: (option: string) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  baseFileName: string;
  handleBaseFileNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  includeWithNotes: boolean;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetBaseFileName: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (file: File) => void;
  clearFile: () => void;
  handleDownload: () => void;
  downloadIsProcessing: boolean;
  predefinedColors: { name: string; value: string }[];
  specifyLocation: boolean;
  setSpecifyLocation: (specify: boolean) => void;
  successMessage: string;
}

const Controls: React.FC<ControlsProps> = ({
  file,
  noteSpaceWidth,
  setNoteSpaceWidth,
  noteSpacePosition,
  setNoteSpacePosition,
  colorOption,
  setColorOption,
  customColor,
  setCustomColor,
  baseFileName,
  handleBaseFileNameChange,
  includeWithNotes,
  handleCheckboxChange,
  resetBaseFileName,
  fileInputRef,
  handleFileUpload,
  clearFile,
  handleDownload,
  downloadIsProcessing,
  predefinedColors,
  specifyLocation,
  setSpecifyLocation,
  successMessage
}) => {
  const sliderRef = useRef<HTMLInputElement>(null);
  
  // Simple effect to trigger resize when important props change
  useEffect(() => {
    // Dispatch a resize event when file or colorOption changes
    window.dispatchEvent(new Event('resize'));
  }, [file, colorOption]);

  // Update slider background based on current value
  useEffect(() => {
    if (sliderRef.current) {
      const percentage = ((noteSpaceWidth - 10) / (150 - 10)) * 100;
      sliderRef.current.style.setProperty('--slider-percentage', `${percentage}%`);
    }
  }, [noteSpaceWidth]);

  return (
    <div style={{
      padding: '2% 5%',
      backgroundColor: '#c7edd4',
      height: '100%',
      overflow: 'auto',
      margin: 0,
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      boxSizing: 'border-box'
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
        Settings
      </h2>
      
      {/* Detailed instructions for controls section */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: '1.5vh 2%',
        borderRadius: '8px',
        marginBottom: '1.5vh',
        border: '1px solid #ddd',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        width: '100%'
      }}>
        <p style={{ fontSize: 'clamp(12px, 1.4vw, 14px)', margin: '0 0 0.8vh 0', lineHeight: '1.5', color: '#34495e' }}>
          <strong>Step 1:</strong> Upload your PDF below.
        </p>
        <p style={{ fontSize: 'clamp(12px, 1.4vw, 14px)', margin: '0 0 0.8vh 0', lineHeight: '1.5', color: '#34495e' }}>
          <strong>Step 2:</strong> Choose how wide you want your note space and where you want it.
        </p>
        <p style={{ fontSize: 'clamp(12px, 1.4vw, 14px)', margin: '0', lineHeight: '1.5', color: '#34495e' }}>
          <strong>Step 3:</strong> Download your PDF and open it in your preferred note-taking application to start writing notes.
        </p>
      </div>
      
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%'
      }}>
        <div style={{ marginBottom: '2vh', width: '100%' }}>
          <p style={{ fontWeight: '600', marginBottom: '1vh', color: '#2c3e50', fontSize: 'clamp(13px, 1.5vw, 15px)' }}>Upload PDF</p>
          <div style={{ 
            border: '1px solid black',
            borderRadius: '4px',
            backgroundColor: 'white',
            padding: '10px',
            marginBottom: '10px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row',
                alignItems: 'center', 
                width: '100%',
                flexWrap: 'wrap'
              }}>
                <label 
                  htmlFor="pdf-file-input" 
                  style={{ 
                    padding: '8px 12px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px',
                    marginBottom: '5px',
                    fontSize: 'clamp(12px, 1.4vw, 14px)'
                  }}
                >
                  Choose File
                </label>
                <span style={{ 
                  fontSize: 'clamp(12px, 1.4vw, 14px)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}>
                  {file ? file.name : 'No file chosen'}
                </span>
                <input
                  id="pdf-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  style={{ 
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    padding: '0',
                    margin: '-1px',
                    overflow: 'hidden',
                    clip: 'rect(0,0,0,0)',
                    border: '0'
                  }}
                  key={file ? 'pdf-input-with-file' : 'pdf-input-empty'}
                />
              </div>
            </div>
            <p style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', marginTop: '10px', marginBottom: '0' }}>Maximum file size: 50MB</p>
          </div>
        </div>
        
        {file && (
          <div style={{ marginBottom: '2vh', width: '100%' }}>
            <button
              onClick={clearFile}
              style={{
                padding: '0.5vh 1%',
                backgroundColor: 'white',
                border: '1px solid black',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Document
            </button>
          </div>
        )}
        
        <div style={{ marginBottom: '2vh', width: '100%' }}>
          <p style={{ fontWeight: '600', marginBottom: '1vh', color: '#2c3e50', fontSize: 'clamp(13px, 1.5vw, 15px)' }}>Note Space Width: <span style={{ color: '#4b5563', fontSize: 'clamp(14px, 1.6vw, 16px)' }}>{noteSpaceWidth}%</span></p>
          <div style={{ 
            border: '1px solid black',
            borderRadius: '4px',
            backgroundColor: 'white',
            padding: '10px',
            marginBottom: '10px',
            width: '100%'
          }}>
            <div style={{ width: '100%', maxWidth: '100%', marginBottom: '10px' }}>
              <input
                ref={sliderRef}
                type="range"
                min="10"
                max="150"
                value={noteSpaceWidth}
                onChange={(e) => setNoteSpaceWidth(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(10px, 1.2vw, 12px)', width: '100%' }}>
              <span>10%</span>
              <span>150%</span>
            </div>
            
            {/* Preset size buttons */}
            <div style={{ marginTop: '15px', width: '100%' }}>
              <p style={{ fontSize: 'clamp(12px, 1.4vw, 14px)', marginBottom: '10px' }}>Preset Sizes:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2%', width: '100%' }}>
                <button
                  onClick={() => setNoteSpaceWidth(30)}
                  style={{
                    padding: '0.5vh 1%',
                    backgroundColor: noteSpaceWidth === 30 ? '#e6e6e6' : 'white',
                    border: noteSpaceWidth === 30 ? '2px solid black' : '1px solid black',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: '1'
                  }}
                >
                  S (30%)
                </button>
                <button
                  onClick={() => setNoteSpaceWidth(70)}
                  style={{
                    padding: '0.5vh 1%',
                    backgroundColor: noteSpaceWidth === 70 ? '#e6e6e6' : 'white',
                    border: noteSpaceWidth === 70 ? '2px solid black' : '1px solid black',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: '1'
                  }}
                >
                  M (70%)
                </button>
                <button
                  onClick={() => setNoteSpaceWidth(100)}
                  style={{
                    padding: '0.5vh 1%',
                    backgroundColor: noteSpaceWidth === 100 ? '#e6e6e6' : 'white',
                    border: noteSpaceWidth === 100 ? '2px solid black' : '1px solid black',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: '1'
                  }}
                >
                  L (100%)
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Note Space Position selector */}
        <div style={{ marginBottom: '2vh', width: '100%' }}>
          <p style={{ fontWeight: '600', marginBottom: '1vh', color: '#2c3e50', fontSize: 'clamp(13px, 1.5vw, 15px)' }}>Note Space Position</p>
          
          <div style={{ width: '100%' }}>
            <div 
              style={{ 
                border: '1px solid black',
                borderRadius: '4px',
                backgroundColor: 'white',
                padding: '10px',
                marginBottom: '10px',
                width: '100%',
                cursor: 'pointer'
              }}
              onClick={() => setNoteSpacePosition('right')}
            >
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                <input 
                  type="checkbox" 
                  checked={noteSpacePosition === 'right'} 
                  onChange={() => setNoteSpacePosition('right')} 
                  style={{ marginRight: '10px' }}
                />
                Right
              </label>
            </div>
            
            <div 
              style={{ 
                border: '1px solid black',
                borderRadius: '4px',
                backgroundColor: 'white',
                padding: '10px',
                marginBottom: '10px',
                width: '100%',
                cursor: 'pointer'
              }}
              onClick={() => setNoteSpacePosition('left')}
            >
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                <input 
                  type="checkbox" 
                  checked={noteSpacePosition === 'left'} 
                  onChange={() => setNoteSpacePosition('left')} 
                  style={{ marginRight: '10px' }}
                />
                Left
              </label>
            </div>
            
            <div 
              style={{ 
                border: '1px solid black',
                borderRadius: '4px',
                backgroundColor: 'white',
                padding: '10px',
                marginBottom: '10px',
                width: '100%',
                cursor: 'pointer'
              }}
              onClick={() => setNoteSpacePosition('top')}
            >
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                <input 
                  type="checkbox" 
                  checked={noteSpacePosition === 'top'} 
                  onChange={() => setNoteSpacePosition('top')} 
                  style={{ marginRight: '10px' }}
                />
                Top
              </label>
            </div>
            
            <div 
              style={{ 
                border: '1px solid black',
                borderRadius: '4px',
                backgroundColor: 'white',
                padding: '10px',
                width: '100%',
                cursor: 'pointer'
              }}
              onClick={() => setNoteSpacePosition('bottom')}
            >
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                <input 
                  type="checkbox" 
                  checked={noteSpacePosition === 'bottom'} 
                  onChange={() => setNoteSpacePosition('bottom')} 
                  style={{ marginRight: '10px' }}
                />
                Bottom
              </label>
            </div>
          </div>
          
          <p style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', margin: '1vh 0 0 0' }}>
            Select where to add the note space on each page
          </p>
        </div>
        
        {/* Note Space Color section */}
        <div style={{ marginBottom: '2vh', width: '100%' }}>
          <p style={{ fontWeight: '600', marginBottom: '1vh', color: '#2c3e50', fontSize: 'clamp(13px, 1.5vw, 15px)' }}>Note Space Color</p>
          
          <div style={{ width: '100%' }}>
            <div 
              style={{ 
                border: '1px solid black',
                borderRadius: '4px',
                backgroundColor: 'white',
                padding: '10px',
                marginBottom: '10px',
                width: '100%',
                cursor: 'pointer'
              }}
              onClick={() => setColorOption('white')}
            >
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                <input
                  type="radio"
                  id="colorWhite"
                  name="colorOption"
                  checked={colorOption === 'white'}
                  onChange={() => setColorOption('white')}
                  style={{ cursor: 'pointer', marginRight: '8px' }}
                />
                <span style={{ fontSize: 'clamp(12px, 1.4vw, 14px)' }}>White (Default)</span>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #ccc',
                  marginLeft: '8px'
                }}></div>
              </label>
            </div>
            
            <div 
              style={{ 
                border: '1px solid black',
                borderRadius: '4px',
                backgroundColor: 'white',
                padding: '10px',
                width: '100%',
                cursor: 'pointer'
              }}
              onClick={() => setColorOption('custom')}
            >
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                <input
                  type="radio"
                  id="colorCustom"
                  name="colorOption"
                  checked={colorOption === 'custom'}
                  onChange={() => setColorOption('custom')}
                  style={{ cursor: 'pointer', marginRight: '8px' }}
                />
                <span style={{ fontSize: 'clamp(12px, 1.4vw, 14px)' }}>Custom Color</span>
              </label>
            </div>
            
            {colorOption === 'custom' && (
              <div style={{ marginTop: '10px', width: '100%', padding: '0 10px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1%', marginBottom: '1vh' }}>
                  {predefinedColors.map((color) => (
                    <div
                      key={color.value}
                      onClick={() => setCustomColor(color.value)}
                      style={{
                        width: '25px',
                        height: '25px',
                        backgroundColor: color.value,
                        border: customColor === color.value ? '2px solid black' : '1px solid #ccc',
                        cursor: 'pointer',
                        borderRadius: '3px'
                      }}
                      title={color.name}
                    ></div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '2%' }}>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    style={{ width: '40px', height: '30px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        setCustomColor(value);
                      }
                    }}
                    style={{
                      width: '80px',
                      padding: '2%',
                      border: '1px solid #ccc',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Output Filename section */}
        <div style={{ marginBottom: '2vh', width: '100%' }}>
          <p style={{ fontWeight: '600', marginBottom: '1vh', color: '#2c3e50', fontSize: 'clamp(13px, 1.5vw, 15px)' }}>Output Filename</p>
          <div style={{ 
            border: '1px solid black',
            borderRadius: '4px',
            backgroundColor: 'white',
            padding: '10px',
            marginBottom: '10px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2%', width: '100%' }}>
              <div style={{ 
                display: 'flex', 
                flex: 1,
                border: '1px solid #ccc',
                borderRadius: '4px',
                overflow: 'hidden',
                height: 'auto',
                minHeight: '2.5rem'
              }}>
                <input
                  type="text"
                  value={baseFileName}
                  onChange={handleBaseFileNameChange}
                  style={{
                    flex: 1,
                    padding: '2%',
                    border: 'none',
                    outline: 'none',
                    minWidth: 0,
                    height: '100%',
                    boxSizing: 'border-box',
                    fontSize: 'clamp(12px, 1.4vw, 16px)'
                  }}
                  placeholder="Enter filename"
                />
                <span style={{ 
                  padding: '2%', 
                  backgroundColor: '#f0f0f0', 
                  color: '#666',
                  borderLeft: '1px solid #ccc',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  .pdf
                </span>
              </div>
              <button
                onClick={resetBaseFileName}
                style={{
                  padding: '2%',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  height: 'auto',
                  minHeight: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  fontSize: 'clamp(12px, 1.4vw, 16px)'
                }}
              >
                Reset
              </button>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginTop: '10px',
              gap: '2%'
            }}>
              <input
                type="checkbox"
                id="includeWithNotes"
                checked={includeWithNotes}
                onChange={handleCheckboxChange}
                style={{ cursor: 'pointer' }}
              />
              <label 
                htmlFor="includeWithNotes" 
                style={{ 
                  fontSize: 'clamp(12px, 1.4vw, 14px)',
                  cursor: 'pointer'
                }}
              >
                Include "_with_notes" in filename
              </label>
            </div>
          </div>
        </div>
        
        {file && (
          <>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '2%',
              gap: '2%',
              width: '100%'
            }}>
              <input
                type="checkbox"
                id="specifyLocation"
                checked={specifyLocation}
                onChange={(e) => setSpecifyLocation(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label 
                htmlFor="specifyLocation" 
                style={{ 
                  fontSize: 'clamp(12px, 1.4vw, 14px)',
                  cursor: 'pointer'
                }}
              >
                Specify where to save the document
              </label>
            </div>
            
            {!specifyLocation && (
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2%'
              }}>
                <div style={{
                  fontSize: 'clamp(10px, 1.2vw, 12px)',
                  color: '#777',
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2%',
                  padding: '1% 2%',
                  background: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: '4px',
                  maxWidth: 'fit-content',
                  whiteSpace: 'nowrap'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" fill="#888"/>
                  </svg>
                  <span>File will be saved to your browser's default Downloads folder</span>
                </div>
              </div>
            )}
            
            <div style={{ marginBottom: '3%', width: '100%' }}>
              <button
                onClick={handleDownload}
                disabled={downloadIsProcessing}
                style={{
                  width: '100%',
                  padding: '2%',
                  backgroundColor: 'white',
                  border: '1px solid black',
                  borderRadius: '4px',
                  cursor: downloadIsProcessing ? 'default' : 'pointer',
                  opacity: downloadIsProcessing ? 0.7 : 1,
                  fontSize: 'clamp(14px, 1.6vw, 16px)'
                }}
              >
                {downloadIsProcessing ? 'Processing...' : 'Download PDF'}
              </button>
              {successMessage && (
                <div style={{ 
                  marginTop: '2%', 
                  padding: '2%',
                  backgroundColor: '#e6f7e6',
                  border: '1px solid #c3e6cb',
                  borderRadius: '4px',
                  color: '#155724',
                  fontSize: 'clamp(12px, 1.4vw, 14px)',
                  textAlign: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  width: '100%'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2%' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" 
                        fill="currentColor"/>
                    </svg>
                    {successMessage}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Controls; 