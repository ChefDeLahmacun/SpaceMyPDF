'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaFileAlt } from 'react-icons/fa';
// MEMBERSHIP DISABLED: Components commented out for future re-enablement
// import UserStatus from './UserStatus';
// import MembershipModal from './MembershipModal';
import './Header.css';

const Header: React.FC = () => {
  // MEMBERSHIP DISABLED: Modal state commented out for future re-enablement
  // const [showMembershipModal, setShowMembershipModal] = useState(false);

  // MEMBERSHIP DISABLED: Sign-in handlers commented out for future re-enablement
  // const handleSignIn = () => {
  //   setShowMembershipModal(true);
  // };

  // const handleModalClose = () => {
  //   setShowMembershipModal(false);
  // };
  return (
    <div className="header-container">
      {/* Header content */}
      <div className="header-content">
        {/* Left side: Navigation buttons */}
        <nav className="nav-container left-nav">
          <Link href="/changelog" className="nav-link">
            Changelog
          </Link>
          {/* MEMBERSHIP DISABLED: Dashboard link hidden for now */}
          {/* <Link href="/dashboard" className="nav-link">
            Dashboard
          </Link> */}
          {/* Admin access remains available directly at /admin. Hidden here to avoid public auth checks. */}
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
            <h1 className="title-text">
              SpaceMyPDF
            </h1>
            <p className="subtitle-text">
              Add note space to your PDFs easily
            </p>
          </div>
        </div>
        
        {/* MEMBERSHIP DISABLED: Right side user status hidden for now */}
        {/* <div className="right-nav">
          <UserStatus onLogin={handleSignIn} />
        </div> */}
      </div>

      {/* MEMBERSHIP DISABLED: Membership Modal commented out for future re-enablement */}
      {/* <MembershipModal
        isOpen={showMembershipModal}
        onClose={handleModalClose}
        onSignUp={handleModalClose}
        onLogin={handleModalClose}
      /> */}
    </div>
  );
};

export default Header; 