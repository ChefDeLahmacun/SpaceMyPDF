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
      const isNotTablet = !/ipad/i.test(userAgent) && window.innerWidth < 768;
      
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
      padding: '8px 0',
      marginBottom: '0',
      borderBottom: '1px solid #ccc',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: '1vh 2%',
        borderRadius: '8px',
        margin: '0 auto',
        border: '1px solid #ddd',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        width: '90%',
        maxWidth: '600px',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginRight: '10px'
        }}>
          <FaMobileAlt style={{ transform: 'rotate(90deg)', color: '#4a6741' }} />
          <FaArrowsAltH style={{ color: '#4a6741' }} />
        </div>
        <p style={{ 
          fontSize: 'clamp(12px, 1.4vw, 14px)', 
          margin: '0', 
          lineHeight: '1.5', 
          color: '#34495e'
        }}>
          For the best experience, please use this website in landscape mode.
        </p>
      </div>
    </div>
  );
};

export default MobileOrientationMessage; 