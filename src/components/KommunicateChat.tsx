'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kommunicate?: any;
    Kommunicate?: any;
    kommunicateSettings?: {
      appId: string;
      popupWidget: boolean;
      automaticChatOpenOnNavigation: boolean;
      onInit?: () => void;
    };
  }
}

export default function KommunicateChat() {
  const initialized = useRef(false);

  const initializeKommunicate = () => {
    if (initialized.current) return;
    
    try {
      window.kommunicateSettings = {
        "appId": "1a1569123e0df223da536d8a26c5417ff",
        "popupWidget": true,
        "automaticChatOpenOnNavigation": true,
        "onInit": function() {
          console.log('Kommunicate initialized successfully');
          // Set any additional settings after initialization
          if (window.Kommunicate) {
            window.Kommunicate.displayKommunicateWidget(true);
          }
        }
      };
      initialized.current = true;
    } catch (error) {
      console.error('Error initializing Kommunicate:', error);
    }
  };

  // Initialize settings before script loads
  useEffect(() => {
    initializeKommunicate();
  }, []);

  return (
    <>
      <Script
        id="kommunicate-script"
        src="https://widget.kommunicate.io/v2/kommunicate.app"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Kommunicate script loaded');
          // Re-initialize after script loads to ensure proper setup
          initializeKommunicate();
        }}
        onError={(e) => {
          console.error('Error loading Kommunicate script:', e);
        }}
      />
    </>
  );
}
