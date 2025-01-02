'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'Pricing', href: '/pricing' },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white border-b border-gray-200 z-50">
      <nav className="mx-auto max-w-6xl px-4 h-16">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-x-2">
            <div className="w-10 h-10 relative">
              <Image
                src="/logo.svg"
                alt="AI Anonymizer"
                width={40}
                height={40}
                priority
              />
            </div>
            <span className="text-xl font-bold text-gray-900">AI Anonymizer</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:gap-x-8">
            {navigation.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/auth/signin" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
              Log in
            </Link>
            <Link
              href="/pricing"
              className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Get started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2">
            {navigation.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 my-2"></div>
            <Link
              href="/auth/signin"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
            <div className="px-4 py-2">
              <Link
                href="/pricing"
                className="block w-full text-center bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
