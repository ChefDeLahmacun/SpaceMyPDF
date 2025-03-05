'use client';

import React from 'react';
import { FaUserFriends, FaSlidersH, FaLock, FaGift } from 'react-icons/fa';

const Features: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      height: '280px',
      padding: '15px 20px 15px 20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 2,
      overflow: 'hidden'
    }}>
      {/* AI-created info banner */}
      <div style={{
        width: 'calc(100% - 20px)',
        margin: '0 auto',
        padding: '5px 10px',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: '5px',
        textAlign: 'center',
        fontSize: '13px',
        color: '#555',
        marginBottom: '10px',
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
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: '22px',
        fontWeight: '600',
        letterSpacing: '0.5px'
      }}>
        How This Tool Helps You
      </h2>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '12px',
        height: '170px',
        overflow: 'visible'
      }}>
        <FeatureCard 
          icon={<FaUserFriends size={24} color="#4a6741" />}
          title="Easy to Use"
          description="Add note space to your PDFs with just a few clicks. Perfect for students, researchers, and anyone who takes notes."
        />
        
        <FeatureCard 
          icon={<FaSlidersH size={24} color="#4a6741" />}
          title="Make It Your Own"
          description="Choose where you want your note space and how it looks. Pick the width, position, and color that works best for you."
        />
        
        <FeatureCard 
          icon={<FaLock size={24} color="#4a6741" />}
          title="Your Documents Stay Private"
          description="Everything happens on your computer. Your documents never get uploaded to any server, keeping your information safe."
        />
        
        <FeatureCard 
          icon={<FaGift size={24} color="#4a6741" />}
          title="Always Free"
          description="Use this tool as much as you want without paying anything. No sign-ups, no subscriptions, no hidden costs."
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div style={{
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.7)',
      padding: '12px',
      borderRadius: '8px',
      height: '140px',
      overflow: 'visible',
      marginBottom: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
      minWidth: '200px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '12px',
        height: '32px' 
      }}>
        <div style={{ marginRight: '10px' }}>{icon}</div>
        <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>{title}</h3>
      </div>
      <p style={{ 
        margin: '0', 
        fontSize: '14px', 
        lineHeight: '1.4', 
        color: '#34495e',
        flex: 1,
        paddingTop: '4px'
      }}>
        {description}
      </p>
    </div>
  );
};

export default Features; 