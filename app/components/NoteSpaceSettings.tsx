import React from 'react';

interface NoteSpaceSettingsProps {
  noteSpaceWidth: number;
  setNoteSpaceWidth: (width: number) => void;
  noteSpacePosition: string;
  setNoteSpacePosition: (position: string) => void;
  colorOption: string;
  setColorOption: (option: string) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  predefinedColors: { name: string; value: string }[];
}

const NoteSpaceSettings = ({
  noteSpaceWidth,
  setNoteSpaceWidth,
  noteSpacePosition,
  setNoteSpacePosition,
  colorOption,
  setColorOption,
  customColor,
  setCustomColor,
  predefinedColors
}: NoteSpaceSettingsProps) => {
  
  return (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '15px' }}>Note Space Settings</h3>
      
      {/* Width settings */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Note Space Width: <span style={{ color: '#4b5563', fontSize: '16px' }}>{noteSpaceWidth}%</span></p>
        <div style={{ width: '95%', maxWidth: '350px', marginBottom: '5px' }}>
          <input
            type="range"
            min="10"
            max="150"
            value={noteSpaceWidth}
            onChange={(e) => setNoteSpaceWidth(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', width: '95%', maxWidth: '350px' }}>
          <span>10%</span>
          <span>150%</span>
        </div>
        
        {/* Preset size buttons */}
        <div style={{ marginTop: '10px' }}>
          <p style={{ fontSize: '14px', marginBottom: '5px' }}>Preset Sizes:</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'S', value: 30 },
              { label: 'M', value: 70 },
              { label: 'L', value: 100 },
              { label: 'XL', value: 150 }
            ].map((size) => (
              <button
                key={size.label}
                onClick={() => setNoteSpaceWidth(size.value)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: noteSpaceWidth === size.value ? '#e6e6e6' : 'white',
                  border: noteSpaceWidth === size.value ? '2px solid black' : '1px solid black',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                {size.label} ({size.value}%)
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Note Space Position selector */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Note Space Position</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['right', 'left', 'top', 'bottom'].map((position) => (
              <button
                key={position}
                onClick={() => setNoteSpacePosition(position)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: noteSpacePosition === position ? '#e6e6e6' : 'white',
                  border: noteSpacePosition === position ? '2px solid black' : '1px solid black',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  flex: '1 0 calc(50% - 10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '80px'
                }}
              >
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  marginRight: '5px',
                  position: 'relative',
                  border: '1px solid #666',
                  borderRadius: '2px'
                }}>
                  <div style={{
                    position: 'absolute',
                    backgroundColor: '#666',
                    ...(position === 'right' ? { right: 0, top: 0, bottom: 0, width: '30%' } :
                      position === 'left' ? { left: 0, top: 0, bottom: 0, width: '30%' } :
                      position === 'top' ? { top: 0, left: 0, right: 0, height: '30%' } :
                      { bottom: 0, left: 0, right: 0, height: '30%' })
                  }}></div>
                </div>
                {position}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Color settings */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Note Space Color</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
              <input
                type="radio"
                name="colorOption"
                value="white"
                checked={colorOption === 'white'}
                onChange={() => setColorOption('white')}
              />
              White
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="radio"
                name="colorOption"
                value="custom"
                checked={colorOption === 'custom'}
                onChange={() => setColorOption('custom')}
              />
              Custom Color
            </label>
          </div>
          
          {colorOption === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={{ width: '100px', height: '30px' }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setCustomColor(color.value)}
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: color.value,
                      border: customColor === color.value ? '2px solid black' : '1px solid #ccc',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteSpaceSettings; 