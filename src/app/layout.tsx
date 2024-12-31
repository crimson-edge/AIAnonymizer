import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer';
import KommunicateChat from '@/components/KommunicateChat';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://aianonymizer.com'),
  title: {
    default: 'AI Anonymizer - Secure & Private AI Interactions',
    template: '%s | AI Anonymizer'
  },
  description: 'Protect your privacy with AI Anonymizer. Secure, anonymous access to AI language models. Keep your AI queries private and data protected with military-grade encryption.',
  keywords: [
    'AI privacy',
    'AI security',
    'AI anonymity',
    'anonymous AI',
    'private AI',
    'secure AI',
    'AI data protection',
    'AI query privacy',
    'confidential AI',
    'encrypted AI',
    'AI security service',
    'private AI chat',
    'secure language models',
    'AI privacy tool',
    'anonymous ChatGPT',
    'private GPT',
    'AI privacy protection',
    'secure AI access'
  ],
  openGraph: {
    title: 'AI Anonymizer - Secure & Private AI Interactions',
    description: 'Protect your privacy with AI Anonymizer. Secure, anonymous access to AI language models with military-grade encryption.',
    type: 'website',
    locale: 'en_US',
    url: 'https://aianonymizer.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Anonymizer - Secure & Private AI Interactions',
    description: 'Protect your privacy with AI Anonymizer. Secure, anonymous access to AI language models with military-grade encryption.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification_token',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </div>
        <KommunicateChat />
      </body>
    </html>
  );
}
