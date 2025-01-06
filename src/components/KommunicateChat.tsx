'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    kommunicate?: any;
    Kommunicate?: any;
    kommunicateSettings?: {
      appId: string;
      popupWidget: boolean;
      automaticChatOpenOnNavigation: boolean;
    };
  }
}

export default function KommunicateChat() {
  useEffect(() => {
    // Initialize Kommunicate settings
    window.kommunicateSettings = {
      "appId": "1a1569123e0df223da536d8a26c5417ff",
      "popupWidget": true,
      "automaticChatOpenOnNavigation": true
    };
  }, []);

  return (
    <>
      <Script
        id="kommunicate-script"
        src="https://widget.kommunicate.io/v2/kommunicate.app"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Kommunicate script loaded');
        }}
        onError={(e) => {
          console.error('Error loading Kommunicate script:', e);
        }}
      />
    </>
  );
}
