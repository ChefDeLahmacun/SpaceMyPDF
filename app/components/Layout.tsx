import React, { ReactNode, useState, useEffect, useRef, createContext, useLayoutEffect } from 'react';

// Create a context to pass the ref to children
export const GreenContentRefContext = createContext<React.RefObject<HTMLDivElement> | null>(null);

interface LayoutProps {
  children: ReactNode;
  feedbackSectionNeedsExtraHeight: boolean;
  feedbackSubmitted?: boolean;
}

const Layout = ({ children, feedbackSectionNeedsExtraHeight, feedbackSubmitted = false }: LayoutProps) => {
  // Define consistent dimensions
  const headerHeight = '100px';
  const featuresHeight = '280px';
  const minGreenSectionHeight = '950px'; // Minimum height
  const feedbackHeight = feedbackSubmitted ? '410px' : (feedbackSectionNeedsExtraHeight ? '500px' : '400px');
  const sideBoxWidth = '180px';
  
  // Start with a reasonable default height
  const [greenSectionHeight, setGreenSectionHeight] = useState(minGreenSectionHeight);
  const greenContentRef = useRef<HTMLDivElement>(null);
  
  // Function to update green section height
  const updateGreenSectionHeight = () => {
    if (greenContentRef.current) {
      const contentHeight = greenContentRef.current.scrollHeight;
      const minHeight = parseInt(minGreenSectionHeight);
      
      if (contentHeight > minHeight) {
        setGreenSectionHeight(`${contentHeight}px`);
      } else {
        setGreenSectionHeight(minGreenSectionHeight);
      }
    }
  };
  
  // Use useLayoutEffect for initial height calculation
  useLayoutEffect(() => {
    if (greenContentRef.current) {
      updateGreenSectionHeight();
    }
  }, []);
  
  // Use useEffect for ongoing updates
  useEffect(() => {
    // Set up a resize observer to detect content changes
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateGreenSectionHeight);
    });
    
    // Set up a mutation observer to detect DOM changes
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(updateGreenSectionHeight);
    });
    
    if (greenContentRef.current) {
      resizeObserver.observe(greenContentRef.current);
      mutationObserver.observe(greenContentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
    }
    
    // Also update on window resize
    window.addEventListener('resize', updateGreenSectionHeight);
    
    // Clean up
    return () => {
      if (greenContentRef.current) {
        resizeObserver.unobserve(greenContentRef.current);
        mutationObserver.disconnect();
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateGreenSectionHeight);
    };
  }, [minGreenSectionHeight]);
  
  return (
    <GreenContentRefContext.Provider value={greenContentRef}>
      <div style={{ 
        width: '100%', 
        minHeight: '85vh',
        position: 'relative',
        overflow: 'visible',
        backgroundColor: '#f2c4aa',
        border: 'none',
        outline: 'none',
        display: 'flex',
        justifyContent: 'center' // Center the content horizontally
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1560px', // Constrain the maximum width
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
          
          <div style={{
            position: 'absolute',
            top: headerHeight,
            left: 0,
            width: '100%',
            height: featuresHeight,
            backgroundColor: '#dae1f0',
            zIndex: 0
          }}></div>
          
          {/* Green section with dynamic height */}
          <div id="greenSection" style={{
            position: 'absolute',
            top: `calc(${headerHeight} + ${featuresHeight})`,
            left: 0,
            width: '100%',
            height: greenSectionHeight,
            backgroundColor: '#c7edd4', /* Original green color for the preview section */
            zIndex: 0
          }}></div>
          
          <div style={{
            position: 'absolute',
            top: `calc(${headerHeight} + ${featuresHeight} + ${greenSectionHeight})`,
            left: sideBoxWidth,
            width: `calc(100% - ${parseInt(sideBoxWidth) * 2}px)`,
            height: feedbackHeight,
            backgroundColor: '#c7caed',
            zIndex: 2,
            borderBottomLeftRadius: '30px',
            borderBottomRightRadius: '30px'
          }}></div>
          
          {/* Left side box */}
          <div style={{
            backgroundColor: '#f2c4aa',
            width: sideBoxWidth,
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 1
          }}></div>
          
          {/* Right side box */}
          <div style={{
            backgroundColor: '#f2c4aa',
            width: sideBoxWidth,
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}></div>
          
          {/* Main content */}
          <div style={{
            position: 'relative',
            width: `calc(100% - ${parseInt(sideBoxWidth) * 2}px)`,
            maxWidth: '1200px',
            margin: '0 auto',
            paddingTop: '0',
            zIndex: 3
          }}>
            {children}
          </div>
        </div>
      </div>
    </GreenContentRefContext.Provider>
  );
};

export default Layout;