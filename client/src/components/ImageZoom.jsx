import React, { useState, useRef, useEffect } from 'react';

// SVG for custom zoom cursor
const zoomCursorSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8" fill="rgba(0,0,0,0.4)" stroke="white"></circle>
  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  <line x1="11" y1="8" x2="11" y2="14"></line>
  <line x1="8" y1="11" x2="14" y2="11"></line>
</svg>
`;

// Convert SVG to data URL for cursor
const zoomCursorDataURL = `data:image/svg+xml;base64,${btoa(zoomCursorSVG)}`;

const ImageZoom = ({ src, alt, width = '100%', height = 'auto', zoomScale = 2.5 }) => {
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowZoom(true);
    }
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current || !imageRef.current) return;

    // Get container dimensions and position
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate relative position within the container (0 to 1)
    const relativeX = (e.clientX - containerRect.left) / containerRect.width;
    const relativeY = (e.clientY - containerRect.top) / containerRect.height;
    
    // Ensure values are within bounds
    const boundedX = Math.max(0, Math.min(1, relativeX));
    const boundedY = Math.max(0, Math.min(1, relativeY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleTouchStart = (e) => {
    if (isMobile) {
      setShowZoom(true);
      handleTouchMove(e);
    }
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || !imageRef.current || !isMobile) return;
    
    e.preventDefault(); // Prevent scrolling while zooming
    
    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const relativeX = (touch.clientX - containerRect.left) / containerRect.width;
    const relativeY = (touch.clientY - containerRect.top) / containerRect.height;
    
    const boundedX = Math.max(0, Math.min(1, relativeX));
    const boundedY = Math.max(0, Math.min(1, relativeY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleTouchEnd = () => {
    setShowZoom(false);
  };

  // Calculate zoom background position
  const zoomStyle = {
    backgroundImage: `url(${src})`,
    backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
    backgroundSize: `${zoomScale * 100}%`,
    backgroundRepeat: 'no-repeat',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: showZoom ? 1 : 0,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease',
    zIndex: 2
  };

  // Custom cursor style
  const cursorStyle = {
    cursor: `url("${zoomCursorDataURL}") 12 12, zoom-in`,
  };

  return (
    <div className="image-zoom-container" style={{ position: 'relative', width, height, overflow: 'hidden' }}>
      <div 
        ref={containerRef}
        className="image-zoom-wrapper"
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%',
          ...cursorStyle
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          ref={imageRef}
          src={src} 
          alt={alt} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            display: 'block',
            position: 'relative',
            zIndex: 1
          }} 
        />
        <div style={zoomStyle}></div>
        
        {!showZoom && (
          <div className="zoom-hint" style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 3,
            pointerEvents: 'none'
          }}>
            {isMobile ? 'Tap and hold to zoom' : 'Hover to zoom'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageZoom;
