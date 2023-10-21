import React, { useEffect, useState } from 'react';
import PrimaryButton from '../PrimaryButton/PrimaryButton';

interface MessageOverlayProps {
  text: string | null;
  onClose?: () => void;
}

const MessageOverlay: React.FC<MessageOverlayProps> = ({ text, onClose }) => {
  
  const [isVisible, setIsVisible] = useState(true); 

  useEffect(() => {

    if (text) {
      const fadeOutTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      const removeOverlayTimeout = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 2500);  

      return () => {
        clearTimeout(fadeOutTimeout);
        clearTimeout(removeOverlayTimeout);
      };
    }
  }, [text, onClose]);

  if (!text || !text.length) return null;

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
      zIndex: 1000,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.5s'
    }}>
      <PrimaryButton>{text}</PrimaryButton>
    </div>
  );
}

export default MessageOverlay;