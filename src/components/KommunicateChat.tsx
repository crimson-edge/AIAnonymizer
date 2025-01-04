'use client';

import Script from 'next/script';

declare global {
  interface Window {
    kommunicate?: any;
    kommunicateSettings?: any;
  }
}

export default function KommunicateChat() {
  return (
    <>
      <Script
        id="kommunicate-script"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.kommunicateSettings = {
              "appId": "1a1569123e0df223da536d8a26c5417ff",
              "popupWidget": true,
              "automaticChatOpenOnNavigation": true
            };
          `
        }}
      />
      <Script
        src="https://widget.kommunicate.io/v2/kommunicate.app"
        strategy="lazyOnload"
      />
    </>
  );
}
