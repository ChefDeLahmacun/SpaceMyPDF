'use client';

import React, { useState, useEffect } from 'react';
import { FaUserFriends, FaSlidersH, FaLock, FaGift } from 'react-icons/fa';

const Features: React.FC = () => {
  // Track different screen sizes for better responsiveness
  const [screenSize, setScreenSize] = useState({
    isSmallMobile: false,  // < 480px
    isMobile: false,       // < 768px
    isTablet: false        // < 1024px
  });

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isSmallMobile: width < 480,
        isMobile: width < 768,
        isTablet: width < 1024
      });
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="features-section" style={{
      width: '100%',
      padding: '1.5vh 2%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 10,
      backgroundColor: '#dae1f0'
    }}>
      {/* AI-created info banner */}
      <div style={{
        width: 'calc(100% - 2%)',
        margin: '0 auto',
        padding: '0.5vh 1%',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: '5px',
        textAlign: 'center',
        fontSize: 'clamp(11px, 1.3vw, 13px)',
        color: '#555',
        marginBottom: '1vh',
        boxSizing: 'border-box',
        wordWrap: 'break-word',
        maxWidth: '100%'
      }}>
        <p style={{ margin: '0', maxWidth: '100%' }}>
          <strong>About this tool:</strong> We created this to help you take better notes on your PDFs. We'd love to hear what you think!
        </p>
      </div>
      
      <h2 style={{
        textAlign: 'center',
        margin: '0 0 1.5vh 0',
        color: '#333',
        fontSize: 'clamp(18px, 2.2vw, 22px)',
        fontWeight: '600',
        letterSpacing: '0.5px'
      }}>
        How This Tool Helps You
      </h2>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: screenSize.isSmallMobile ? '1vh' : '1.5vh',
        height: 'auto',
        overflow: 'visible',
        marginBottom: '1.5vh',
        width: '100%'
      }}>
        <FeatureCard 
          icon={<FaUserFriends size={24} color="#4a6741" />}
          title="Easy to Use"
          description="Add note space to your PDFs with just a few clicks. Perfect for students, researchers, and anyone who takes notes."
          screenSize={screenSize}
        />
        
        <FeatureCard 
          icon={<FaSlidersH size={24} color="#4a6741" />}
          title="Make It Your Own"
          description="Choose where you want your note space and how it looks. Pick the width, position, and color that works best for you."
          screenSize={screenSize}
        />
        
        <FeatureCard 
          icon={<FaLock size={24} color="#4a6741" />}
          title="Your Documents Stay Private"
          description="Everything happens on your computer. Your documents never get uploaded to any server, keeping your information safe."
          screenSize={screenSize}
        />
        
        <FeatureCard 
          icon={<FaGift size={24} color="#4a6741" />}
          title="Always Free"
          description="Use this tool as much as you want without paying anything. No sign-ups, no subscriptions, no hidden costs."
          screenSize={screenSize}
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  screenSize: {
    isSmallMobile: boolean;
    isMobile: boolean;
    isTablet: boolean;
  };
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, screenSize }) => {
  // Calculate flex basis based on screen size
  const getFlexBasis = () => {
    if (screenSize.isSmallMobile) return 'calc(50% - 1vh)';
    if (screenSize.isMobile) return 'calc(50% - 1.5vh)';
    return 'calc(25% - 1.5vh)';
  };

  // Determine if we need to adjust the title for "Your Documents Stay Private"
  const isPrivacyTitle = title.includes("Private");
  const [isLandscape, setIsLandscape] = useState(false);
  
  // Check for landscape orientation
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsLandscape(window.innerWidth > window.innerHeight);
      }
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);
  
  return (
    <div className="feature-card" style={{
      flex: `1 1 ${getFlexBasis()}`,
      padding: screenSize.isSmallMobile ? '1.5vh 2%' : '2vh 1.5%',
      height: 'auto',
      minHeight: screenSize.isSmallMobile ? '10vh' : '16vh',
      marginBottom: screenSize.isSmallMobile ? '1vh' : '1vh',
      minWidth: screenSize.isSmallMobile ? 'calc(50% - 1vh)' : '150px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        marginBottom: screenSize.isSmallMobile ? '0.5vh' : '1vh', // Reduced margin for small mobile
        flexWrap: screenSize.isSmallMobile ? 'wrap' : 'nowrap',
        gap: screenSize.isSmallMobile ? '4px' : '8px', // Reduced gap for small mobile
        height: (isPrivacyTitle && isLandscape) ? 'auto' : (screenSize.isSmallMobile ? 'auto' : '40px'),
        minHeight: (isPrivacyTitle && isLandscape) ? '35px' : (screenSize.isSmallMobile ? '25px' : '40px') // Reduced min-height for small mobile
      }}>
        <div style={{ 
          marginRight: screenSize.isSmallMobile ? '0' : '1%',
          flexShrink: 0
        }}>
          {icon}
        </div>
        <h3 style={{ 
          margin: '0', 
          fontSize: screenSize.isSmallMobile ? 'clamp(12px, 1.3vw, 14px)' : 'clamp(13px, 1.4vw, 16px)', // Smaller font for small mobile
          fontWeight: '600', 
          color: '#2c3e50',
          lineHeight: '1.2',
          wordWrap: 'break-word',
          hyphens: 'auto',
          // Special handling for "Your Documents Stay Private" on horizontal phones
          ...(isPrivacyTitle && isLandscape && {
            fontSize: 'clamp(13px, 1.4vw, 16px)',
            lineHeight: '1.1',
            whiteSpace: 'normal',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          })
        }}>
          {isPrivacyTitle && isLandscape ? (
            <>
              <span>Your Documents</span>
              <span>Stay Private</span>
            </>
          ) : (
            title
          )}
        </h3>
      </div>
      <p style={{ 
        margin: '0', 
        fontSize: screenSize.isSmallMobile ? 'clamp(11px, 1.2vw, 13px)' : 'clamp(12px, 1.4vw, 14px)', // Smaller font for small mobile
        lineHeight: screenSize.isSmallMobile ? '1.3' : '1.4', // Tighter line height for small mobile
        color: '#34495e',
        flex: 1,
        paddingTop: '0'
      }}>
        {description}
      </p>
    </div>
  );
};

export default Features; 