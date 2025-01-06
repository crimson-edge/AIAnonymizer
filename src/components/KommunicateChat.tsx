'use client';

import { useEffect, useRef } from 'react';

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
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    // Initialize settings first
    window.kommunicateSettings = {
      "appId": "1a1569123e0df223da536d8a26c5417ff",
      "popupWidget": true,
      "automaticChatOpenOnNavigation": true
    };

    // Create and load script manually
    const script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.src = 'https://widget.kommunicate.io/v2/kommunicate.app';
    script.onload = () => {
      console.log('Kommunicate script loaded manually');
      initialized.current = true;
    };
    script.onerror = (error) => {
      console.error('Error loading Kommunicate script:', error);
    };

    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      initialized.current = false;
    };
  }, []);

  return null;
}
