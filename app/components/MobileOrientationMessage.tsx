'use client';

import React, { useState, useEffect } from 'react';
import { FaMobileAlt, FaArrowsAltH } from 'react-icons/fa';

const MobileOrientationMessage: React.FC = () => {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    // Check if the device is a phone (not a tablet)
    const checkIfPhone = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      // Check if mobile device
      const isMobileDevice = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      // Check if NOT a tablet (exclude iPad and large screen devices)
      const isNotTablet = !/ipad/i.test(userAgent) && window.innerWidth < 480;
      
      setIsPhone(isMobileDevice && isNotTablet);
    };

    checkIfPhone();
    
    // Add resize listener to update if orientation changes
    window.addEventListener('resize', checkIfPhone);
    
    return () => {
      window.removeEventListener('resize', checkIfPhone);
    };
  }, []);

  if (!isPhone) {
    return null;
  }

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#e8d7e8', // Pale Mauve background
      padding: '1px 0',
      marginBottom: '0',
      borderBottom: '1px solid #ccc',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: '0.2vh 1%',
        borderRadius: '3px',
        margin: '0 auto',
        border: '1px solid #ddd',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        width: '95%',
        maxWidth: '500px',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          marginRight: '4px'
        }}>
          <FaMobileAlt style={{ transform: 'rotate(90deg)', color: '#4a6741', fontSize: '8px' }} />
          <FaArrowsAltH style={{ color: '#4a6741', fontSize: '8px' }} />
        </div>
        <p style={{ 
          fontSize: 'clamp(7px, 0.8vw, 9px)', 
          margin: '0', 
          lineHeight: '1.1', 
          color: '#34495e'
        }}>
          For best experience, use landscape mode.
        </p>
      </div>
    </div>
  );
};

export default MobileOrientationMessage; 