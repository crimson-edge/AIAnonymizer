import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import RootLayoutClient from '@/components/RootLayoutClient'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://aianonymizer.com'),
  title: {
    default: 'AI Anonymizer - Secure & Private AI Interactions',
    template: '%s | AI Anonymizer'
  },
  description: 'Interact with AI models securely and privately. AI Anonymizer protects your data while enabling powerful AI capabilities.',
  keywords: ['AI', 'privacy', 'security', 'anonymizer', 'machine learning', 'data protection'],
  authors: [{ name: 'AI Anonymizer Team' }],
  creator: 'AI Anonymizer',
  publisher: 'AI Anonymizer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'AI Anonymizer - Secure & Private AI Interactions',
    description: 'Interact with AI models securely and privately. AI Anonymizer protects your data while enabling powerful AI capabilities.',
    url: 'https://aianonymizer.com',
    siteName: 'AI Anonymizer',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Anonymizer - Secure & Private AI Interactions',
    description: 'Interact with AI models securely and privately. AI Anonymizer protects your data while enabling powerful AI capabilities.',
    creator: '@AIAnonymizer',
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
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <RootLayoutClient className={inter.className}>
        {children}
      </RootLayoutClient>
    </html>
  )
}
