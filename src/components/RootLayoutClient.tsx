'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import KommunicateChat from '@/components/KommunicateChat';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/auth/AuthProvider';

interface RootLayoutClientProps {
  children: React.ReactNode;
  className: string;
}

export default function RootLayoutClient({ children, className }: RootLayoutClientProps) {
  const pathname = usePathname();

  return (
    <body className={className}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </div>
        {/* Only show Kommunicate chat on non-admin pages */}
        {!pathname?.startsWith('/admin') && <KommunicateChat />}
        <GoogleAnalytics />
        <Toaster position="top-right" />
      </AuthProvider>
    </body>
  );
}
