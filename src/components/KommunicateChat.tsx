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
    (function(d, m){
      var kommunicateSettings = {
        "appId": "1a1569123e0df223da536d8a26c5417ff",
        "popupWidget": true,
        "automaticChatOpenOnNavigation": false
      };
      var s = document.createElement("script"); 
      s.type = "text/javascript"; 
      s.async = true;
      s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
      var h = document.getElementsByTagName("head")[0]; 
      h.appendChild(s);
      (window as any).kommunicate = m; 
      m._globals = kommunicateSettings;
    })(document, (window as any).kommunicate || {});

    // Cleanup function
    return () => {
      const widget = document.getElementById('kommunicate-widget-iframe');
      if (widget) {
        widget.remove();
      }
      const kmScript = document.querySelector('script[src*="kommunicate.app"]');
      if (kmScript) {
        kmScript.remove();
      }
      delete (window as any).kommunicate;
      delete (window as any).Kommunicate;
      delete (window as any).kommunicateSettings;
    };
  }, []);

  return null;
}
