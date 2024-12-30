'use client';

import { useState } from 'react';
import Link from 'next/link';

const navigation = [
  { name: 'Features', href: '/#features' },
  { name: 'About', href: '/#about' },
  { name: 'Pricing', href: '/#pricing' },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white border-b border-gray-200 z-50">
      <nav className="mx-auto max-w-6xl px-4 h-16">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-x-2">
            <div className="w-8 h-8 rounded-lg bg-[rgb(var(--facebook-blue))] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">AI Anonymizer</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:gap-x-8">
            {navigation.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-[rgb(var(--facebook-blue))] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[rgb(var(--facebook-blue-hover))]"
            >
              Sign up free
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
              href="/login"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <div className="px-4 py-2">
              <Link
                href="/signup"
                className="block w-full text-center bg-[rgb(var(--facebook-blue))] text-white rounded-lg py-2 text-sm font-medium hover:bg-[rgb(var(--facebook-blue-hover))]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up free
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
