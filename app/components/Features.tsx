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
        gap: screenSize.isSmallMobile ? '2vh' : '1.5vh',
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
    if (screenSize.isSmallMobile) return '100%';
    if (screenSize.isMobile) return 'calc(50% - 1.5vh)';
    return 'calc(25% - 1.5vh)';
  };

  return (
    <div className="feature-card" style={{
      flex: `1 1 ${getFlexBasis()}`,
      padding: screenSize.isSmallMobile ? '2.5vh 3%' : '2vh 1.5%',
      height: 'auto',
      minHeight: screenSize.isSmallMobile ? '12vh' : '16vh',
      marginBottom: screenSize.isSmallMobile ? '1.5vh' : '1vh',
      minWidth: screenSize.isSmallMobile ? '100%' : '150px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        marginBottom: '1.8vh',
        flexWrap: screenSize.isSmallMobile ? 'wrap' : 'nowrap',
        gap: '8px'
      }}>
        <div style={{ 
          marginRight: screenSize.isSmallMobile ? '0' : '1%',
          flexShrink: 0
        }}>
          {icon}
        </div>
        <h3 style={{ 
          margin: '0', 
          fontSize: screenSize.isSmallMobile ? '16px' : 'clamp(15px, 1.6vw, 18px)',
          fontWeight: '600', 
          color: '#2c3e50',
          lineHeight: '1.3',
          wordWrap: 'break-word',
          hyphens: 'auto'
        }}>
          {title}
        </h3>
      </div>
      <p style={{ 
        margin: '0', 
        fontSize: 'clamp(12px, 1.4vw, 14px)',
        lineHeight: '1.5', 
        color: '#34495e',
        flex: 1,
        paddingTop: '0.4vh'
      }}>
        {description}
      </p>
    </div>
  );
};

export default Features; 