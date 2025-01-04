// Dynamically get the port from the server or use a default
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }

  if (process.env.NEXTAUTH_URL) {
    // Use explicitly set NEXTAUTH_URL
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }

  // Assume localhost
  return 'http://localhost:3000';
}

// Update NEXTAUTH_URL if needed
if (!process.env.NEXTAUTH_URL && typeof window === 'undefined') {
  process.env.NEXTAUTH_URL = getBaseUrl();
}
