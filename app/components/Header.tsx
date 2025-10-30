'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaFileAlt } from 'react-icons/fa';
import UserStatus from './UserStatus';
import MembershipModal from './MembershipModal';
import './Header.css';

const Header: React.FC = () => {
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if current user is admin
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAdmin(false);
          return;
        }

        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          // Check if user is admin from database
          setIsAdmin(user.isAdmin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
    
    // Listen for auth change events
    const handleAuthChange = () => {
      checkAdminStatus();
    };
    
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleSignIn = () => {
    setShowMembershipModal(true);
  };

  const handleModalClose = () => {
    setShowMembershipModal(false);
  };
  return (
    <div className="header-container">
      {/* Header content */}
      <div className="header-content">
        {/* Left side: Navigation buttons */}
        <nav className="nav-container left-nav">
          <Link href="/changelog" className="nav-link">
            Changelog
          </Link>
          <Link href="/dashboard" className="nav-link">
            Dashboard
          </Link>
          {isAdmin && (
            <Link href="/admin" className="nav-link admin-link">
              Admin
            </Link>
          )}
        </nav>
        
        {/* Center: Logo and title */}
        <div className="center-container">
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
        
        {/* Right side: User status */}
        <div className="right-nav">
          <UserStatus onLogin={handleSignIn} />
        </div>
      </div>

      {/* Membership Modal */}
      <MembershipModal
        isOpen={showMembershipModal}
        onClose={handleModalClose}
        onSignUp={handleModalClose}
        onLogin={handleModalClose}
      />
    </div>
  );
};

export default Header; 