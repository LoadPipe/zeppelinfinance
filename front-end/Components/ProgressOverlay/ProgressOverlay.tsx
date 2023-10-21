import React from 'react';

interface ProgressOverlayProps {
  visible: boolean;
}

const ProgressOverlay: React.FC<ProgressOverlayProps> = ({ visible }) => {
  if (!visible) 
    return null; 
    
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      zIndex: 1000
    }}>
      <img src="/spinner3.gif"></img>
    </div>
  );
}

export default ProgressOverlay;