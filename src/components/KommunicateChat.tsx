'use client';

import { useEffect } from 'react';

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
  useEffect(() => {
    // Prevent multiple initializations
    if (window.kommunicate || document.getElementById('kommunicate-widget-iframe')) {
      return;
    }

    // Initialize Kommunicate settings
    window.kommunicateSettings = {
      "appId": "1a1569123e0df223da536d8a26c5417ff",
      "popupWidget": true,
      "automaticChatOpenOnNavigation": true,
      "onInit": function() {
        // Ensure Kommunicate is properly initialized before using it
        if (window.Kommunicate) {
          window.Kommunicate.displayKommunicateWidget(true);
        }
      }
    };

    // Create script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://widget.kommunicate.io/v2/kommunicate.app';
    script.onload = () => console.log('Kommunicate script loaded');
    script.onerror = (error) => console.error('Error loading Kommunicate:', error);

    // Add script to document
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const widget = document.getElementById('kommunicate-widget-iframe');
      if (widget) {
        widget.remove();
      }
      // Remove the script
      const kmScript = document.querySelector('script[src*="kommunicate.app"]');
      if (kmScript) {
        kmScript.remove();
      }
      // Clean up global variables
      delete window.kommunicate;
      delete window.Kommunicate;
      delete window.kommunicateSettings;
    };
  }, []);

  return null;
}
