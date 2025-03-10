'use client';

import React from 'react';
import Image from 'next/image';
import { FaFileAlt } from 'react-icons/fa';
import './Header.css';

const Header: React.FC = () => {
  return (
    <div className="header-container">
      {/* Header content */}
      <div className="header-content">
        <div className="logo-container">
          <Image 
            src="/images/Logo.png"
            alt="Document Extender Logo"
            width={60}
            height={60}
            className="logo-image"
            priority
          />
        </div>
        <div className="title-container">
          <div className="title-text">
            <span>SpaceMyPDF</span>
          </div>
          <div className="subtitle-text">
            Add note space to your PDFs easily
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 