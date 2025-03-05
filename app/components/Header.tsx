'use client';

import React from 'react';
import Image from 'next/image';
import { FaFileAlt } from 'react-icons/fa';

const Header: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      height: '100px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottom: '1px solid rgba(221, 221, 221, 0.5)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: '10px 0',
      boxSizing: 'border-box',
      background: 'linear-gradient(to right, #f0d6a7 0%, #edc077 50%, #f0d6a7 100%)',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Header content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          border: '1px solid rgba(221, 221, 221, 0.7)',
          padding: '3px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}>
          <Image 
            src="/images/Logo.png"
            alt="Document Extender Logo"
            width={60}
            height={60}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              transform: 'scale(1.1)'
            }}
            priority
          />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#2c3e50',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            <span>SpaceMyPDF</span>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#444',
            fontStyle: 'italic',
            marginTop: '2px'
          }}>
            Add note space to your PDFs easily
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 