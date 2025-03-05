'use client';

import { useState, useEffect } from 'react';
import { FiMinimize2, FiMaximize2 } from 'react-icons/fi';

interface NoteSpaceControlProps {
  width: number;
  onChange: (width: number) => void;
}

export default function NoteSpaceControl({ width, onChange }: NoteSpaceControlProps) {
  const [localWidth, setLocalWidth] = useState(width);
  
  useEffect(() => {
    setLocalWidth(width);
  }, [width]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent any default scrolling behavior
    e.preventDefault();
    e.stopPropagation();
    
    const newWidth = parseInt(e.target.value);
    setLocalWidth(newWidth);
    onChange(newWidth);
  };

  const handlePresetClick = (e: React.MouseEvent, presetWidth: number) => {
    // Prevent any default scrolling behavior
    e.preventDefault();
    e.stopPropagation();
    
    setLocalWidth(presetWidth);
    onChange(presetWidth);
  };

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <label htmlFor="width-control" className="block text-sm font-medium text-gray-700">
          Note Space Width
        </label>
        <div className="flex items-center gap-2">
          <FiMinimize2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
            {localWidth}px
          </span>
          <FiMaximize2 className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        <input
          id="width-control"
          type="range"
          min="100"
          max="1000"
          step="50"
          value={localWidth}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            accent-violet-500 hover:accent-purple-500 transition-all duration-300"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'S', width: 200 },
          { label: 'M', width: 400 },
          { label: 'L', width: 600 },
          { label: 'XL', width: 800 }
        ].map(preset => (
          <button
            key={preset.width}
            onClick={(e) => handlePresetClick(e, preset.width)}
            className={`
              relative group overflow-hidden
              px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-300
              ${localWidth === preset.width
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'bg-white text-gray-600 hover:text-violet-600 hover:shadow-md'
              }
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <span className="relative">
              {preset.label} ({preset.width}px)
            </span>
          </button>
        ))}
      </div>
    </div>
  );
} 