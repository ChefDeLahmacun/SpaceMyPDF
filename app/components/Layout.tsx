import React, { ReactNode, useState, useEffect, useRef, createContext, useLayoutEffect } from 'react';

// Create a context to pass the ref to children
export const GreenContentRefContext = createContext<React.RefObject<HTMLDivElement> | null>(null);

interface LayoutProps {
  children: ReactNode;
  feedbackSectionNeedsExtraHeight?: boolean;
  feedbackSubmitted?: boolean;
}

const Layout = ({ children, feedbackSectionNeedsExtraHeight, feedbackSubmitted = false }: LayoutProps) => {
  // Define dimensions using viewport-relative units and percentages
  const headerHeight = '10vh'; // Was 100px
  const [featuresHeight, setFeaturesHeight] = useState('auto');
  const minGreenSectionHeight = '95vh'; // Was 950px
  const feedbackHeight = feedbackSubmitted ? '65vh' : (feedbackSectionNeedsExtraHeight ? '70vh' : '60vh'); // Increased heights for more padding
  
  // Adjust side box width based on screen size
  const [sideBoxWidth, setSideBoxWidth] = useState('12%');
  
  // Start with a reasonable default height
  const [greenSectionHeight, setGreenSectionHeight] = useState(minGreenSectionHeight);
  const greenContentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  // Function to update green section height
  const updateGreenSectionHeight = () => {
    if (greenContentRef.current) {
      const contentHeight = greenContentRef.current.scrollHeight;
      const minHeight = window.innerHeight * 0.95; // 95vh in pixels
      
      if (contentHeight > minHeight) {
        setGreenSectionHeight(`${contentHeight}px`);
      } else {
        setGreenSectionHeight(minGreenSectionHeight);
      }
    }
  };

  // Function to update features section height
  const updateFeaturesHeight = () => {
    if (featuresRef.current) {
      const contentHeight = featuresRef.current.scrollHeight;
      // Set minimum height to ensure all content is visible
      setFeaturesHeight(`max(32vh, ${contentHeight}px)`);
    }
  };
  
  // Update side box width based on screen size
  const updateSideBoxWidth = () => {
    if (window.innerWidth <= 768) {
      setSideBoxWidth('5%'); // Smaller side boxes on mobile
    } else {
      setSideBoxWidth('12%'); // Original size on desktop
    }
  };
  
  // Use useLayoutEffect for initial height calculation
  useLayoutEffect(() => {
    updateSideBoxWidth();
    if (greenContentRef.current) {
      updateGreenSectionHeight();
    }
    updateFeaturesHeight();
  }, []);
  
  // Add resize listener to adjust heights on window resize
  useEffect(() => {
    const handleResize = () => {
      updateSideBoxWidth();
      updateGreenSectionHeight();
      updateFeaturesHeight();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update height when content changes
  useEffect(() => {
    updateGreenSectionHeight();
    updateFeaturesHeight();
  }, [children]);
  
  return (
    <GreenContentRefContext.Provider value={greenContentRef}>
      <div style={{ 
        width: '100%', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden', // Changed from visible to hidden to prevent content from extending
        backgroundColor: '#f2c4aa',
        border: 'none',
        outline: 'none',
        display: 'flex',
        justifyContent: 'center' // Center the content horizontally
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%', // Was 1560px
          margin: '0 auto'
        }}>
          {/* Background color sections */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: headerHeight,
            backgroundColor: '#edc077',
            zIndex: 0
          }}></div>
          
          <div 
            ref={featuresRef}
            style={{
              position: 'absolute',
              top: headerHeight,
              left: 0,
              width: '100%',
              height: featuresHeight,
              backgroundColor: '#dae1f0',
              zIndex: 0
            }}
          ></div>
          
          {/* Green section with dynamic height */}
          <div id="greenSection" style={{
            position: 'absolute',
            top: `calc(${headerHeight} + ${featuresHeight})`,
            left: sideBoxWidth,
            width: `calc(100% - (${sideBoxWidth} * 2))`,
            height: greenSectionHeight,
            minHeight: minGreenSectionHeight,
            backgroundColor: '#c7edd4', /* Original green color for the preview section */
            zIndex: 3,
            overflow: 'hidden', /* Add overflow hidden to prevent content from extending outside */
            boxSizing: 'border-box'
          }}></div>
          
          <div className="feedback-section" style={{
            position: 'absolute',
            top: `calc(${headerHeight} + ${featuresHeight} + ${greenSectionHeight})`,
            left: sideBoxWidth,
            width: `calc(100% - (${sideBoxWidth} * 2))`,
            height: feedbackHeight,
            zIndex: 2,
            backgroundColor: '#c7b5e8', /* Add explicit background color to feedback section */
            borderBottomLeftRadius: '30px',
            borderBottomRightRadius: '30px',
            overflow: 'hidden'
          }}></div>
          
          {/* Left side box */}
          <div style={{
            backgroundColor: 'rgb(var(--background-rgb))',
            width: sideBoxWidth,
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            height: '100%',
            zIndex: 1
          }}></div>
          
          {/* Right side box */}
          <div style={{
            backgroundColor: 'rgb(var(--background-rgb))',
            width: sideBoxWidth,
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            height: '100%',
            zIndex: 1
          }}></div>
          
          {/* Main content */}
          <div style={{
            position: 'relative',
            width: `calc(100% - (${sideBoxWidth} * 2))`,
            maxWidth: '100%', // Was 1200px
            margin: '0 auto',
            paddingTop: '0',
            zIndex: 4
          }}>
            {children}
          </div>
        </div>
      </div>
    </GreenContentRefContext.Provider>
  );
};

export default Layout;